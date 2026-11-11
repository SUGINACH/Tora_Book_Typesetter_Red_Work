// src/engine/audit/step-audit-model-adapter.js
// Maps the live RED page model into normalized input for step-audit-reducer.
// This module is opt-in and is deliberately not imported by the typesetting pipeline.
'use strict';

const crypto = require('crypto');

function digestText(value) {
  return crypto.createHash('sha256').update(String(value == null ? '' : value), 'utf8').digest('hex');
}

function textOfLine(line) {
  if (Array.isArray(line && line.words)) return line.words.map((w) => String(w)).join(' ');
  return String(line && (line.text || line.raw) || '');
}

function lineTokenId(line) {
  if (line && line.tokenId != null) return String(line.tokenId);
  if (line && line.meta && line.meta.tokenId != null) return String(line.meta.tokenId);
  return null;
}

function unionGeometry(items) {
  const rects = items.map((x) => x.geometry).filter((g) =>
    g && [g.x, g.y, g.w, g.h].every(Number.isFinite)
  );
  if (!rects.length) return null;
  const x = Math.min(...rects.map((g) => g.x));
  const y = Math.min(...rects.map((g) => g.y));
  const right = Math.max(...rects.map((g) => g.x + g.w));
  const bottom = Math.max(...rects.map((g) => g.y + g.h));
  return { x, y, w: right - x, h: bottom - y };
}

function ledgerIssuesOf(ledger) {
  if (!ledger) return [];
  if (typeof ledger.toSchemaV2 === 'function') {
    const schema = ledger.toSchemaV2();
    return Array.isArray(schema.issues) ? schema.issues : [];
  }
  if (ledger.issues instanceof Map) return [...ledger.issues.values()];
  if (Array.isArray(ledger.issues)) return ledger.issues;
  if (Array.isArray(ledger)) return ledger;
  return [];
}

function activeIssue(issue) {
  return !['resolved', 'not-comparable'].includes(issue && issue.status);
}

function targetToken(target) {
  if (typeof target !== 'string') return null;
  const m = target.match(/^(?:line@)?(t\d+)(?:@p\d+c\d+)?$/);
  return m ? m[1] : null;
}

function targetSequence(target) {
  if (typeof target !== 'string') return null;
  const m = target.match(/^(?:(?:page#|p)\d+)?@seq(\d+)$|^seq[:#](\d+)$/);
  return m ? Number(m[1] || m[2]) : null;
}

function parsePageTarget(target) {
  if (typeof target !== 'string') return null;
  let m = target.match(/^page#(\d+)(?:c(\d+))?$/);
  if (m) return { pageIndex: Number(m[1]), columnIndex: m[2] == null ? null : Number(m[2]) };
  m = target.match(/^p(\d+)(?:c(\d+))?$/);
  if (m) return { pageIndex: Number(m[1]), columnIndex: m[2] == null ? null : Number(m[2]) };
  return null;
}

/**
 * Identity registries are scoped to one typeset run. Page objects retain
 * identity across reindexing/insertion; line seq values are the stable
 * intra-run fragment identity. No page number or text-position guess is used.
 */
function createStepAuditModelAdapter(options = {}) {
  const pageIds = new WeakMap();
  const objectIds = new WeakMap();
  let nextPageId = 0;
  let nextObjectId = 0;
  const pageIndexMaps = new Map();
  const ambiguousPageIndexStages = new Set();

  function pageIdOf(page) {
    if (!page || typeof page !== 'object') return null;
    const explicit = page.auditPageId || page.pageId;
    if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();
    let id = pageIds.get(page);
    if (!id) {
      id = 'page-object-' + (++nextPageId);
      pageIds.set(page, id);
    }
    return id;
  }

  function objectIdOf(object, prefix) {
    if (!object || typeof object !== 'object') return null;
    let id = objectIds.get(object);
    if (!id) {
      id = prefix + '-' + (++nextObjectId);
      objectIds.set(object, id);
    }
    return id;
  }

  function snapshot(input = {}) {
    const pages = Array.isArray(input.pages) ? input.pages : [];
    const settings = input.settings || {};
    const capture = { complete: true, reasons: new Set(), unmappedIssues: [], pageCount: pages.length };
    const pageRows = [];
    const pageById = new Map();
    const elementsByPage = new Map();

    function incomplete(reason) {
      capture.complete = false;
      capture.reasons.add(reason);
    }

    function addElement(elements, element) {
      if (!element || !element.elementId) {
        incomplete('element-without-stable-id');
        return;
      }
      elements.push(element);
    }

    function addLine(elements, pageId, line, geometry, columnId, parentId, roleOverride) {
      const seq = Number.isInteger(line && line.seq) && line.seq >= 0 ? line.seq : null;
      const tokenId = lineTokenId(line);
      const elementId = seq != null
        ? 'line-seq-' + seq
        : 'line-object-' + objectIdOf(line, 'line');
      if (seq == null) incomplete('line-without-seq-uses-in-run-object-identity');
      const text = textOfLine(line);
      const role = roleOverride || (line && line.kind === 'heading' ? 'heading-line' : 'body-line');
      addElement(elements, {
        elementId,
        role,
        parentId: tokenId ? 'token:' + tokenId : parentId,
        tokenId,
        fragmentId: seq != null ? 'seq:' + seq : elementId,
        columnId: columnId || null,
        readingOrder: seq,
        geometry,
        attributes: {
          kind: line && line.kind || 'paragraph',
          level: line && line.level != null ? line.level : null,
          part: line && line.meta && line.meta.part || null,
          docPart: line && line.meta && line.meta.docPart != null ? line.meta.docPart : null,
          isLast: !!(line && line.isLast),
          aqStretch: line && line.aqStretch || 1,
          inkWidthPx: Number.isFinite(line && line.widthPx) ? line.widthPx : null,
          seq
        },
        style: {
          customStyle: line && line.customStyle && line.customStyle.id || null,
          customClass: line && line.customClass || null
        },
        textDigest: digestText(text)
      });
      return { elementId, tokenId, seq, geometry, text, role, part: line && line.meta && line.meta.part || null };
    }

    pages.forEach((page, pageArrayIndex) => {
      if (!page || typeof page !== 'object') {
        incomplete('invalid-page-model');
        return;
      }
      const pageId = pageIdOf(page);
      if (pageById.has(pageId)) incomplete('duplicate-page-object-in-snapshot');

      const tpl = page.template || {};
      const box = tpl.contentBox || {};
      const cols = Array.isArray(page.columns) ? page.columns : [];
      const templateCols = Array.isArray(tpl.columns) ? tpl.columns : [];
      const elements = [];
      const lineRows = [];
      const span = page.spanning || null;
      const spanHeight = Number.isFinite(span && span.heightPx) ? span.heightPx : 0;
      const pageWidth = Number.isFinite(tpl.width) ? tpl.width : null;
      const pageHeight = Number.isFinite(tpl.height) ? tpl.height : null;
      const boxLeft = Number.isFinite(box.left) ? box.left
        : (templateCols.length ? Math.min(...templateCols.map((c) => c.x)) : null);
      const boxRight = Number.isFinite(box.right) ? box.right
        : (templateCols.length ? Math.max(...templateCols.map((c) => c.x + c.w)) : null);
      const boxTop = Number.isFinite(box.top) ? box.top : null;
      const boxBottom = Number.isFinite(box.bottom) ? box.bottom : null;

      addElement(elements, {
        elementId: 'page-flow:' + pageId,
        role: 'page-flow',
        parentId: pageId,
        geometry: boxLeft != null && boxTop != null && boxRight != null && boxBottom != null
          ? { x: boxLeft, y: boxTop, w: boxRight - boxLeft, h: boxBottom - boxTop } : null,
        attributes: { pageType: page.type || 'unknown', chapterOpening: !!page.chapterOpening, terminalResidual: !!page.terminalResidual },
        style: {},
        textDigest: digestText(page.type || '')
      });
      if (!pageId || !Number.isFinite(pageWidth) || !Number.isFinite(pageHeight) || boxTop == null || boxBottom == null) {
        incomplete('page-template-geometry-missing');
      }

      if (span && Number.isFinite(span.heightPx)) {
        const sx = templateCols.length ? Math.min(...templateCols.map((c) => c.x)) : boxLeft;
        const sr = templateCols.length ? Math.max(...templateCols.map((c) => c.x + c.w)) : boxRight;
        addElement(elements, {
          elementId: 'spanning-band:' + pageId,
          role: 'spanning-band',
          parentId: pageId,
          geometry: sx != null && sr != null && boxTop != null
            ? { x: sx, y: boxTop, w: sr - sx, h: span.heightPx } : null,
          attributes: { heightPx: span.heightPx, lineCount: (span.lines || []).length },
          style: {},
          textDigest: digestText((span.lines || []).map(textOfLine).join('\n'))
        });
        let sy = boxTop;
        const sw = sx != null && sr != null ? sr - sx : null;
        for (const line of span.lines || []) {
          const h = (line.heightPx || 0) * (line.aqStretch || 1);
          const row = addLine(elements, pageId, line,
            sx != null && sw != null && sy != null ? { x: sx, y: sy, w: sw, h } : null,
            'spanning:' + pageId, 'spanning-band:' + pageId);
          lineRows.push(row);
          sy += h;
        }
      }

      cols.forEach((column, ci) => {
        const tc = templateCols[ci] || null;
        const columnId = 'column:' + pageId + ':' + ci;
        const usedHeight = (column || []).reduce((sum, line) =>
          sum + (line.heightPx || 0) * (line.aqStretch || 1), 0);
        const isSingleEndnoteColumn = page.type === 'endnotes' && cols.length === 1;
        const colX = isSingleEndnoteColumn && boxLeft != null ? boxLeft : (tc && Number.isFinite(tc.x) ? tc.x : null);
        const colW = isSingleEndnoteColumn && boxLeft != null && boxRight != null
          ? boxRight - boxLeft : (tc && Number.isFinite(tc.w) ? tc.w : null);
        const contentOffset = page.type === 'endnotes' ? (page.titleBandPx || 0) : spanHeight;
        const yTop = boxTop != null ? boxTop + contentOffset : null;
        const colH = boxBottom != null && yTop != null ? Math.max(0, boxBottom - yTop) : null;
        addElement(elements, {
          elementId: columnId,
          role: 'column',
          parentId: 'page-flow:' + pageId,
          columnId,
          geometry: colX != null && colW != null && yTop != null && colH != null
            ? { x: colX, y: yTop, w: colW, h: colH } : null,
          attributes: { columnIndex: ci, usedHeightPx: usedHeight, lineCount: (column || []).length },
          style: {},
          textDigest: digestText('')
        });
        let y = yTop;
        // Endnote columns contain note records, not line records; they are
        // projected separately below and must not be double-counted as body lines.
        if (page.type !== 'endnotes') {
          for (const line of column || []) {
            const h = (line.heightPx || 0) * (line.aqStretch || 1);
            const row = addLine(elements, pageId, line,
              colX != null && colW != null && y != null ? { x: colX, y, w: colW, h } : null,
              columnId, 'column:' + pageId + ':' + ci);
            lineRows.push(row);
            y += h;
          }
        }
      });

      // Logical paragraph/heading fragments are page-local containers. Individual
      // line-seq elements remain the cross-page identity used to detect moves.
      const byToken = new Map();
      for (const row of lineRows) {
        if (!row.tokenId) continue;
        const list = byToken.get(row.tokenId) || [];
        list.push(row);
        byToken.set(row.tokenId, list);
      }
      for (const [tokenId, rows] of byToken) {
        rows.sort((a, b) => (a.seq == null ? Infinity : a.seq) - (b.seq == null ? Infinity : b.seq));
        const geometry = unionGeometry(rows.map((row) => ({ geometry: row.geometry })));
        const role = rows.some((row) => row.role === 'heading-line') ? 'heading-fragment' : 'paragraph-fragment';
        const body = rows.map((row) => row.text).join('\n');
        addElement(elements, {
          elementId: 'block-fragment:' + pageId + ':' + tokenId,
          role,
          parentId: 'token:' + tokenId,
          tokenId,
          fragmentId: pageId + ':' + tokenId,
          geometry,
          attributes: {
            lineCount: rows.length,
            lineSeqs: rows.map((row) => row.seq).filter((n) => n != null),
            parts: [...new Set(rows.map((row) => row.part).filter(Boolean))]
          },
          style: {},
          textDigest: digestText(body)
        });
      }

      // Footnote gutter: lane allocation and top/capacity are derived from the
      // same deterministic LPT rule used by RED; no browser rectangles are read.
      const notes = Array.isArray(page.footnotes) ? page.footnotes : [];
      if (notes.length && boxBottom != null && templateCols.length) {
        const left = Math.min(...templateCols.map((c) => c.x));
        const right = Math.max(...templateCols.map((c) => c.x + c.w));
        const fullW = right - left;
        let laneW = Number(settings._fnColWidthPx) || Math.round(fullW);
        if (!(laneW > 0) || laneW > fullW) laneW = Math.round(fullW);
        const twoLanes = settings['footnote-columns'] === 2 && templateCols.length >= 2
          && laneW * 2 + (tpl.gutter || 0) <= fullW + 0.75;
        const lanes = [[], []];
        if (!twoLanes) lanes[0] = notes.map((note, index) => ({ note, index }));
        else {
          const order = notes.map((note, index) => ({ note, index, h: note.heightPx || 0 }))
            .sort((a, b) => b.h - a.h || a.index - b.index);
          const totals = [0, 0], laneOf = new Map();
          for (const item of order) {
            const lane = totals[0] <= totals[1] ? 0 : 1;
            totals[lane] += item.h;
            laneOf.set(item.index, lane);
          }
          notes.forEach((note, index) => lanes[laneOf.get(index)].push({ note, index }));
        }
        const reserved = page.fnReservedHeightPx > 0
          ? page.fnReservedHeightPx : notes.reduce((sum, note) => sum + (note.heightPx || 0), 0);
        const top = boxBottom - reserved;
        const laneX = twoLanes ? [left + laneW + (tpl.gutter || 0), left] : [left, left];
        addElement(elements, {
          elementId: 'footnote-area:' + pageId,
          role: 'footnote-area',
          parentId: 'page-flow:' + pageId,
          geometry: { x: left, y: top, w: fullW, h: reserved },
          attributes: { reservedHeightPx: reserved, noteCount: notes.length, laneCount: twoLanes ? 2 : 1 },
          style: {},
          textDigest: digestText('')
        });
        lanes.forEach((laneNotes, li) => {
          let y = top;
          for (const item of laneNotes) {
            const note = item.note;
            const pitch = Number(note.lineH) || Math.round((Number(settings['body-font-size-pt']) || 12) * 0.8 * (96 / 72) * 1.25);
            const h = Number(note.heightPx) || pitch;
            const tokenId = note.tokenId != null ? String(note.tokenId) : null;
            const noteIndex = Number.isInteger(note.noteIndex) ? note.noteIndex : null;
            const stableNoteKey = tokenId && noteIndex != null
              ? [tokenId, noteIndex, note.part || '', note.mode || '', note.continuationOf || '', note.isContinuation ? 'continuation' : 'base'].join(':')
              : null;
            const objectId = stableNoteKey || objectIdOf(note, 'footnote-fragment');
            if (!stableNoteKey) incomplete('footnote-fragment-without-stable-source-id');
            addElement(elements, {
              elementId: 'footnote-fragment:' + objectId,
              role: 'footnote-fragment',
              parentId: tokenId ? 'note:' + tokenId + ':' + (noteIndex == null ? 'unknown' : noteIndex) : 'footnote-area:' + pageId,
              tokenId,
              columnId: 'footnote-lane:' + pageId + ':' + li,
              fragmentId: objectId,
              geometry: { x: laneX[li], y, w: laneW, h },
              attributes: {
                marker: note.marker || null, noteIndex, mode: note.mode || null,
                isContinuation: !!note.isContinuation, continuationOf: note.continuationOf || null,
                lane: li, part: note.part || null
              },
              style: { customStyle: note.customStyle || null },
              textDigest: digestText(note.text || '')
            });
            y += h;
          }
        });
        if (settings['footnote-separator-rule'] && settings['footnote-separator-rule'] !== 'none') {
          const ruleStyle = settings['footnote-separator-rule'];
          const ruleSpec = {
            regular: { w: 0.75 }, circles: { w: 1.1 }, sparkle: { w: 1.1 },
            star: { w: 0.75, double: 1.5 }, diamond: { w: 1.1, scaleX: 0.6 }
          }[ruleStyle] || { w: 0.75 };
          const inkW = ruleSpec.scaleX ? fullW * ruleSpec.scaleX : fullW;
          const inkX = ruleSpec.scaleX ? left + (fullW - inkW) / 2 : left;
          const inkH = Math.max(0.75, ruleSpec.w * (96 / 72) + (ruleSpec.double || 0));
          addElement(elements, {
            elementId: 'footnote-rule:' + pageId,
            role: 'divider',
            parentId: 'footnote-area:' + pageId,
            geometry: { x: inkX, y: top, w: inkW, h: inkH },
            attributes: { kind: 'fn-rule', style: ruleStyle },
            style: { rule: ruleStyle },
            textDigest: digestText('')
          });
        }
      }

      // Side notes carry their anchor/source token IDs and final model placement.
      for (const note of page.sideNotes || []) {
        const tokenId = note.ownToken != null ? String(note.ownToken) : (note.anchorToken != null ? String(note.anchorToken) : null);
        const objectId = tokenId ? null : objectIdOf(note, 'side-note');
        if (!tokenId) incomplete('side-note-without-stable-source-id');
        const elementId = tokenId ? 'side-note:' + tokenId : 'side-note-object:' + objectId;
        if (note.yTop == null || note.x == null || note.colWidth == null || note.heightPx == null) {
          incomplete('side-note-placement-missing');
        }
        addElement(elements, {
          elementId,
          role: 'side-note',
          parentId: note.anchorToken != null ? 'token:' + note.anchorToken : 'page-flow:' + pageId,
          tokenId,
          geometry: note.yTop != null && note.x != null && note.colWidth != null && note.heightPx != null
            ? { x: note.x, y: note.yTop, w: note.colWidth, h: note.heightPx } : null,
          attributes: { anchorToken: note.anchorToken || null, ownToken: note.ownToken || null, counterMark: note.counterMark || null },
          style: { customStyle: note.isCustomStyle || null },
          textDigest: digestText(note.text || '')
        });
      }

      // Model-backed ornaments and heading/shaar dividers already carry exact rects.
      for (const decoration of page.decorations || []) {
        const slot = decoration.slot || decoration.kind || 'decoration';
        const stable = decoration.rollbackKey || decoration.tokenId || null;
        const objectId = stable ? null : objectIdOf(decoration, 'decoration');
        if (!stable) incomplete('decoration-without-stable-source-id');
        const elementId = 'decoration:' + pageId + ':' + slot + ':' + (stable || objectId);
        addElement(elements, {
          elementId,
          role: /divider/i.test(decoration.kind || '') ? 'divider' : 'ornament',
          parentId: pageId,
          geometry: [decoration.x, decoration.y, decoration.w, decoration.h].every(Number.isFinite)
            ? { x: decoration.x, y: decoration.y, w: decoration.w, h: decoration.h } : null,
          attributes: { kind: decoration.kind || null, slot, kindStyle: decoration.kindStyle || null, rollbackKey: decoration.rollbackKey || null },
          style: { image: decoration.image || null },
          textDigest: digestText('')
        });
      }

      // The column divider is a geometry-neutral overlay, but it is still a
      // page element and must appear in the inventory/delta.
      if (settings && typeof settings === 'object'
        && settings['column-divider-style'] && settings['column-divider-style'] !== 'none'
        && templateCols.length >= 2 && page.type !== 'endnotes') {
        // Match geometry-projector/renderColumnDivider exactly, including AQ stretch.
        const used = cols.map((column) => column.reduce((sum, line) =>
          sum + (line.heightPx || 0) * (line.aqStretch || 1), 0));
        const h = Math.max(0, Math.min(...used) - 8);
        if (h > 0) {
          const c1 = templateCols[1];
          const x = c1.x + c1.w + (tpl.gutter || 0) / 2;
          const dividerStyle = settings['column-divider-style'];
          const doubleOffset = dividerStyle === 'double' ? 1.5 : 0;
          const inkW = Math.max(0.75, 0.75 * (96 / 72) + doubleOffset);
          addElement(elements, {
            elementId: 'column-divider:' + pageId,
            role: 'divider',
            parentId: pageId,
            geometry: { x: x - inkW / 2, y: boxTop, w: inkW, h },
            attributes: { style: dividerStyle },
            style: {},
            textDigest: digestText('')
          });
        }
      }

      // Endnote pages store note objects, not body lines. Use the exact model
      // column and height budget from buildEndnotePages.
      if (page.type === 'endnotes') {
        const top = boxTop != null ? boxTop + (page.titleBandPx || 0) : null;
        const nCols = (page.columns || []).length;
        for (let ci = 0; ci < nCols; ci++) {
          const notesInColumn = page.columns[ci] || [];
          const tc = nCols === 1
            ? { x: boxLeft, w: boxRight != null && boxLeft != null ? boxRight - boxLeft : null }
            : (templateCols[ci] || null);
          let y = top;
          for (const note of notesInColumn) {
            const h = Number(note.heightPx) || null;
            const tokenId = note.tokenId != null ? String(note.tokenId) : null;
            const noteIndex = Number.isInteger(note.noteIndex) ? note.noteIndex : null;
            const stableNoteKey = tokenId && noteIndex != null ? [tokenId, noteIndex, note.part || ''].join(':') : null;
            const objectId = stableNoteKey || objectIdOf(note, 'endnote-fragment');
            if (!stableNoteKey) incomplete('endnote-fragment-without-stable-source-id');
            addElement(elements, {
              elementId: 'endnote-fragment:' + objectId,
              role: 'endnote-fragment',
              parentId: tokenId ? 'endnote:' + tokenId + ':' + (noteIndex == null ? 'unknown' : noteIndex) : 'column:' + pageId + ':' + ci,
              tokenId,
              columnId: 'column:' + pageId + ':' + ci,
              geometry: tc && tc.x != null && tc.w != null && y != null && h != null
                ? { x: tc.x, y, w: tc.w, h } : null,
              attributes: { marker: note.marker || null, noteIndex, columnIndex: ci, part: note.part || null },
              style: {},
              textDigest: digestText(note.text || '')
            });
            if (h != null) y += h;
            else incomplete('endnote-height-missing');
          }
        }
        if (page.heading && boxTop != null) {
          const titleBand = Number(page.titleBandPx);
          const titleHeight = Number.isFinite(titleBand) && titleBand > 16 ? titleBand - 16 : null;
          if (titleHeight == null) incomplete('endnote-title-height-not-explicit');
          addElement(elements, {
            elementId: 'endnote-title:' + pageId,
            role: 'heading',
            parentId: pageId,
            geometry: titleHeight != null ? { x: boxLeft, y: boxTop + 8, w: (boxRight || 0) - (boxLeft || 0), h: titleHeight } : null,
            attributes: { text: page.heading },
            style: {},
            textDigest: digestText(page.heading)
          });
        }
      }

      // TOC rows have stable source heading token anchors. Group rows use their
      // member token IDs; row ordinal is only a tie-breaker inside this page.
      if (page.toc && page.toc.title) {
        addElement(elements, {
          elementId: 'toc-title:' + pageId,
          role: 'heading',
          parentId: pageId,
          geometry: null,
          attributes: { text: page.toc.title, geometrySource: 'TOC title placement is CSS/render-flow, not explicit in page model' },
          style: {},
          textDigest: digestText(page.toc.title)
        });
        incomplete('toc-title-geometry-not-modelled');
      }
      if (page.toc && Array.isArray(page.toc.rows)) {
        page.toc.rows.forEach((row, rowIndex) => {
          const y = 70 + rowIndex * 24;
          if (row.kind === 'group') {
            (row.items || []).forEach((item, itemIndex) => {
              const tokenId = item.tokenId != null ? String(item.tokenId) : null;
              if (!tokenId) incomplete('toc-group-item-without-heading-token');
              const x = 18 + itemIndex * 80;
              addElement(elements, {
                elementId: 'toc-group-item:' + pageId + ':' + (tokenId || ('row-' + rowIndex + '-item-' + itemIndex)),
                role: 'toc-group-item',
                parentId: 'toc-row:' + pageId + ':' + rowIndex,
                tokenId,
                geometry: { x, y, w: 60, h: 24 },
                attributes: { level: item.level == null ? null : item.level, rowIndex, itemIndex, label: item.label || '' },
                style: {},
                textDigest: digestText([item.text || '', item.label || ''].filter(Boolean).join(' '))
              });
            });
          } else {
            const tokenId = row.tokenId != null ? String(row.tokenId) : null;
            if (!tokenId) incomplete('toc-row-without-heading-token');
            addElement(elements, {
              elementId: 'toc-row:' + pageId + ':' + (tokenId || ('row-' + rowIndex)),
              role: 'toc-row',
              parentId: pageId,
              tokenId,
              geometry: { x: 18, y, w: Math.max(0, (pageWidth || 0) - 36), h: 24 },
              attributes: { level: row.level == null ? null : row.level, rowIndex, label: row.label || '' },
              style: {},
              textDigest: digestText([row.text || '', row.label || ''].filter(Boolean).join(' '))
            });
          }
        });
      }
      // Custom pages are fixed-position boxes/images with source definition ID.
      if (page.custom) {
        if (page.custom.background) addElement(elements, {
          elementId: 'custom-background:' + (page.custom.customId || pageId),
          role: 'page-background',
          parentId: pageId,
          geometry: pageWidth != null && pageHeight != null ? { x: 0, y: 0, w: pageWidth, h: pageHeight } : null,
          attributes: { background: page.custom.background },
          style: { background: page.custom.background },
          textDigest: digestText(page.custom.background)
        });
        for (let i = 0; i < (page.custom.boxes || []).length; i++) {
          const boxModel = page.custom.boxes[i];
          addElement(elements, {
            elementId: 'custom-box:' + page.custom.customId + ':' + i,
            role: 'custom-box',
            parentId: pageId,
            geometry: { x: boxModel.x, y: boxModel.y, w: boxModel.w, h: boxModel.h },
            attributes: { index: i },
            style: {},
            textDigest: digestText(boxModel.text || '')
          });
        }
        for (let i = 0; i < (page.custom.images || []).length; i++) {
          const image = page.custom.images[i];
          addElement(elements, {
            elementId: 'custom-image:' + page.custom.customId + ':' + i,
            role: 'custom-image',
            parentId: pageId,
            geometry: { x: image.x, y: image.y, w: image.w, h: image.h },
            attributes: { index: i, src: image.src || '' },
            style: {},
            textDigest: digestText(image.src || '')
          });
        }
      }

      // Projection provides exact measured header/folio slot widths. It is
      // injected by the caller so this adapter never remeasures/re-typesets.
      const projection = Array.isArray(input.projectedPages)
        ? input.projectedPages[pageArrayIndex] || null
        : (typeof options.projectPage === 'function' ? options.projectPage(page, settings) : null);
      if (projection && projection.header) {
        const header = projection.header;
        const headerSlots = (header.slots || []).filter((slot) =>
          Number.isFinite(slot.x) && Number.isFinite(slot.w) && Number.isFinite(header.y));
        const headerBox = null;
        if (headerSlots.length) incomplete('header-line-box-height-not-explicit');
        addElement(elements, {
          elementId: 'running-header:' + pageId,
          role: 'running-header',
          parentId: pageId,
          geometry: headerBox,
          attributes: { separator: page.header && page.header.separator || 'none' },
          style: {},
          textDigest: digestText((header.slots || []).map((s) => s.text || '').join('|'))
        });
        for (const slot of header.slots || []) {
          addElement(elements, {
            elementId: 'header-slot:' + pageId + ':' + slot.pos,
            role: 'header-slot',
            parentId: 'running-header:' + pageId,
            geometry: null,
            attributes: { pos: slot.pos, align: slot.align || null, sizePt: slot.sizePt || null, x: slot.x, y: header.y, w: slot.w },
            style: {},
            textDigest: digestText(slot.text || '')
          });
        }
        if (page.header && page.header.separator && page.header.separator !== 'none') {
          addElement(elements, {
            elementId: 'header-separator:' + pageId,
            role: 'divider',
            parentId: 'running-header:' + pageId,
            geometry: null,
            attributes: { style: page.header.separator, geometrySource: 'CSS head--sep-* (not separately projected)' },
            style: {},
            textDigest: digestText('')
          });
          incomplete('header-separator-rect-not-present-in-model');
        }
      } else if (page.header) {
        addElement(elements, {
          elementId: 'running-header:' + pageId,
          role: 'running-header',
          parentId: pageId,
          geometry: null,
          attributes: { separator: page.header.separator || 'none' },
          style: {},
          textDigest: digestText(Object.values(page.header.slots || {}).map((s) => s && s.text || '').join('|'))
        });
        incomplete('header-projection-not-supplied');
      }
      if (page.header && page.header.separator && page.header.separator !== 'none' && !(projection && projection.header)) {
        addElement(elements, {
          elementId: 'header-separator:' + pageId,
          role: 'divider',
          parentId: 'running-header:' + pageId,
          geometry: null,
          attributes: { style: page.header.separator, geometrySource: 'CSS head--sep-* (not separately projected)' },
          style: {},
          textDigest: digestText('')
        });
        incomplete('header-separator-rect-not-present-in-model');
      }
      if (projection && projection.folio) {
        addElement(elements, {
          elementId: 'folio:' + pageId,
          role: 'folio',
          parentId: pageId,
          geometry: [projection.folio.x, projection.folio.y, projection.folio.w].every(Number.isFinite)
            ? { x: projection.folio.x, y: projection.folio.y, w: projection.folio.w, h: 16 } : null,
          attributes: { text: projection.folio.text || '' },
          style: {},
          textDigest: digestText(projection.folio.text || '')
        });
      } else if (page.folioDisplay) {
        addElement(elements, {
          elementId: 'folio:' + pageId,
          role: 'folio',
          parentId: pageId,
          geometry: null,
          attributes: { text: page.folioDisplay },
          style: {},
          textDigest: digestText(page.folioDisplay)
        });
        incomplete('folio-projection-not-supplied');
      }

      if (/^shaar-/.test(page.type || '')) {
        const shaarLines = (projection && Array.isArray(projection.lines) ? projection.lines : [])
          .filter((line) => line.kind === 'shaar-content');
        if (!projection) incomplete('shaar-projection-not-supplied');
        const grouped = new Map();
        const shaarModel = require('../output/shaar-content').buildShaarBlocks(page, settings, page._metadata);
        if (shaarModel && shaarModel.blocks.some((block) => block.graphic)) {
          addElement(elements, {
            elementId: 'shaar-graphic:' + pageId,
            role: 'ornament',
            parentId: pageId,
            geometry: null,
            attributes: { graphic: shaarModel.blocks.filter((block) => block.graphic).map((block) => block.graphic) },
            style: {},
            textDigest: digestText('')
          });
          incomplete('shaar-graphic-geometry-not-modelled');
        }
        for (const line of shaarLines) {
          const cls = line.cls || 'shaar-content';
          const list = grouped.get(cls) || [];
          list.push(line);
          grouped.set(cls, list);
        }
        for (const [cls, lines] of grouped) {
          const items = lines.map((line) => ({
            geometry: { x: line.x, y: line.y, w: line.w, h: line.h }
          }));
          addElement(elements, {
            elementId: 'shaar-block:' + pageId + ':' + cls,
            role: 'shaar-content-block',
            parentId: pageId,
            geometry: unionGeometry(items),
            attributes: { className: cls, lineCount: lines.length },
            style: {},
            textDigest: digestText(lines.map((line) => (line.words || []).map((w) => w.text).join(' ')).join('\n'))
          });
        }
      }

      if (page.type === 'custom' && !page.custom) incomplete('custom-page-model-missing');
      if (page.type === 'endnotes' && !Array.isArray(page.columns)) incomplete('endnote-columns-missing');

      let evaluatedKinds;
      let hasEvaluationEntry = false;
      const evaluationMap = input.evaluatedKindsByPage;
      if (evaluationMap instanceof Map) {
        if (evaluationMap.has(pageId)) { evaluatedKinds = evaluationMap.get(pageId); hasEvaluationEntry = true; }
        else if (evaluationMap.has(String(page.index))) { evaluatedKinds = evaluationMap.get(String(page.index)); hasEvaluationEntry = true; }
        else if (evaluationMap.has(page.index)) { evaluatedKinds = evaluationMap.get(page.index); hasEvaluationEntry = true; }
      } else if (evaluationMap && typeof evaluationMap === 'object') {
        if (Object.prototype.hasOwnProperty.call(evaluationMap, pageId)) { evaluatedKinds = evaluationMap[pageId]; hasEvaluationEntry = true; }
        else if (Object.prototype.hasOwnProperty.call(evaluationMap, String(page.index))) { evaluatedKinds = evaluationMap[String(page.index)]; hasEvaluationEntry = true; }
      }
      if (!hasEvaluationEntry) incomplete('evaluated-kinds-not-supplied-for-page');
      else if (!Array.isArray(evaluatedKinds)) incomplete('invalid-evaluated-kinds');
      const normalizedEvaluatedKinds = Array.isArray(evaluatedKinds) ? evaluatedKinds.slice() : [];

      const pageRow = {
        pageId,
        pageIndex: Number.isInteger(page.index) ? page.index : null,
        pageType: page.type || 'unknown',
        metrics: {
          pageWidthPx: pageWidth,
          pageHeightPx: pageHeight,
          contentBox: { x: boxLeft, y: boxTop, w: boxRight != null && boxLeft != null ? boxRight - boxLeft : null, h: boxBottom != null && boxTop != null ? boxBottom - boxTop : null },
          columnUsedHeightsPx: cols.map((col) => col.reduce((sum, line) => sum + (line.heightPx || 0) * (line.aqStretch || 1), 0)),
          footnoteReservedHeightPx: page.fnReservedHeightPx || 0,
          spanningHeightPx: spanHeight,
          terminalResidual: !!page.terminalResidual,
          chapterOpening: !!page.chapterOpening
        },
        evaluatedKinds: normalizedEvaluatedKinds,
        findings: [],
        elements
      };
      pageRows.push(pageRow);
      pageById.set(pageId, pageRow);
      elementsByPage.set(pageId, elements);
    });

    const indexMap = new Map();
    for (const row of pageRows) if (row.pageIndex != null) indexMap.set(row.pageIndex, row.pageId);
    if (input.stage) {
      const stage = String(input.stage);
      if (!pageIndexMaps.has(stage)) pageIndexMaps.set(stage, indexMap);
      else {
        const previous = pageIndexMaps.get(stage);
        const keys = new Set([...previous.keys(), ...indexMap.keys()]);
        if ([...keys].some((key) => previous.get(key) !== indexMap.get(key))) {
          ambiguousPageIndexStages.add(stage);
        }
      }
    }

    const issueList = ledgerIssuesOf(input.ledger);
    const normalizedIssues = [];
    for (const issue of issueList) {
      const target = String(issue.target || '');
      let resolvedPageId = typeof issue.pageId === 'string' ? issue.pageId : null;
      let resolvedTargetId = typeof issue.targetElementId === 'string' ? issue.targetElementId : null;
      let mapReason = null;

      const issueStage = issue.first_seen_stage ? String(issue.first_seen_stage) : null;
      const stageMapIsAmbiguous = !!issueStage && ambiguousPageIndexStages.has(issueStage);
      const byPageIndex = issueStage && !stageMapIsAmbiguous && pageIndexMaps.has(issueStage)
        ? pageIndexMaps.get(issueStage).get(Number(issue.page))
        : null;
      if (stageMapIsAmbiguous) {
        mapReason = 'page-index-map-changed-within-stage';
      }
      const parsedPage = parsePageTarget(target);
      const targetSeq = targetSequence(target);
      const tokenId = targetToken(target);

      if (!resolvedPageId && byPageIndex) resolvedPageId = byPageIndex;
      if (!resolvedPageId && parsedPage) {
        const stageName = issue.first_seen_stage ? String(issue.first_seen_stage) : null;
        const map = stageName && !ambiguousPageIndexStages.has(stageName) ? pageIndexMaps.get(stageName) : null;
        if (map) resolvedPageId = map.get(parsedPage.pageIndex) || null;
      }

      let candidates = [];
      if (resolvedPageId) {
        const elems = elementsByPage.get(resolvedPageId) || [];
        if (resolvedTargetId) candidates = elems.filter((el) => el.elementId === resolvedTargetId);
        else if (targetSeq != null) candidates = elems.filter((el) => el.elementId === 'line-seq-' + targetSeq);
        else if (tokenId) candidates = elems.filter((el) => el.elementId === 'block-fragment:' + resolvedPageId + ':' + tokenId);
        else if (parsedPage && parsedPage.columnIndex != null) candidates = elems.filter((el) => el.elementId === 'column:' + resolvedPageId + ':' + parsedPage.columnIndex);
        else if (parsedPage) candidates = elems.filter((el) => el.elementId === 'page-flow:' + resolvedPageId);
        else candidates = [];
      } else if (targetSeq != null) {
        candidates = pageRows.flatMap((row) => (row.elements || [])
          .filter((el) => el.elementId === 'line-seq-' + targetSeq)
          .map((el) => ({ pageId: row.pageId, element: el })));
        if (candidates.length === 1) {
          resolvedPageId = candidates[0].pageId;
          resolvedTargetId = candidates[0].element.elementId;
          candidates = [candidates[0].element];
        } else if (candidates.length > 1) {
          mapReason = 'sequence-matches-multiple-pages';
        }
      } else if (tokenId) {
        candidates = pageRows.flatMap((row) => (row.elements || [])
          .filter((el) => el.elementId === 'block-fragment:' + row.pageId + ':' + tokenId)
          .map((el) => ({ pageId: row.pageId, element: el })));
        if (candidates.length === 1) {
          resolvedPageId = candidates[0].pageId;
          resolvedTargetId = candidates[0].element.elementId;
          candidates = [candidates[0].element];
        }
      }

      if (!resolvedTargetId && candidates.length === 1) resolvedTargetId = candidates[0].elementId;
      if (!resolvedPageId || !resolvedTargetId || candidates.length !== 1) {
        mapReason = mapReason || (candidates.length > 1 ? 'target-matches-multiple-elements' : 'no-stable-page-or-element-match');
        capture.unmappedIssues.push({ issueId: issue.issue_id, kind: issue.kind, target, page: issue.page, reason: mapReason });
        capture.complete = false;
        capture.reasons.add('ledger-issue-unmapped');
      }

      const normalized = {
        ...issue,
        pageId: resolvedPageId,
        targetElementId: resolvedTargetId,
        mapStatus: mapReason ? 'unmapped' : 'mapped',
        mapReason
      };
      normalizedIssues.push(normalized);
      if (resolvedPageId && resolvedTargetId && activeIssue(issue)) {
        const row = pageById.get(resolvedPageId);
        if (row) {
          row.findings.push({
            issueId: issue.issue_id,
            kind: issue.kind,
            targetElementId: resolvedTargetId,
            predicate: issue.predicate_after || issue.predicate_before || null
          });
        }
      }
    }

    return {
      schema: 'red-step-audit-model-v1',
      capture: {
        complete: capture.complete,
        reasons: [...capture.reasons].sort(),
        unmappedIssues: capture.unmappedIssues,
        pageCount: capture.pageCount
      },
      checkpoint: {
        checkpointId: input.checkpointId || ('checkpoint-' + String(input.seq || 0)),
        seq: Number.isFinite(input.seq) ? input.seq : 0,
        stage: input.stage || 'unknown',
        operationId: input.operationId || null,
        pages: pageRows
      },
      issues: normalizedIssues
    };
  }

  return { snapshot };
}

module.exports = { createStepAuditModelAdapter, digestText, lineTokenId };
