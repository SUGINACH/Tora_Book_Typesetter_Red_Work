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
      settings: {}, evaluatedKindsByPage: {}
    });

    pageA.index = 1;
    pageB.index = 0;
    pageA.columns[0] = [];
    pageB.columns[0] = [line(10, 't1', 'אחד שני')];
    const second = adapter.snapshot({
      pages: [pageB, pageA], stage: 'refit', checkpointId: 'cp2', seq: 2,
      settings: {}, evaluatedKindsByPage: {}
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
    assert(snap.capture.reasons.includes('evaluated-kinds-not-supplied'));
  });

  it('includes footnotes, side notes, ornaments and divider geometry in the page inventory', () => {
    const adapter = createStepAuditModelAdapter();
    const footnote = { tokenId: 't3', noteIndex: 0, marker: '*', text: 'ביאור', heightPx: 32, lineH: 16 };
    const sideNote = { ownToken: 't4', anchorToken: 't5', text: 'צד', x: 745, yTop: 90, colWidth: 45, heightPx: 30 };
    const ornament = { kind: 'h2-ornament', slot: 'h2-top', kindStyle: 'plain', x: 100, y: 40, w: 20, h: 10 };
    const page = makePage(0, [
      [line(1, 't1', 'גוף')], [line(2, 't2', 'גוף נוסף')]
    ], {
      footnotes: [footnote], fnReservedHeightPx: 32,
      sideNotes: [sideNote], decorations: [ornament]
    });
    const snap = adapter.snapshot({
      pages: [page], stage: 'page-plan', checkpointId: 'cp1', seq: 1,
      settings: { 'footnote-columns': 1, 'footnote-separator-rule': 'regular', 'column-divider-style': 'thin', 'body-font-size-pt': 12 },
      evaluatedKindsByPage: {}
    });
    const roles = snap.checkpoint.pages[0].elements.map((e) => e.role);
    assert(roles.includes('footnote-area'));
    assert(roles.includes('footnote-fragment'));
    assert(roles.includes('side-note'));
    assert(roles.includes('ornament'));
    assert(roles.includes('divider'));
    assertEq(snap.capture.complete, true);
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
