// tests/unit/step-audit-reducer.test.js — pure RED snapshot/delta reducer
'use strict';

const { describe, it, assert, assertEq, report } = require('../harness');
const { buildStepAudit } = require('../../src/engine/audit/step-audit-reducer');

function el(elementId, geometry, extra = {}) {
  return { elementId, role: 'paragraph-fragment', geometry, ...extra };
}
function page(extra = {}) {
  return {
    pageId: 'page-A', pageIndex: 0, pageType: 'regular',
    evaluatedKinds: ['column-imbalance'],
    metrics: { leftCapacity: 800, rightCapacity: 800 },
    elements: [el('body-1', { x: 10, y: 20, w: 200, h: 40 })],
    findings: [],
    ...extra
  };
}
function cp(checkpointId, seq, stage, pages, operationId) {
  return { checkpointId, seq, stage, operationId: operationId || null, pages };
}

describe('StepAudit reducer — pure page/element deltas', () => {
  it('records added, removed, moved, resized and restyled elements separately', () => {
    const before = page({ elements: [
      el('a', { x: 0, y: 0, w: 100, h: 20 }, { style: { fontSize: 12 } }),
      el('b', { x: 0, y: 30, w: 100, h: 20 })
    ] });
    const after = page({ elements: [
      el('a', { x: 3, y: 2, w: 110, h: 24 }, { style: { fontSize: 14 } }),
      el('c', { x: 0, y: 60, w: 100, h: 20 })
    ] });
    const result = buildStepAudit({ checkpoints: [cp('cp1', 1, 'page-plan', [before]), cp('cp2', 2, 'balance', [after], 'op-balance')] });
    const delta = result.pageDeltas[0];
    assertEq(delta.pageId, 'page-A');
    assertEq(delta.added.map(x => x.elementId), ['c']);
    assertEq(delta.removed.map(x => x.elementId), ['b']);
    assertEq(delta.moved.map(x => x.elementId), ['a']);
    assertEq(delta.resized.map(x => x.elementId), ['a']);
    assertEq(delta.restyled.map(x => x.elementId), ['a']);
    assertEq(result.capture.complete, true);
  });

  it('issue window contains every sibling and sibling deltas from first appearance', () => {
    const before = page({ elements: [
      el('target', { x: 0, y: 10, w: 200, h: 50 }),
      el('existing-sibling', { x: 0, y: 70, w: 200, h: 40 })
    ] });
    const after = page({
      elements: [
        el('target', { x: 0, y: 10, w: 200, h: 65 }),
        el('existing-sibling', { x: 0, y: 85, w: 200, h: 40 }),
        el('new-footnote', { x: 0, y: 130, w: 200, h: 24 }, { role: 'footnote' })
      ],
      metrics: { leftCapacity: 776, rightCapacity: 800 },
      findings: [{ issueId: 'imbalance-1', kind: 'column-imbalance', targetElementId: 'target', predicate: { delta: 36 } }]
    });
    const result = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'page-plan', [before]), cp('cp2', 2, 'balance', [after], 'op-42')],
      issues: [{ issue_id: 'imbalance-1', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'target', status: 'created' }]
    });
    const win = result.issueWindows[0];
    assertEq(win.causalAssessment.verdict, 'created-by-stage');
    assertEq(win.causalAssessment.operationId, 'op-42');
    assertEq(win.pageTimeline.length, 2);
    assertEq(win.pageTimeline[1].siblingInventory.map(x => x.elementId), ['existing-sibling', 'new-footnote']);
    assertEq(win.pageTimeline[1].siblingDeltas.added.map(x => x.elementId), ['new-footnote']);
    assertEq(win.pageTimeline[1].siblingDeltas.moved.map(x => x.elementId), ['existing-sibling']);
    assertEq(win.pageTimeline[1].siblingInventoryComplete, true);
  });

  it('does not treat a kind that was not evaluated as a clean previous state', () => {
    const before = page({ evaluatedKinds: [], elements: [el('target', { x: 0, y: 0, w: 100, h: 20 })] });
    const after = page({
      elements: [el('target', { x: 0, y: 0, w: 100, h: 20 })],
      findings: [{ issueId: 'sparse-1', kind: 'sparse-line', targetElementId: 'target' }]
    });
    const result = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'page-plan', [before]), cp('cp2', 2, 'balance', [after], 'op-1')],
      issues: [{ issue_id: 'sparse-1', kind: 'sparse-line', pageId: 'page-A', targetElementId: 'target', status: 'created' }]
    });
    assertEq(result.issueWindows[0].causalAssessment.verdict, 'became-observable-later');
    assertEq(result.issueWindows[0].pageTimeline[0].issueState, 'not-evaluated');
  });

  it('requires rejected-candidate evidence for correction-blocked', () => {
    const active = page({ findings: [{ issueId: 'blocked-1', kind: 'column-imbalance', targetElementId: 'body-1' }] });
    const good = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'balance', [active], 'op-1')],
      issues: [{ issue_id: 'blocked-1', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'body-1',
        status: 'correction-blocked', candidates: [{ accepted: false, reason: 'overflow-before' }] }]
    });
    assertEq(good.issueWindows[0].causalAssessment.verdict, 'correction-blocked');
    const weak = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'balance', [active], 'op-1')],
      issues: [{ issue_id: 'blocked-2', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'body-1',
        status: 'correction-blocked', candidates: [] }]
    });
    assertEq(weak.issueWindows[0].causalAssessment.verdict, 'unresolved');
  });

  it('correction-reverted requires a recorded resolution and reintroduction', () => {
    const active = page({ findings: [{ issueId: 'revert-1', kind: 'column-imbalance', targetElementId: 'body-1' }] });
    const clean = page({ findings: [] });
    const result = buildStepAudit({
      checkpoints: [
        cp('cp1', 1, 'balance', [active], 'op-a'),
        cp('cp2', 2, 'refit', [clean], 'op-b'),
        cp('cp3', 3, 'balance', [active], 'op-c')
      ],
      issues: [{
        issue_id: 'revert-1', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'body-1', status: 'reintroduced',
        transitions: [
          { state: 'created', stage: 'balance' },
          { state: 'resolved', stage: 'refit' },
          { state: 'reintroduced', stage: 'balance' }
        ]
      }]
    });
    assertEq(result.issueWindows[0].causalAssessment.verdict, 'correction-reverted');
  });

  it('does not call a disappeared target became-observable-later after an active finding', () => {
    const active = page({ findings: [{ issueId: 'gone-1', kind: 'column-imbalance', targetElementId: 'body-1' }] });
    const missing = page({ elements: [] });
    const result = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'balance', [active], 'op-a'), cp('cp2', 2, 'page-plan', [missing], 'op-b')],
      issues: [{ issue_id: 'gone-1', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'body-1', status: 'persists' }]
    });
    assertEq(result.issueWindows[0].causalAssessment.verdict, 'not-comparable');
    assertEq(result.issueWindows[0].causalAssessment.reason, 'target-disappeared-after-active-finding');
  });

  it('does not classify correction-reverted without active-absent-active evidence', () => {
    const active = page({ findings: [{ issueId: 'false-revert', kind: 'column-imbalance', targetElementId: 'body-1' }] });
    const result = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'balance', [active], 'op-a')],
      issues: [{
        issue_id: 'false-revert', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'body-1', status: 'correction-reverted',
        transitions: [{ state: 'created' }, { state: 'correction-reverted' }]
      }]
    });
    assertEq(result.issueWindows[0].causalAssessment.verdict, 'unresolved');
  });

  it('does not classify a sibling side effect without an actual capacity change', () => {
    const active = page({ findings: [{ issueId: 'side-1', kind: 'column-imbalance', targetElementId: 'body-1' }] });
    const result = buildStepAudit({
      checkpoints: [cp('cp1', 1, 'balance', [active], 'op-a'), cp('cp2', 2, 'refit', [active], 'op-b')],
      issues: [{
        issue_id: 'side-1', kind: 'column-imbalance', pageId: 'page-A', targetElementId: 'body-1',
        status: 'competing-repair-side-effect',
        causalEvidence: { siblingElementId: 'other-element', capacityBefore: 800, capacityAfter: 800 }
      }]
    });
    assertEq(result.issueWindows[0].causalAssessment.verdict, 'unresolved');
  });

  it('caps and ambiguous identities are explicit and never silently complete', () => {
    const crowded = page({ elements: [
      el('one', { x: 0, y: 0, w: 1, h: 1 }),
      el('two', { x: 0, y: 2, w: 1, h: 1 })
    ] });
    const result = buildStepAudit({ checkpoints: [cp('cp1', 1, 'page-plan', [crowded])] }, { maxElementsPerPage: 1 });
    assertEq(result.capture.complete, false);
    assertEq(result.capture.droppedElements, 1);
    assert(result.capture.reasons.includes('max-elements-per-page'));
    assertEq(result.checkpoints[0].pages[0].elementsTruncated, true);
  });

  it('duplicate page and element IDs are ambiguous rather than guessed', () => {
    const duplicatePage = page({ pageId: 'page-A', elements: [
      el('dup', { x: 0, y: 0, w: 1, h: 1 }),
      el('dup', { x: 0, y: 2, w: 1, h: 1 })
    ] });
    const result = buildStepAudit({ checkpoints: [cp('cp1', 1, 'page-plan', [duplicatePage, duplicatePage])] });
    assertEq(result.capture.complete, false);
    assert(result.capture.reasons.includes('duplicate-page-identity'));
    assert(result.capture.reasons.includes('duplicate-element-identity'));
  });
});

report('step-audit-reducer');
