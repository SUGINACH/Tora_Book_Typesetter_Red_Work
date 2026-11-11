// src/engine/audit/step-audit-reducer.js
// Pure reducer for RED model snapshots. No DOM, renderer, I/O or engine mutation.
'use strict';

const CHANGE_TYPES = Object.freeze([
  'added', 'removed', 'moved', 'resized', 'restyled',
  'reparented', 'structuralChanged', 'split', 'merged'
]);

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function stableStringify(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('non-finite number');
    return Object.is(value, -0) ? '0' : JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (!isPlainObject(value)) throw new TypeError('non-plain snapshot value');
  return '{' + Object.keys(value).sort().map((key) =>
    JSON.stringify(key) + ':' + stableStringify(value[key] === undefined ? null : value[key])
  ).join(',') + '}';
}

function markIncomplete(capture, reason) {
  capture.complete = false;
  capture.reasons.add(reason);
}

function clonePlain(value, capture, reason) {
  if (value === undefined) return null;
  try { return JSON.parse(stableStringify(value)); }
  catch (_) { markIncomplete(capture, reason || 'non-serializable-snapshot-data'); return null; }
}

function asId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asStringArray(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()))].sort();
}

function finiteOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeGeometry(raw, capture) {
  if (raw == null) return null;
  if (!isPlainObject(raw)) {
    markIncomplete(capture, 'invalid-element-geometry');
    return null;
  }
  const result = {};
  for (const key of ['x', 'y', 'w', 'h']) {
    result[key] = finiteOrNull(raw[key]);
    if (result[key] == null) markIncomplete(capture, 'incomplete-element-geometry');
  }
  for (const key of ['baseline', 'top', 'bottom', 'right', 'left']) {
    if (raw[key] != null) {
      result[key] = finiteOrNull(raw[key]);
      if (result[key] == null) markIncomplete(capture, 'invalid-element-geometry');
    }
  }
  return result;
}

function normalizeFinding(raw, capture) {
  const issueId = asId(raw && (raw.issueId || raw.issue_id));
  const kind = asId(raw && raw.kind);
  if (!issueId || !kind) {
    markIncomplete(capture, 'finding-without-stable-id-or-kind');
    return null;
  }
  return {
    issueId,
    kind,
    targetElementId: asId(raw.targetElementId || raw.elementId),
    predicate: clonePlain(raw.predicate, capture, 'non-serializable-finding-predicate')
  };
}

function normalizeElement(raw, pageFindings, capture, includeTextPreview) {
  const elementId = asId(raw && (raw.elementId || raw.id));
  if (!elementId) {
    capture.ambiguousElementIds++;
    markIncomplete(capture, 'element-without-stable-id');
  }
  const role = asId(raw && raw.role) || 'unknown';
  const findingRefs = pageFindings
    .filter((f) => f.targetElementId && f.targetElementId === elementId)
    .map((f) => ({ issueId: f.issueId, kind: f.kind }))
    .sort((a, b) => a.issueId.localeCompare(b.issueId));
  const normalized = {
    elementId,
    role,
    parentId: asId(raw && raw.parentId),
    tokenId: asId(raw && raw.tokenId),
    fragmentId: asId(raw && raw.fragmentId),
    columnId: asId(raw && raw.columnId),
    readingOrder: finiteOrNull(raw && raw.readingOrder),
    geometry: normalizeGeometry(raw && raw.geometry, capture),
    attributes: clonePlain((raw && raw.attributes) || {}, capture, 'non-serializable-element-attributes') || {},
    style: clonePlain((raw && raw.style) || {}, capture, 'non-serializable-element-style') || {},
    lineage: clonePlain((raw && raw.lineage) || null, capture, 'non-serializable-element-lineage'),
    textDigest: asId(raw && raw.textDigest),
    findingRefs
  };
  if (includeTextPreview && raw && typeof raw.textPreview === 'string') {
    normalized.textPreview = raw.textPreview.slice(0, 120);
  }
  return normalized;
}

function normalizePage(raw, limits, capture) {
  const pageId = asId(raw && (raw.pageId || raw.id));
  if (!pageId) {
    capture.ambiguousPageIds++;
    markIncomplete(capture, 'page-without-stable-id');
  }
  const allElements = Array.isArray(raw && raw.elements) ? raw.elements : [];
  const maxElements = limits.maxElementsPerPage;
  const truncated = Number.isFinite(maxElements) && allElements.length > maxElements;
  if (truncated) {
    capture.droppedElements += allElements.length - maxElements;
    markIncomplete(capture, 'max-elements-per-page');
  }
  const findings = (Array.isArray(raw && raw.findings) ? raw.findings : [])
    .map((f) => normalizeFinding(f, capture)).filter(Boolean);
  const selected = truncated ? allElements.slice(0, maxElements) : allElements;
  const elements = selected.map((e) => normalizeElement(e || {}, findings, capture, limits.includeTextPreview));
  const counts = new Map();
  for (const el of elements) if (el.elementId) counts.set(el.elementId, (counts.get(el.elementId) || 0) + 1);
  const ambiguousElementIds = [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id).sort();
  if (ambiguousElementIds.length) {
    capture.ambiguousElementIds += ambiguousElementIds.length;
    markIncomplete(capture, 'duplicate-element-identity');
  }
  return {
    pageId,
    pageIndex: Number.isInteger(raw && raw.pageIndex) ? raw.pageIndex : (Number.isInteger(raw && raw.index) ? raw.index : null),
    pageType: asId(raw && (raw.pageType || raw.type)) || 'unknown',
    metrics: clonePlain((raw && raw.metrics) || {}, capture, 'non-serializable-page-metrics') || {},
    evaluatedKinds: asStringArray(raw && (raw.evaluatedKinds || raw.auditKinds)),
    findings,
    elements,
    elementCount: allElements.length,
    elementsTruncated: truncated,
    ambiguousElementIds
  };
}

function normalizeCheckpoint(raw, limits, capture) {
  const checkpointId = asId(raw && (raw.checkpointId || raw.id));
  const seq = finiteOrNull(raw && raw.seq);
  const stage = asId(raw && raw.stage);
  if (!checkpointId || seq == null || !stage) markIncomplete(capture, 'invalid-checkpoint-identity');
  const rawPages = Array.isArray(raw && raw.pages) ? raw.pages : [];
  const maxPages = limits.maxPagesPerCheckpoint;
  const truncated = Number.isFinite(maxPages) && rawPages.length > maxPages;
  if (truncated) {
    capture.droppedPages += rawPages.length - maxPages;
    markIncomplete(capture, 'max-pages-per-checkpoint');
  }
  const pages = (truncated ? rawPages.slice(0, maxPages) : rawPages)
    .map((p) => normalizePage(p || {}, limits, capture));
  const counts = new Map();
  for (const page of pages) if (page.pageId) counts.set(page.pageId, (counts.get(page.pageId) || 0) + 1);
  const ambiguousPageIds = [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id).sort();
  if (ambiguousPageIds.length) {
    capture.ambiguousPageIds += ambiguousPageIds.length;
    markIncomplete(capture, 'duplicate-page-identity');
  }
  return {
    checkpointId,
    seq,
    stage: stage || 'unknown',
    operationId: asId(raw && raw.operationId),
    parentOperationId: asId(raw && raw.parentOperationId),
    pages,
    pagesTruncated: truncated,
    ambiguousPageIds
  };
}

function uniquePageMap(checkpoint) {
  const counts = new Map();
  for (const page of checkpoint.pages) if (page.pageId) counts.set(page.pageId, (counts.get(page.pageId) || 0) + 1);
  const map = new Map();
  for (const page of checkpoint.pages) {
    if (page.pageId && counts.get(page.pageId) === 1) map.set(page.pageId, page);
  }
  return map;
}

function uniqueElementMap(page) {
  const counts = new Map();
  for (const element of page.elements) {
    if (element.elementId) counts.set(element.elementId, (counts.get(element.elementId) || 0) + 1);
  }
  const map = new Map();
  for (const element of page.elements) {
    if (element.elementId && counts.get(element.elementId) === 1) map.set(element.elementId, element);
  }
  return map;
}

function sameData(a, b) {
  try { return stableStringify(a == null ? null : a) === stableStringify(b == null ? null : b); }
  catch (_) { return false; }
}

function pairGeometry(before, after) {
  return { elementId: before.elementId, role: after.role, before: before.geometry, after: after.geometry };
}

function computePageDelta(previousCheckpoint, currentCheckpoint, pageId, previousPage, currentPage, tolerance) {
  const beforeMap = uniqueElementMap(previousPage);
  const afterMap = uniqueElementMap(currentPage);
  const beforeIds = new Set(beforeMap.keys());
  const afterIds = new Set(afterMap.keys());
  const added = [], removed = [], moved = [], resized = [], restyled = [];
  const reparented = [], structuralChanged = [], split = [], merged = [];
  let unchanged = 0;

  for (const [id, after] of afterMap) {
    if (!beforeIds.has(id)) { added.push(after); continue; }
    const before = beforeMap.get(id);
    const bg = before.geometry, ag = after.geometry;
    let didChange = false;
    if (bg && ag) {
      if ([bg.x, bg.y, ag.x, ag.y].every(Number.isFinite)) {
        if (Math.abs(ag.x - bg.x) > tolerance || Math.abs(ag.y - bg.y) > tolerance) {
          moved.push(pairGeometry(before, after)); didChange = true;
        }
      } else {
        structuralChanged.push({ elementId: id, reason: 'movement-geometry-not-comparable', before: bg, after: ag });
        didChange = true;
      }
      if ([bg.w, bg.h, ag.w, ag.h].every(Number.isFinite)) {
        if (Math.abs(ag.w - bg.w) > tolerance || Math.abs(ag.h - bg.h) > tolerance) {
          resized.push(pairGeometry(before, after)); didChange = true;
        }
      } else {
        structuralChanged.push({ elementId: id, reason: 'size-geometry-not-comparable', before: bg, after: ag });
        didChange = true;
      }
    } else if (!sameData(bg, ag)) {
      structuralChanged.push({ elementId: id, before: bg, after: ag, reason: 'geometry-availability-changed' });
      didChange = true;
    }
    if (!sameData(before.style, after.style)) {
      restyled.push({ elementId: id, before: before.style, after: after.style });
      didChange = true;
    }
    if (before.parentId !== after.parentId || before.columnId !== after.columnId) {
      reparented.push({ elementId: id, before: { parentId: before.parentId, columnId: before.columnId }, after: { parentId: after.parentId, columnId: after.columnId } });
      didChange = true;
    }
    if (before.role !== after.role || before.readingOrder !== after.readingOrder || !sameData(before.attributes, after.attributes)) {
      structuralChanged.push({ elementId: id, before: { role: before.role, readingOrder: before.readingOrder, attributes: before.attributes }, after: { role: after.role, readingOrder: after.readingOrder, attributes: after.attributes } });
      didChange = true;
    }
    if (!didChange) unchanged++;
  }

  for (const [id, before] of beforeMap) if (!afterIds.has(id)) removed.push(before);
  for (const element of currentPage.elements) {
    if (!element.elementId || !element.lineage || !Array.isArray(element.lineage.fromIds)) continue;
    const fromIds = element.lineage.fromIds.filter((id) => beforeMap.has(id));
    if (!fromIds.length) continue;
    if (element.lineage.kind === 'split') split.push({ fromIds: fromIds.sort(), toIds: [element.elementId] });
    if (element.lineage.kind === 'merge') merged.push({ fromIds: fromIds.sort(), toIds: [element.elementId] });
  }

  const sortById = (a, b) => String(a.elementId || '').localeCompare(String(b.elementId || ''));
  for (const arr of [added, removed, moved, resized, restyled, reparented, structuralChanged]) arr.sort(sortById);
  split.sort((a, b) => a.toIds[0].localeCompare(b.toIds[0]));
  merged.sort((a, b) => a.toIds[0].localeCompare(b.toIds[0]));

  return {
    fromCheckpoint: previousCheckpoint.checkpointId,
    toCheckpoint: currentCheckpoint.checkpointId,
    fromSeq: previousCheckpoint.seq,
    toSeq: currentCheckpoint.seq,
    fromStage: previousCheckpoint.stage,
    toStage: currentCheckpoint.stage,
    fromOperationId: previousCheckpoint.operationId,
    toOperationId: currentCheckpoint.operationId,
    pageId,
    pageIndexBefore: previousPage.pageIndex,
    pageIndexAfter: currentPage.pageIndex,
    metricsChanged: !sameData(previousPage.metrics, currentPage.metrics),
    beforeMetrics: previousPage.metrics,
    afterMetrics: currentPage.metrics,
    inventoryComplete: !previousPage.elementsTruncated && !currentPage.elementsTruncated
      && !previousPage.ambiguousElementIds.length && !currentPage.ambiguousElementIds.length,
    added, removed, moved, resized, restyled, reparented, structuralChanged, split, merged,
    unchanged
  };
}

function filterSiblingDelta(delta, targetElementId) {
  if (!delta) return null;
  const clone = { ...delta };
  for (const type of CHANGE_TYPES) {
    if (Array.isArray(clone[type])) clone[type] = clone[type].filter((item) => item.elementId !== targetElementId);
  }
  return clone;
}

function classifyIssue(issue, observations, targetResolved, pageResolved) {
  const status = issue.status || 'unknown';
  const transitions = Array.isArray(issue.transitions) ? issue.transitions : [];
  const candidates = Array.isArray(issue.candidates) ? issue.candidates : [];
  if (!pageResolved || !targetResolved) {
    return { verdict: 'not-comparable', reason: !pageResolved ? 'page-identity-unresolved' : 'target-identity-unresolved' };
  }
  if (status === 'correction-blocked') {
    const rejected = candidates.some((candidate) => candidate && candidate.accepted === false && candidate.reason);
    return rejected
      ? { verdict: 'correction-blocked', reason: 'ledger-has-rejected-candidate-with-reason' }
      : { verdict: 'unresolved', reason: 'correction-blocked-without-candidate-rejection-evidence' };
  }
  if (status === 'correction-reverted' || transitions.some((t) => t && t.state === 'correction-reverted')) {
    return { verdict: 'correction-reverted', reason: 'explicit-ledger-lifecycle' };
  }
  if (status === 'competing-repair-side-effect') {
    const evidence = issue.causalEvidence;
    const hasDependency = evidence && evidence.siblingElementId && evidence.capacityBefore != null && evidence.capacityAfter != null;
    const changedSibling = hasDependency && observations.some((obs) =>
      (obs.siblingDeltas || []).some((delta) => delta.elementId === evidence.siblingElementId)
    );
    return changedSibling
      ? { verdict: 'competing-repair-side-effect', reason: 'explicit-ledger-dependency-matches-sibling-delta' }
      : { verdict: 'unresolved', reason: 'side-effect-status-without-matching-sibling-capacity-evidence' };
  }

  const known = observations.filter((o) => o.issueState === 'active' || o.issueState === 'absent');
  const pattern = known.slice(0, -2).some((o, i) =>
    o.issueState === 'active'
    && known[i + 1].issueState === 'absent'
    && known[i + 2].issueState === 'active'
  );
  if (pattern) {
    const resolved = transitions.some((t) => t && t.state === 'resolved');
    const reintroduced = transitions.some((t) => t && t.state === 'reintroduced');
    if (resolved && reintroduced) return { verdict: 'correction-reverted', reason: 'active-absent-active-with-ledger-resolution-and-reintroduction' };
  }
  for (let i = 1; i < known.length; i++) {
    const before = known[i - 1], after = known[i];
    if (before.issueState === 'absent' && after.issueState === 'active') {
      if (!before.targetPresent || !after.targetPresent) {
        return { verdict: 'became-observable-later', reason: 'target-not-present-at-earlier-comparable-evaluation' };
      }
      if (after.operationId) return { verdict: 'created-by-stage', reason: 'same-target-false-to-true-across-operation', operationId: after.operationId, checkpointId: after.checkpointId };
      return { verdict: 'unresolved', reason: 'first-bad-checkpoint-has-no-operation-id' };
    }
    if (before.issueState === 'active' && after.issueState === 'absent') {
      if (after.operationId) return { verdict: 'resolved-by-stage', reason: 'same-target-true-to-false-across-operation', operationId: after.operationId, checkpointId: after.checkpointId };
    }
  }
  if (status === 'resolved' || status === 'persists' || status === 'reintroduced') {
    return { verdict: status, reason: 'ledger-lifecycle-without-new-causal-transition' };
  }
  if (observations.some((o) => o.issueState === 'not-evaluated' || o.issueState === 'page-not-present' || !o.targetPresent)) {
    return { verdict: 'became-observable-later', reason: 'earlier-checkpoint-lacked-comparable-observation' };
  }
  return { verdict: 'unresolved', reason: 'no-provable-before-after-transition' };
}

function makeIssueWindows(issues, checkpoints, pageDeltas, capture) {
  const allIssueFindings = new Map();
  for (const cp of checkpoints) {
    const pageMap = uniquePageMap(cp);
    for (const [pageId, page] of pageMap) {
      for (const finding of page.findings) {
        const arr = allIssueFindings.get(finding.issueId) || [];
        arr.push({ checkpointId: cp.checkpointId, seq: cp.seq, pageId, targetElementId: finding.targetElementId });
        allIssueFindings.set(finding.issueId, arr);
      }
    }
  }
  const deltaByToPage = new Map(pageDeltas.map((d) => [String(d.toCheckpoint) + '::' + String(d.pageId), d]));

  return issues.map((rawIssue) => {
    const issueId = asId(rawIssue && (rawIssue.issue_id || rawIssue.issueId));
    const kind = asId(rawIssue && rawIssue.kind) || 'unknown';
    if (!issueId) {
      markIncomplete(capture, 'issue-without-stable-id');
      return { issueId: null, kind, ledgerStatus: rawIssue && rawIssue.status || 'unknown', causalAssessment: { verdict: 'not-comparable', reason: 'issue-id-missing' }, pageTimeline: [] };
    }
    const linkedFindings = allIssueFindings.get(issueId) || [];
    const pageIdsFromFindings = [...new Set(linkedFindings.map((f) => f.pageId))];
    const pageId = asId(rawIssue.pageId) || (pageIdsFromFindings.length === 1 ? pageIdsFromFindings[0] : null);
    const pageResolved = !!pageId && pageIdsFromFindings.length <= 1;
    const targetIdsFromFindings = [...new Set(linkedFindings.map((f) => f.targetElementId).filter(Boolean))];
    const targetElementId = asId(rawIssue.targetElementId)
      || (targetIdsFromFindings.length === 1 ? targetIdsFromFindings[0] : null);
    const targetResolved = !!targetElementId && targetIdsFromFindings.length <= 1;
    if (!pageResolved) markIncomplete(capture, 'issue-page-identity-unresolved');
    if (!targetResolved) markIncomplete(capture, 'issue-target-identity-unresolved');

    const firstActiveSeq = linkedFindings.length ? Math.min(...linkedFindings.map((f) => f.seq)) : null;
    const firstActiveIndex = firstActiveSeq == null ? -1 : checkpoints.findIndex((cp) => cp.seq === firstActiveSeq);
    const startIndex = firstActiveIndex >= 0 ? Math.max(0, firstActiveIndex - 1) : 0;
    const pageTimeline = [];

    for (let i = startIndex; i < checkpoints.length; i++) {
      const cp = checkpoints[i];
      const page = pageResolved ? uniquePageMap(cp).get(pageId) : null;
      if (!page) {
        pageTimeline.push({
          checkpointId: cp.checkpointId, seq: cp.seq, stage: cp.stage, operationId: cp.operationId,
          pageState: 'page-not-present', issueState: 'page-not-present',
          targetPresent: false, targetElement: null, siblingInventory: [], siblingInventoryComplete: false,
          siblingDeltas: null, pageFindings: []
        });
        continue;
      }
      const matching = page.findings.filter((f) => f.issueId === issueId);
      const finding = matching.length ? matching[0] : null;
      const evaluated = page.evaluatedKinds.includes(kind);
      const issueState = finding ? 'active' : evaluated ? 'absent' : 'not-evaluated';
      const target = targetResolved ? page.elements.find((el) => el.elementId === targetElementId) : null;
      const targetPresent = !!target && !page.ambiguousElementIds.includes(targetElementId);
      const siblings = page.elements.filter((el) => el.elementId !== targetElementId);
      const delta = i > 0 ? deltaByToPage.get(String(cp.checkpointId) + '::' + String(pageId)) || null : null;
      const siblingDeltas = filterSiblingDelta(delta, targetElementId);
      pageTimeline.push({
        checkpointId: cp.checkpointId, seq: cp.seq, stage: cp.stage, operationId: cp.operationId,
        pageState: 'present', issueState,
        targetPresent, targetElement: target || null,
        targetFinding: finding,
        siblingInventory: siblings,
        siblingInventoryComplete: !page.elementsTruncated && !page.ambiguousElementIds.length,
        siblingDeltas,
        pageMetrics: page.metrics,
        pageFindings: page.findings.filter((f) => f.issueId !== issueId)
      });
    }

    const assessment = classifyIssue(rawIssue, pageTimeline, targetResolved, pageResolved);
    return {
      issueId,
      kind,
      target: rawIssue.target || null,
      pageId,
      targetElementId,
      ledgerStatus: rawIssue.status || 'unknown',
      ledgerTransitions: Array.isArray(rawIssue.transitions) ? rawIssue.transitions : [],
      candidates: Array.isArray(rawIssue.candidates) ? rawIssue.candidates : [],
      capacityBefore: rawIssue.capacity_before == null ? null : rawIssue.capacity_before,
      capacityAfter: rawIssue.capacity_after == null ? null : rawIssue.capacity_after,
      causalAssessment: assessment,
      firstActiveCheckpoint: firstActiveSeq == null ? null : linkedFindings.filter((f) => f.seq === firstActiveSeq)[0].checkpointId,
      pageTimeline
    };
  }).sort((a, b) => String(a.issueId || '').localeCompare(String(b.issueId || '')));
}

function buildStepAudit(input = {}, options = {}) {
  const capture = {
    complete: true,
    droppedCheckpoints: 0,
    droppedPages: 0,
    droppedElements: 0,
    ambiguousPageIds: 0,
    ambiguousElementIds: 0,
    reasons: new Set()
  };
  const limits = {
    maxCheckpoints: Number.isFinite(options.maxCheckpoints) && options.maxCheckpoints >= 0 ? Math.floor(options.maxCheckpoints) : Infinity,
    maxPagesPerCheckpoint: Number.isFinite(options.maxPagesPerCheckpoint) && options.maxPagesPerCheckpoint >= 0 ? Math.floor(options.maxPagesPerCheckpoint) : Infinity,
    maxElementsPerPage: Number.isFinite(options.maxElementsPerPage) && options.maxElementsPerPage >= 0 ? Math.floor(options.maxElementsPerPage) : Infinity,
    geometryTolerancePx: Number.isFinite(options.geometryTolerancePx) && options.geometryTolerancePx >= 0 ? options.geometryTolerancePx : 0,
    includeTextPreview: options.includeTextPreview === true
  };
  const rawCheckpoints = Array.isArray(input.checkpoints) ? input.checkpoints : [];
  if (!rawCheckpoints.length) markIncomplete(capture, 'no-checkpoints');
  const selected = rawCheckpoints.length > limits.maxCheckpoints ? rawCheckpoints.slice(0, limits.maxCheckpoints) : rawCheckpoints;
  if (selected.length !== rawCheckpoints.length) {
    capture.droppedCheckpoints = rawCheckpoints.length - selected.length;
    markIncomplete(capture, 'max-checkpoints');
  }
  const checkpoints = selected.map((cp) => normalizeCheckpoint(cp || {}, limits, capture))
    .sort((a, b) => (a.seq == null ? Infinity : a.seq) - (b.seq == null ? Infinity : b.seq)
      || String(a.checkpointId || '').localeCompare(String(b.checkpointId || '')));
  const seenCheckpointIds = new Set();
  for (const cp of checkpoints) {
    if (!cp.checkpointId || seenCheckpointIds.has(cp.checkpointId)) markIncomplete(capture, 'duplicate-or-missing-checkpoint-id');
    if (cp.checkpointId) seenCheckpointIds.add(cp.checkpointId);
  }
  for (let i = 1; i < checkpoints.length; i++) {
    if (checkpoints[i - 1].seq === checkpoints[i].seq) markIncomplete(capture, 'duplicate-checkpoint-sequence');
  }

  const pageDeltas = [];
  const pageTransitions = [];
  for (let i = 1; i < checkpoints.length; i++) {
    const before = uniquePageMap(checkpoints[i - 1]);
    const after = uniquePageMap(checkpoints[i]);
    for (const [pageId, currentPage] of after) {
      if (!before.has(pageId)) {
        pageTransitions.push({ type: 'added', pageId, checkpointId: checkpoints[i].checkpointId, pageIndex: currentPage.pageIndex });
        continue;
      }
      pageDeltas.push(computePageDelta(checkpoints[i - 1], checkpoints[i], pageId, before.get(pageId), currentPage, limits.geometryTolerancePx));
    }
    for (const [pageId, oldPage] of before) {
      if (!after.has(pageId)) pageTransitions.push({ type: 'removed', pageId, checkpointId: checkpoints[i].checkpointId, pageIndex: oldPage.pageIndex });
    }
  }
  pageTransitions.sort((a, b) => a.checkpointId.localeCompare(b.checkpointId) || a.pageId.localeCompare(b.pageId));

  const issues = Array.isArray(input.issues) ? input.issues : [];
  const issueWindows = makeIssueWindows(issues, checkpoints, pageDeltas, capture);
  return {
    schema: 'red-step-audit-v1',
    capture: {
      complete: capture.complete,
      droppedCheckpoints: capture.droppedCheckpoints,
      droppedPages: capture.droppedPages,
      droppedElements: capture.droppedElements,
      ambiguousPageIds: capture.ambiguousPageIds,
      ambiguousElementIds: capture.ambiguousElementIds,
      reasons: [...capture.reasons].sort()
    },
    checkpoints, pageTransitions, pageDeltas, issueWindows
  };
}

module.exports = { buildStepAudit, CHANGE_TYPES, stableStringify };
