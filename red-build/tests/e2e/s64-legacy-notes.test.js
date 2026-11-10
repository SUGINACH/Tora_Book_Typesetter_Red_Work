// tests/e2e/s64-legacy-notes.test.js — Session 05: Legacy/IMUD note-path matrix
'use strict';

const { describe, it, assert, assertEq, report } = require('../harness');
const { legacyTypeset } = require('../../src/engine/layout/legacy-imud-flow');
const { importImudSettings } = require('../../src/engine/core/legacy-settings-map');
const { getSettingDefs } = require('../../src/engine/core/settings-registry');

const IMUD_RAW = require('../../ui/assets/imud/default_settings.json');
const REGISTRY = new Set(getSettingDefs().map(def => def.id));

function legacySettings(overrides = {}) {
  const imported = importImudSettings(IMUD_RAW, REGISTRY, {}).settings;
  return { ...imported, ...(overrides || {}) };
}

function markersByPage(result) {
  return (result.pages || []).map((page, pageIndex) => {
    const markers = [];
    for (const note of page.footnotes || []) {
      if (note.marker) markers.push(String(note.marker));
      for (const line of note.lines || []) {
        for (const word of line.words || []) {
          if (word && typeof word === 'object' && word.mk && word.t) markers.push(String(word.t));
        }
      }
    }
    return { page: pageIndex + 1, type: page.type, markers };
  }).filter(page => page.markers.length);
}

function firstMarkersCount(result) {
  return markersByPage(result).reduce((count, page) =>
    count + page.markers.filter(marker => marker === 'א.').length, 0);
}

function markerNumber(marker) {
  const text = String(marker || '').replace(/[׳״.]/g, '');
  const values = { 'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10 };
  return values[text] || null;
}

function buildManyNotesDoc(count) {
  const paras = [];
  for (let i = 1; i <= count; i++) {
    paras.push(`פסקה ${i} עם תוכן קצר בגוף הספר [הערה${i} עם כמה מילים לשם בדיקת מספור הערות בעמודים שונים].`);
  }
  return ['כותרת 2 - פרק מספור', ...paras].join('\n\n');
}

function buildScopeDoc() {
  const makeNotes = (prefix, count) => Array.from({ length: count }, (_, i) =>
    `פסקה ${prefix}-${i + 1} עם תוכן [הערה ${prefix}-${i + 1}].`
  ).join('\n\n');
  return [
    'כותרת 1 - חלק ראשון',
    'כותרת 2 - פרק ראשון',
    makeNotes('א', 4),
    'כותרת 2 - פרק שני',
    makeNotes('ב', 4),
    'כותרת 1 - חלק שני',
    'כותרת 2 - פרק שלישי',
    makeNotes('ג', 4)
  ].join('\n\n');
}

function outputFootnoteText(result) {
  const out = [];
  for (const page of result.pages || []) {
    for (const note of page.footnotes || []) {
      for (const line of note.lines || []) {
        for (const word of line.words || []) {
          out.push(String(word && typeof word === 'object' ? word.t || '' : word || ''));
        }
      }
    }
  }
  return out.join(' ');
}

function outputEndnoteText(result) {
  const out = [];
  for (const page of result.pages || []) {
    if (page.type !== 'endnotes') continue;
    for (const col of page.columns || []) {
      for (const line of col || []) out.push((line.words || []).map(w => String(w && w.t != null ? w.t : w)).join(' '));
    }
  }
  return out.join(' ');
}

function outputMarginText(result) {
  return (result.pages || []).flatMap(page =>
    (page.marginNotes || []).flatMap(note => (note.lines || []).map(line => line.text))
  ).join(' ');
}

describe('S6.4 / Session 05 — Legacy/IMUD footnote reset policy', () => {
  it('page override must reset markers at each page; section override must continue across page breaks', () => {
    const doc = buildManyNotesDoc(90);
    const pageResult = legacyTypeset(doc, legacySettings({
      'fn-layout-mode': 'block',
      'footnote-reset-policy': 'page'
    }), {});
    const sectionResult = legacyTypeset(doc, legacySettings({
      'fn-layout-mode': 'block',
      'footnote-reset-policy': 'section'
    }), {});

    assertEq(pageResult.contentPreserved, true, 'page policy preserves all content');
    assertEq(sectionResult.contentPreserved, true, 'section policy preserves all content');
    const pageMarkers = markersByPage(pageResult);
    const sectionMarkers = markersByPage(sectionResult);
    assert(pageMarkers.length >= 2, `fixture must produce footnotes on at least two pages; got ${pageMarkers.length}`);
    assert(sectionMarkers.length >= 2, `section fixture must produce footnotes on at least two pages; got ${sectionMarkers.length}`);

    assert(pageMarkers.every(page => page.markers[0] === 'א.'),
      'page policy: first fresh note on every page must restart at א.');
    assert(sectionMarkers[0].markers[0] === 'א.', 'section policy starts the section at א.');
    assert(sectionMarkers.slice(1).some(page => page.markers[0] !== 'א.'),
      'section policy must continue its numbering across a page break');
  });

  it('section, part and continuous scopes have distinct reset boundaries', () => {
    const doc = buildScopeDoc();
    const modes = ['section', 'part', 'continuous'];
    const results = Object.fromEntries(modes.map(mode => [mode, legacyTypeset(doc, legacySettings({
      'fn-layout-mode': 'block',
      'footnote-reset-policy': mode
    }), {})]));

    for (const mode of modes) {
      assertEq(results[mode].contentPreserved, true, `${mode} reset policy preserves content`);
      assert(markersByPage(results[mode]).length >= 3, `${mode} fixture must expose markers in all three chapters`);
    }

    const counts = Object.fromEntries(modes.map(mode => [mode, firstMarkersCount(results[mode])]));
    assertEq(counts.section, 3, `section resets at each of three H2 chapters: ${JSON.stringify(counts)}`);
    assertEq(counts.part, 2, `part resets at each of two H1 parts: ${JSON.stringify(counts)}`);
    assertEq(counts.continuous, 1, `continuous resets only at the beginning of the document: ${JSON.stringify(counts)}`);
  });
});

describe('Session 05 — Legacy/IMUD note-path content and placement', () => {
  it('inline footnotes remain lossless in continuous and block layout modes', () => {
    const doc = [
      'כותרת 2 - הערות שוליים',
      'פסקה ראשונה עם שתי הערות זהות [שם] וגם [שם] כדי לוודא זהות מופע.',
      'פסקה שנייה עם הערה ארוכה [הערה ארוכה עם מילים רבות שנועדו לבדוק עטיפה ומיקום תקין של כל שורות ההערה בתוך המרזב של העמוד הבא אם אין מקום מספיק בעמוד הנוכחי].',
      'פסקה שלישית ללא הערה.'
    ].join('\n\n');

    for (const mode of ['continuous', 'block']) {
      const result = legacyTypeset(doc, legacySettings({ 'fn-layout-mode': mode }), {});
      assertEq(result.contentPreserved, true, `${mode}: כל מילות הגוף וההערות נשמרו`);
      const notes = outputFootnoteText(result);
      assert(notes.includes('שם'), `${mode}: טקסט ההערה קיים במרזב`);
      assert((result.pages || []).some(page => (page.footnotes || []).length > 0),
        `${mode}: אזור הערות נבנה`);
    }
  });

  it('long footnote split/carry remains lossless and never overlaps body lines', () => {
    const bigNote = Array.from({ length: 700 }, (_, i) => 'מילה' + i).join(' ');
    const paras = Array.from({ length: 36 }, (_, i) => `פסקה ${i} עם תוכן גוף קצר למילוי רצף הספר.`).join('\n\n');
    const doc = `כותרת 2 - פרק א\n\n${paras}\n\nפסקה עם הערת ענק [${bigNote}]\n\nכותרת 2 - פרק ב\n\nפסקת המשך.`;

    for (const mode of ['continuous', 'block']) {
      const result = legacyTypeset(doc, legacySettings({ 'fn-layout-mode': mode, 'long-footnote-policy': 'split' }), {});
      assertEq(result.contentPreserved, true, `${mode}: הערת הענק וכל גוף הספר נשמרו`);
      const pagesWithNotes = (result.pages || []).filter(page => (page.footnotes || []).length);
      assert(pagesWithNotes.length >= 2, `${mode}: הערת הענק חייבת להמשיך מעבר לעמוד אחד`);
      for (const page of pagesWithNotes) {
        const noteYs = (page.footnotes || []).flatMap(note => (note.lines || []).map(line => line.y)).filter(Number.isFinite);
        if (!noteYs.length) continue;
        const noteTop = Math.min(...noteYs);
        for (const col of page.columns || []) {
          for (const line of col || []) {
            const lineBottom = Number(line.y || 0) + Number(line.heightPx || 21.44);
            assert(lineBottom <= noteTop + 0.5,
              `${mode}: body/footnote overlap on page ${page.index}`);
          }
        }
      }
    }
  });

  it('endnote-prefix records produce endnote pages and preserve mixed footnote/endnote text', () => {
    const longEndnote = Array.from({ length: 180 }, (_, i) => 'סיום' + i).join(' ');
    const doc = [
      'כותרת 2 - פרק הערות',
      'פסקה עם הערת שוליים [הערת שוליים בגוף] וגם תוכן רגיל.',
      `הערת סיום - ${longEndnote}`,
      'פסקה שאליה משויכת הערת הסיום.',
      'פסקה נוספת עם הערת שוליים [הערה נוספת].',
      'הערת סיום - הערת סיום שנייה עם טקסט קצר.',
      'פסקה אחרונה.'
    ].join('\n\n');

    const result = legacyTypeset(doc, legacySettings(), {});
    assertEq(result.contentPreserved, true, 'mixed footnotes/endnotes preserve all content');
    assertEq(result.endnotePagesInfo.count, 2, 'two source endnotes are collected');
    assert((result.pages || []).some(page => page.type === 'endnotes'), 'dedicated endnote pages are present');
    assert((result.pages || []).some(page => (page.footnotes || []).length > 0), 'inline footnotes remain in the gutter');
    const endText = outputEndnoteText(result);
    assert(endText.includes('סיום0') && endText.includes('סיום179'), 'long endnote reaches the final word');
  });

  it('H7 side notes attach to their host paragraph; multiple pending H7 headings are accumulated', () => {
    const doc = [
      'כותרת 2 - הערות צד',
      'כותרת 7 - הערת צד ראשונה',
      'כותרת 7 - הערת צד שנייה',
      'פסקה מארחת עם תוכן גוף.'
    ].join('\n\n');
    const result = legacyTypeset(doc, legacySettings(), {});
    assertEq(result.contentPreserved, true, 'H7 side-note content is preserved');
    const marginText = outputMarginText(result);
    assert(marginText.includes('הערת צד ראשונה'), 'first pending H7 is in the margin note');
    assert(marginText.includes('הערת צד שנייה'), 'second pending H7 is accumulated, not overwritten');
    assert((result.pages || []).some(page => (page.marginNotes || []).length > 0), 'margin-note geometry is present');
  });

  it('tail H7 and tail endnote are flushed instead of disappearing at end of document', () => {
    const doc = [
      'כותרת 2 - זנבות הערות',
      'פסקה רגילה לפני הסיום.',
      'כותרת 7 - הערת צד זנבורית',
      'הערת סיום - הערת סיום זנבורית'
    ].join('\n\n');
    const result = legacyTypeset(doc, legacySettings(), {});
    assertEq(result.contentPreserved, true, 'pending tail side/end note content is preserved');
    assert(result.contentStats.missingCount === 0, `tail content missing: ${JSON.stringify(result.contentStats)}`);
  });
});

report();
