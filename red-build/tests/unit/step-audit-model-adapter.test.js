// tests/unit/step-audit-model-adapter.test.js — RED model → normalized StepAudit snapshots
'use strict';

const { describe, it, assert, assertEq, report } = require('../harness');
const { createStepAuditModelAdapter } = require('../../src/engine/audit/step-audit-model-adapter');
const { buildStepAudit } = require('../../src/engine/audit/step-audit-reducer');

function template() {
  return {
    width: 800, height: 1100, gutter: 20,
    contentBox: { left: 50, right: 750, top: 80, bottom: 1000, width: 700, height: 920 },
    columns: [{ x: 405, w: 335 }, { x: 60, w: 335 }]
  };
}
function line(seq, tokenId, text, extra = {}) {
  return { seq, tokenId, kind: 'paragraph', words: text.split(' '), heightPx: 20, widthPx: 100, ...extra };
}
function makePage(index, columns = [[], []], extra = {}) {
  return {
    index, type: 'regular', template: template(), columns,
    footnotes: [], sideNotes: [], decorations: [], fnReservedHeightPx: 0,
    chapterOpening: false,
    ...extra
  };
}
const projection = {
  header: null, folio: null, decorations: [], lines: [], footnotes: []
};

describe('StepAudit RED model adapter', () => {
  it('uses page-object identity across reindexing and uses line seq as cross-page identity', () => {
    const adapter = createStepAuditModelAdapter();
    const pageA = makePage(0, [[line(10, 't1', 'אחד שני')], []]);
    const pageB = makePage(1, [[], []]);
    const first = adapter.snapshot({
      pages: [pageA, pageB], stage: 'page-plan', checkpointId: 'cp1', seq: 1,
      settings: {}, evaluatedKindsByPage: { 'page-object-1': [], 'page-object-2': [] }
    });

    pageA.index = 1;
    pageB.index = 0;
    pageA.columns[0] = [];
    pageB.columns[0] = [line(10, 't1', 'אחד שני')];
    const second = adapter.snapshot({
      pages: [pageB, pageA], stage: 'refit', checkpointId: 'cp2', seq: 2,
      settings: {}, evaluatedKindsByPage: { 'page-object-1': [], 'page-object-2': [] }
    });

    const firstPageIds = new Set(first.checkpoint.pages.map((p) => p.pageId));
    const secondPageIds = new Set(second.checkpoint.pages.map((p) => p.pageId));
    assertEq([...firstPageIds].sort(), [...secondPageIds].sort(), 'page identities survive reindexing/reordering');
    const merged = buildStepAudit({
      checkpoints: [first.checkpoint, second.checkpoint],
      issues: []
    });
    assertEq(merged.pageMoves.length, 1);
    assertEq(merged.pageMoves[0].elementId, 'line-seq-10');
  });

  it('maps a token-targeted Ledger issue only when its page fragment is unique', () => {
    const adapter = createStepAuditModelAdapter();
    const pageA = makePage(0, [[line(1, 't7', 'טקסט')], []]);
    const ledger = {
      issues: new Map([['runt-line@line@t7#1', {
        issue_id: 'runt-line@line@t7#1', kind: 'runt-line', target: 'line@t7', page: 0,
        first_seen_stage: 'page-plan', status: 'persists', transitions: [], candidates: []
      }]])
    };
    const snap = adapter.snapshot({
      pages: [pageA], ledger, stage: 'page-plan', checkpointId: 'cp1', seq: 1,
      settings: {}, evaluatedKindsByPage: { 'page-object-1': ['runt-line'] }
    });
    assertEq(snap.issues[0].mapStatus, 'mapped');
    assertEq(snap.issues[0].targetElementId, 'block-fragment:page-object-1:t7');
    assertEq(snap.checkpoint.pages[0].findings[0].issueId, 'runt-line@line@t7#1');
  });

  it('does not infer page identity from an index when no matching stage snapshot exists', () => {
    const adapter = createStepAuditModelAdapter();
    const pageA = makePage(4, [[line(1, 't9', 'טקסט')], []]);
    const ledger = { issues: new Map([['x', {
      issue_id: 'x', kind: 'containment', target: 'page#4c0', page: 4,
      first_seen_stage: 'protections', status: 'persists', transitions: [], candidates: []
    }]]) };
    const snap = adapter.snapshot({
      pages: [pageA], ledger, stage: 'render', checkpointId: 'cp1', seq: 1, settings: {}
    });
    assertEq(snap.issues[0].mapStatus, 'unmapped');
    assertEq(snap.issues[0].mapReason, 'no-stable-page-or-element-match');
    assert(snap.capture.reasons.includes('evaluated-kinds-not-supplied-for-page'));
  });

  it('includes footnotes, side notes, ornaments and divider geometry in the page inventory', () => {
    const adapter = createStepAuditModelAdapter();
    const footnote = { tokenId: 't3', noteIndex: 0, marker: '*', text: 'ביאור', heightPx: 32, lineH: 16 };
    const sideNote = { ownToken: 't4', anchorToken: 't5', text: 'צד', x: 745, yTop: 90, colWidth: 45, heightPx: 30 };
    const ornament = { kind: 'h2-ornament', slot: 'h2-top', kindStyle: 'plain', rollbackKey: 'h2-top:t1', x: 100, y: 40, w: 20, h: 10 };
    const page = makePage(0, [
      [line(1, 't1', 'גוף')], [line(2, 't2', 'גוף נוסף')]
    ], {
      footnotes: [footnote], fnReservedHeightPx: 32,
      sideNotes: [sideNote], decorations: [ornament]
    });
    const snap = adapter.snapshot({
      pages: [page], stage: 'page-plan', checkpointId: 'cp1', seq: 1,
      settings: { 'footnote-columns': 1, 'footnote-separator-rule': 'regular', 'column-divider-style': 'thin', 'body-font-size-pt': 12 },
      evaluatedKindsByPage: { 'page-object-1': [] }
    });
    const roles = snap.checkpoint.pages[0].elements.map((e) => e.role);
    assert(roles.includes('footnote-area'));
    assert(roles.includes('footnote-fragment'));
    assert(roles.includes('side-note'));
    assert(roles.includes('ornament'));
    assert(roles.includes('divider'));
    assertEq(snap.capture.complete, true);
  });

  it('matches model-projected ink bounds for double column rules and diamond footnote rules', () => {
    const adapter = createStepAuditModelAdapter();
    const note = { tokenId: 't3', noteIndex: 0, marker: '*', text: 'ביאור', heightPx: 32, lineH: 16 };
    const page = makePage(0, [
      [line(1, 't1', 'גוף')], [line(2, 't2', 'גוף נוסף')]
    ], { footnotes: [note], fnReservedHeightPx: 32 });
    const snap = adapter.snapshot({
      pages: [page], stage: 'page-plan', checkpointId: 'rules-1', seq: 1,
      settings: {
        'footnote-columns': 1,
        'footnote-separator-rule': 'diamond',
        'column-divider-style': 'double',
        'body-font-size-pt': 12
      },
      evaluatedKindsByPage: { 'page-object-1': [] }
    });
    const elements = snap.checkpoint.pages[0].elements;
    const fnRule = elements.find((element) => element.attributes.kind === 'fn-rule');
    const colRule = elements.find((element) => element.elementId === 'column-divider:page-object-1');
    assertEq({ x: fnRule.geometry.x, y: fnRule.geometry.y, w: fnRule.geometry.w }, { x: 196, y: 968, w: 408 });
    assertClose(fnRule.geometry.h, 1.4666666666666666, 1e-12, 'diamond footnote rule ink height');
    assertEq(colRule.geometry, { x: 403.75, y: 80, w: 2.5, h: 12 });
  });

  it('does not double-count endnote note records as body lines', () => {
    const adapter = createStepAuditModelAdapter();
    const note = { tokenId: 't31', noteIndex: 0, marker: '1', text: 'ביאור ארוך', heightPx: 44, colIdx: 0 };
    const page = makePage(0, [[note], []], {
      type: 'endnotes', isEndnotes: true, heading: 'הערות סיום', titleBandPx: 40,
      columns: [[note], []], notes: [note]
    });
    const snap = adapter.snapshot({
      pages: [page], stage: 'ledger-finalize', checkpointId: 'end1', seq: 4,
      settings: {}, evaluatedKindsByPage: {}
    });
    const rows = snap.checkpoint.pages[0].elements;
    assertEq(rows.filter((e) => e.role === 'body-line').length, 0);
    assertEq(rows.filter((e) => e.role === 'endnote-fragment').length, 1);
    assertEq(rows.filter((e) => e.elementId === 'line-object-line-1').length, 0);
  });

  it('treats a page-index map that changes within the same stage as ambiguous', () => {
    const adapter = createStepAuditModelAdapter();
    const pageA = makePage(0, [[], []]);
    adapter.snapshot({ pages: [pageA], stage: 'protections', checkpointId: 'p1', seq: 1, settings: {} });
    pageA.index = 1;
    const pageB = makePage(0, [[], []]);
    adapter.snapshot({ pages: [pageB, pageA], stage: 'protections', checkpointId: 'p2', seq: 2, settings: {} });
    const ledger = { issues: new Map([['x', {
      issue_id: 'x', kind: 'containment', target: 'page#0', page: 0,
      first_seen_stage: 'protections', status: 'persists', transitions: [], candidates: []
    }]]) };
    const snap = adapter.snapshot({
      pages: [pageB, pageA], ledger, stage: 'render', checkpointId: 'p3', seq: 3, settings: {}
    });
    assertEq(snap.issues[0].mapStatus, 'unmapped');
    assertEq(snap.issues[0].mapReason, 'page-index-map-changed-within-stage');
  });

  it('accepts an explicit Map of evaluated kinds and rejects a missing page entry', () => {
    const adapter = createStepAuditModelAdapter();
    const page = makePage(0, [[], []]);
    const missing = adapter.snapshot({ pages: [page], stage: 'measure', seq: 1, settings: {}, evaluatedKindsByPage: new Map() });
    assert(missing.capture.reasons.includes('evaluated-kinds-not-supplied-for-page'));
    const complete = adapter.snapshot({ pages: [page], stage: 'balance', seq: 2, settings: {}, evaluatedKindsByPage: new Map([['page-object-1', []]]) });
    assert(!complete.capture.reasons.includes('evaluated-kinds-not-supplied-for-page'));
  });

  it('does not map an opaque parenthetical target to page-flow', () => {
    const adapter = createStepAuditModelAdapter();
    const page = makePage(0, [[line(1, 't1', 'טקסט')], []]);
    const ledger = { issues: new Map([['paren', {
      issue_id: 'paren', kind: 'paren-cross-boundary', target: 'paren@span-1', page: 0,
      first_seen_stage: 'protections', status: 'persists', transitions: [], candidates: []
    }]]) };
    const snap = adapter.snapshot({
      pages: [page], ledger, stage: 'protections', seq: 1, settings: {},
      evaluatedKindsByPage: { 'page-object-1': ['paren-cross-boundary'] }
    });
    assertEq(snap.issues[0].mapStatus, 'unmapped');
    assertEq(snap.issues[0].targetElementId, null);
  });

  it('maps a globally unique line sequence when a page-index map is unavailable', () => {
    const adapter = createStepAuditModelAdapter();
    const page = makePage(0, [[line(77, 't77', 'שורה')], []]);
    const ledger = { issues: new Map([['reading', {
      issue_id: 'reading', kind: 'reading-order-break', target: 'page#99@seq77', page: 99,
      first_seen_stage: 'unknown-stage', status: 'persists', transitions: [], candidates: []
    }]]) };
    const snap = adapter.snapshot({
      pages: [page], ledger, stage: 'render', seq: 9, settings: {},
      evaluatedKindsByPage: { 'page-object-1': ['reading-order-break'] }
    });
    assertEq(snap.issues[0].mapStatus, 'mapped');
    assertEq(snap.issues[0].targetElementId, 'line-seq-77');
    assertEq(snap.issues[0].pageId, 'page-object-1');
  });

  it('marks note/decoration object-only identities incomplete', () => {
    const adapter = createStepAuditModelAdapter();
    const page = makePage(0, [[], []], {
      footnotes: [{ marker: '*', text: 'ללא מקור', heightPx: 18 }],
      decorations: [{ kind: 'ornament', slot: 'h2-top', x: 10, y: 10, w: 20, h: 10 }]
    });
    const snap = adapter.snapshot({
      pages: [page], stage: 'measure', seq: 1, settings: {},
      evaluatedKindsByPage: { 'page-object-1': [] }
    });
    assertEq(snap.capture.complete, false);
    assert(snap.capture.reasons.includes('footnote-fragment-without-stable-source-id'));
    assert(snap.capture.reasons.includes('decoration-without-stable-source-id'));
  });

  it('does not extract token or sequence IDs from opaque target strings', () => {
    const adapter = createStepAuditModelAdapter();
    const page = makePage(0, [[line(10, 't10', 'שורה')], []]);
    const ledger = { issues: new Map([
      ['opaque-token', {
        issue_id: 'opaque-token', kind: 'paren-cross-boundary', target: 'paren@span-t10', page: 0,
        first_seen_stage: 'protections', status: 'persists', transitions: [], candidates: []
      }],
      ['opaque-seq', {
        issue_id: 'opaque-seq', kind: 'paren-cross-boundary', target: 'paren@seq10', page: 0,
        first_seen_stage: 'protections', status: 'persists', transitions: [], candidates: []
      }]
    ]) };
    const snap = adapter.snapshot({
      pages: [page], ledger, stage: 'protections', seq: 1, settings: {},
      evaluatedKindsByPage: { 'page-object-1': ['paren-cross-boundary'] }
    });
    assertEq(snap.issues.map((issue) => issue.mapStatus), ['unmapped', 'unmapped']);
  });

  it('uses endnote title-band offset and full content width for a one-column endnote page', () => {
    const adapter = createStepAuditModelAdapter();
    const note = { tokenId: 't88', noteIndex: 2, marker: '3', text: 'הערת סיום', heightPx: 44 };
    const page = makePage(0, [[note]], {
      type: 'endnotes', heading: 'הערות סיום', titleBandPx: 40,
      columns: [[note]]
    });
    const snap = adapter.snapshot({
      pages: [page], stage: 'ledger-finalize', seq: 1, settings: {},
      evaluatedKindsByPage: { 'page-object-1': [] }
    });
    const column = snap.checkpoint.pages[0].elements.find((element) => element.role === 'column');
    const endnote = snap.checkpoint.pages[0].elements.find((element) => element.role === 'endnote-fragment');
    assertEq(column.geometry, { x: 50, y: 120, w: 700, h: 880 });
    assertEq(endnote.geometry, { x: 50, y: 120, w: 700, h: 44 });
    assertEq(endnote.parentId, 'endnote:t88:2');
    assertEq(endnote.columnId, 'column:page-object-1:0');
  });

  it('projects TOC group members as separate row geometries', () => {
    const adapter = createStepAuditModelAdapter();
    const page = makePage(0, [[], []], {
      type: 'toc-general',
      toc: { rows: [{ kind: 'group', items: [
        { tokenId: 't1', level: 3, text: 'כותרת א', label: '12' },
        { tokenId: 't2', level: 3, text: 'כותרת ב', label: '13' }
      ] }] }
    });
    const snap = adapter.snapshot({
      pages: [page], stage: 'toc', seq: 1, settings: {},
      evaluatedKindsByPage: { 'page-object-1': [] }
    });
    const items = snap.checkpoint.pages[0].elements.filter((element) => element.role === 'toc-group-item');
    assertEq(items.map((element) => element.geometry), [
      { x: 18, y: 70, w: 60, h: 24 },
      { x: 98, y: 70, w: 60, h: 24 }
    ]);
  });

  it('records a header separator as an explicit incomplete model element rather than inventing its rectangle', () => {
    const adapter = createStepAuditModelAdapter({
      projectPage: () => ({
        header: { y: 50, slots: [{ pos: 'right', text: 'כותרת', x: 600, w: 120, sizePt: 9 }] },
        folio: null, decorations: [], lines: [], footnotes: []
      })
    });
    const page = makePage(0, [[], []], { header: { separator: 'thin', slots: { right: { text: 'כותרת' } } } });
    const snap = adapter.snapshot({
      pages: [page], stage: 'headers', checkpointId: 'cp1', seq: 1,
      settings: {}, evaluatedKindsByPage: {}
    });
    const sep = snap.checkpoint.pages[0].elements.find((e) => e.role === 'divider' && e.attributes.style === 'thin');
    assert(sep);
    assertEq(sep.geometry, null);
    assert(snap.capture.reasons.includes('header-separator-rect-not-present-in-model'));
  });
});

report('step-audit-model-adapter');
