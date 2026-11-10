#!/usr/bin/env node
'use strict';

// Session 03 — deterministic reproduction/inspection of the already-known
// two-word loss in the fixed stress document. This script does not modify
// engine code. It captures the exact source tokens and where their units
// appear in the final legacy layout.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const RB = path.join(ROOT, 'red-build');
const OUT = path.join(__dirname, 'out');

const { generateTestDocument, FIXED_SEED } = require(path.join(RB, 'src/ui/test-doc-generator'));
const { legacyTypeset } = require(path.join(RB, 'src/engine/layout/legacy-imud-flow'));
const { getSettingDefs } = require(path.join(RB, 'src/engine/core/settings-registry'));
const { importImudSettings } = require(path.join(RB, 'src/engine/core/legacy-settings-map'));

const DEFAULTS = JSON.parse(fs.readFileSync(
  path.join(RB, 'ui/assets/imud/default_settings.json'), 'utf8'
));

function settingsForFixedDocument() {
  const registryKeys = new Set(getSettingDefs().map(def => def.id));
  return importImudSettings(DEFAULTS, registryKeys, {}).settings;
}

function textOfWord(word) {
  if (typeof word === 'string') return word;
  if (word && typeof word.t === 'string') return word.t;
  if (word && typeof word.text === 'string') return word.text;
  return '';
}

function lineText(line) {
  return (line && Array.isArray(line.words) ? line.words : []).map(textOfWord).filter(Boolean).join(' ');
}

function tokenNumericId(token) {
  const m = String(token && token.id || '').match(/^lt(\d+)$/);
  return m ? Number(m[1]) : null;
}

function outputRefsForToken(pages, tokenId) {
  const refs = [];
  pages.forEach((page, pageIndex) => {
    (page.columns || []).forEach((column, columnIndex) => {
      (column || []).forEach((line, lineIndex) => {
        if (line.tokenId === tokenId || String(line.tokenId) === String(tokenId)) {
          refs.push({
            page: pageIndex + 1,
            pageIndex,
            column: columnIndex + 1,
            line: lineIndex + 1,
            kind: line.kind || null,
            text: lineText(line),
            lineKeys: Object.keys(line || {}).sort()
          });
        }
      });
    });
    (page.bands || []).forEach((band, bandIndex) => {
      if (band.tokenId === tokenId || String(band.tokenId) === String(tokenId)) {
        refs.push({
          page: pageIndex + 1,
          pageIndex,
          region: 'band',
          bandIndex,
          kind: band.kind || null,
          text: String(band.text || ''),
          lineKeys: Object.keys(band || {}).sort()
        });
      }
    });
  });
  return refs;
}

function sourceHeadingLines(documentText) {
  return documentText.split(/\r?\n/).map((line, index) => {
    const m = line.match(/^כותרת\s*([4-6])(?:\s+מספר\s+\d+)?\s*[-–—]\s*(.*)$/);
    return m ? { line: index + 1, level: Number(m[1]), text: m[2].trim() } : null;
  }).filter(x => x && /לשון\s+הפוסקים/.test(x.text));
}

function normalizeIssue(issue) {
  return {
    issue_id: issue.issue_id,
    kind: issue.kind,
    target: issue.target,
    page: issue.page,
    status: issue.status,
    first_seen_stage: issue.first_seen_stage,
    predicate_before: issue.predicate_before,
    predicate_after: issue.predicate_after,
    transitions: issue.transitions
  };
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const documentText = generateTestDocument({ mode: 'fixed', scale: 'full' });
  const settings = settingsForFixedDocument();
  const result = legacyTypeset(documentText, settings, {});

  const sourceHeadings = sourceHeadingLines(documentText);
  const candidateTokens = (result.tokens || []).map((token, tokenIndex) => ({ token, tokenIndex }))
    .filter(({ token }) =>
      /^(h4|h5|h6)$/.test(String(token.type)) && /לשון\s+הפוסקים/.test(String(token.text || ''))
    ).map(({ token, tokenIndex }, occurrenceIndex) => {
      const tokenId = tokenNumericId(token);
      const refs = tokenId == null ? [] : outputRefsForToken(result.pages || [], tokenId);
      return {
        ...token,
        tokenIndex,
        tokenId,
        sourceLine: sourceHeadings[occurrenceIndex] || null,
        outputRefCount: refs.length,
        outputRefs: refs.slice(0, 8)
      };
    });

  const missingCandidateTokens = candidateTokens.filter(token => token.outputRefCount === 0);
  const documentLines = documentText.split(/\r?\n/);
  const missingSourceContexts = missingCandidateTokens.map(token => ({
    tokenId: token.tokenId,
    tokenIndex: token.tokenIndex,
    sourceLine: token.sourceLine,
    context: token.sourceLine
      ? documentLines.slice(Math.max(0, token.sourceLine.line - 5), token.sourceLine.line + 4)
          .map((text, index) => ({
            line: Math.max(1, token.sourceLine.line - 4) + index,
            text
          }))
      : []
  }));

  const tokenNeighborhoods = missingCandidateTokens.map(missing => {
    const from = Math.max(0, missing.tokenIndex - 6);
    const to = Math.min((result.tokens || []).length, missing.tokenIndex + 7);
    return {
      missingTokenId: missing.tokenId,
      sourceLine: missing.sourceLine,
      tokens: (result.tokens || []).slice(from, to).map(token => {
        const tokenId = tokenNumericId(token);
        const refs = tokenId == null ? [] : outputRefsForToken(result.pages || [], tokenId);
        return {
          id: token.id,
          tokenId,
          type: token.type,
          level: token.level || null,
          text: String(token.text || '').slice(0, 260),
          sideNote: token.sideNote ? String(token.sideNote).slice(0, 180) : null,
          outputRefCount: refs.length,
          outputRefs: refs.slice(0, 5)
        };
      })
    };
  });

  const contentLossIssues = [...(result.ledger && result.ledger.issues
    ? result.ledger.issues.values() : [])]
    .filter(issue => issue.kind === 'content-loss')
    .map(normalizeIssue);

  const columnImbalanceCount = [...(result.ledger && result.ledger.issues
    ? result.ledger.issues.values() : [])]
    .filter(issue => issue.kind === 'column-imbalance').length;

  const outputLines = [];
  (result.pages || []).forEach((page, pageIndex) => {
    (page.columns || []).forEach((column, columnIndex) => {
      (column || []).forEach((line, lineIndex) => {
        outputLines.push({
          page: pageIndex + 1,
          column: columnIndex + 1,
          line: lineIndex + 1,
          tokenId: line.tokenId == null ? null : line.tokenId,
          kind: line.kind || null,
          text: lineText(line)
        });
      });
    });
  });

  const outputTargetLines = outputLines.filter(x =>
    /לשון|הפוסקים/.test(x.text)
  );

  const report = {
    schema: 'content-loss-repro-v1',
    generatedAt: new Date().toISOString(),
    repository: 'SUGINACH/Tora_Book_Typesetter_Red_Work',
    path: 'legacy-imud-flow',
    generator: 'generateTestDocument({mode:"fixed",scale:"full"})',
    fixedSeed: FIXED_SEED,
    input: {
      sha256: crypto.createHash('sha256').update(documentText, 'utf8').digest('hex'),
      bytes: Buffer.byteLength(documentText, 'utf8'),
      lines: documentText.split(/\r?\n/).length,
      wordsWhitespace: documentText.split(/[\s\u00A0]+/).filter(Boolean).length
    },
    result: {
      layoutHash: result.layoutHash,
      pages: (result.pages || []).length,
      contentPreserved: result.contentPreserved,
      contentStats: result.contentStats || null,
      contentLossIssues,
      columnImbalanceCount
    },
    sourceHeadingPhrase: {
      occurrences: sourceHeadings.length,
      sourceLines: sourceHeadings,
      parsedTokens: candidateTokens,
      missingSourceContexts,
      tokenNeighborhoods
    },
    outputLinesContainingTargetWords: outputTargetLines,
    diagnostics: {
      pageColumns: (result.pages || []).slice(0, 3).map((p, i) => ({
        page: i + 1,
        pageType: p.type,
        columnCount: (p.columns || []).length,
        sampleLineKeys: (p.columns || []).flat().slice(0, 3).map(x => Object.keys(x || {}).sort())
      }))
    }
  };

  fs.writeFileSync(path.join(OUT, 'content-loss-report.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, 'fixed-test-document.txt'), documentText, 'utf8');
  console.log(JSON.stringify({
    input: report.input,
    pages: report.result.pages,
    layoutHash: report.result.layoutHash,
    contentPreserved: report.result.contentPreserved,
    contentStats: report.result.contentStats,
    contentLossIssues,
    sourceHeadingOccurrences: sourceHeadings.length,
    candidateTokens: candidateTokens.map(t => ({
      id: t.id, type: t.type, level: t.level, text: t.text,
      outputRefs: t.outputRefs
    })),
    reportPath: 'execution/repro/out/content-loss-report.json'
  }, null, 2));
}

main();
