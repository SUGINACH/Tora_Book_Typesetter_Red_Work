# Session 01 — RED Work baseline

> Status: IN PROGRESS — this record deliberately contains no test result until a run finishes.
> Repository: SUGINACH/Tora_Book_Typesetter_Red_Work
> Start branch: main
> Start commit: 6f801568c15071a27f97918ff8479def9c719c0d
> Work branch: work/session-01-baseline
> Session date: 2026-11-10

## Scope

Establish a reproducible starting point in the mirror repository before changing engine, UI, font-loading, audit, or test behavior.

## Repository guardrails

- All changes in this execution are limited to Tora_Book_Typesetter_Red_Work.
- No writes to Tora_Book_Typesetter_Red.
- No merge between V21 and V23.
- No engine changes in this session.
- Preserve the starting commit and all pre-existing branches.

## Initial repository observations

- The mirror and original RED main branches had the same HEAD at the start of this session:
  `6f801568c15071a27f97918ff8479def9c719c0d`.
- The repository contains CI, layout-parity, full-math-audit, gh-pages-audit, and Pages deployment workflows.
- At inspection time, the mirror had no recorded Actions runs and no status checks for the starting commit. This is not proof that Actions are disabled; this session will test whether pull-request events start the workflows.
- The worklog's latest documented baseline is S6.2 (10.11.2026): 670 tests in 33 files. This is historical documentation, not a fresh run on this mirror.
- The documented two-word content-loss finding ("לשון", "הפוסקים") remains open in the worklog and issue registry until reproduced or disproved.

## Required baseline commands / workflows

Primary automated workflows, triggered by a PR to main:

1. CI: `cd red-build && npm test` and `npm run test:determinism`.
2. Layout parity: `.github/workflows/layout-parity.yml`.
3. Full math audit: `.github/workflows/full-math-audit.yml`.
4. Pages/live audit: inspect the relevant gh-pages workflow and its latest applicable run; do not assume a deployment occurred.

Manual or targeted commands (only after confirming required runtime dependencies):

- `cd red-build && npm test`
- `cd red-build && npm run test:determinism`
- `cd red-build && npm run test:canonical`
- `cd red-build && npm run audit:layout`
- `node tools/layout-parity/run-ours.js` with the exact options documented in `tools/layout-parity/README.md`.
- The exact full-math command is taken from `.github/workflows/full-math-audit.yml` and `tools/layout-audit/run-full-math.js` / `run.sh`, not reconstructed by guesswork.

## Run ledger

| Check | Run / URL | Commit | Result | Artifacts |
|---|---|---|---|---|
| CI: Node 18/20/22 | [42765107128](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42765107128) | `4399c47066e274925e9c54afe5c07b4d20bc45ed` | **SUCCESS**; test + determinism steps completed on all three Node versions. Workflow step label: 670 tests / 33 files. | No artifact uploaded by this workflow |
| Layout parity: reference sample | [42765107121](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42765107121) | same | **HARD 4/4 PASS; PARITY 12/14; 88.9%; PARITY_FAIL**. P6 and P7 fail; details below. | Artifact 13739427630: `parity-report.json`, `ours.pdf`, `ours-model.json` |
| Layout parity: very-long corpus | same | same | **C1–C12: 12/12; 100.0%; PASS**. 700 pages, 3,466 paragraphs, 2,571 source headings, 337,622 source words, no missing/extra words, no overlaps/out-of-bounds, no note errors. | Artifact 13738823906: `corpus-report.json`, `ours.html`, `ours-model.json`, `ours.pdf` |
| Full-math browser audit | [42765107091](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42765107091) | same | **SUCCESS; 0 problems**. 704 pages/slots, 43,117 lines, 360,326 words, 686/686 body pages with headers, 236 virtualization sweep steps. | Artifact 13739731084: `local-full-math-audit.json` and determinism reports |
| Determinism (live DOM audit) | same | same | **IDENTICAL**: 704 pages vs 704 pages; diffCount 0. | `local-determinism-result.json` in artifact 13739731084 |
| Canonical Node test in CI | 42765107128 | same | Workflow's complete `npm test` and `test:determinism` steps succeeded on Node 18, 20, and 22. The determinism command printed layoutHash prefix `80f9ed6c82ea3855`, 36 pages. | Job logs |
| GitHub Pages / live deployed audit | Not triggered by this PR | — | **NOT RUN**; deployment audit is event-driven/dispatch. Do not infer live Pages status from local browser audit. | — |

## Detailed parity failures retained as open work

The 54-page reference comparison has 22,425 source and output words (H1 passes exactly), no overlaps, no out-of-bounds text, correct page count/type sequence, correct headers, TOC counts, column boxes and base pitch. However:

- **P6 fails:** reference paragraphs 278; output paragraphs 285; headAligned 199; linesMatch 164; wordsMatch 143. Totals: 3,149 reference lines vs 3,160 output; 21,861 reference words vs 21,650 output. First divergences include different paragraph contents, not merely shifted page positions. This needs separation of tokenization/source mapping versus layout-induced segmentation.
- **P7 fails:** line-by-line ratio **0.8098** (4,080 reference lines; 4,110 output). Initial divergences include lexical/number differences (e.g. `ל למציאות` vs `לא למציאות`, `מג` vs `מד`, `מח` vs `מט`) as well as one line splitting difference. Do not begin with downstream page balancing until the first source/token/measurement divergence is isolated.
- The 700-page long-corpus 12/12 result is a separate invariant suite; it does **not** supersede P6/P7 reference-parity failures.
- The 704-page full-math result verifies the browser layout audit on its test fixture; it does **not** prove reference parity.

## Run metadata and warnings

- PR: [#1](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/pull/1), head `4399c47066e274925e9c54afe5c07b4d20bc45ed`, base `6f801568c15071a27f97918ff8479def9c719c0d`.
- All three workflow runs were triggered by `pull_request` on 2026-11-10 and completed successfully.
- CI logs reported Node.js 20 deprecation warnings for actions currently targeting Node 20; GitHub runner forced those actions onto Node 24. This is a maintenance warning, not a test failure. Track action-version compatibility separately; do not mix it into engine fixes.
- The full-math workflow's live job was **skipped**; only the local job ran.
- The local full-math report observed Guttman Rashi as the rendered body font and reported zero geometry findings. The long-corpus layout report independently reports 12/12 invariants and exact word multiset preservation.

## Acceptance gate for Session 01

Session 01 is complete when:

- A run is tied to an exact commit and the mirror repository. **PASS**
- Workflow trigger behavior is known. **PASS** — pull-request triggers work for CI, layout-parity, and full-math.
- Test output and artifacts are retained. **PASS** — full reports downloaded and inspected; CI logs inspected.
- Passed, failed, skipped and not-run checks are distinguished. **PASS**
- No source code or layout behavior changed. **PASS** — PR #1 changes only this execution record.
- The parity failures P6/P7 are not misrepresented as passing. **PASS**

**Session 01 result: BASELINE ESTABLISHED; engine work may start on a separately scoped branch.** P6 and P7 remain open; no engine code was changed in this session.

If a workflow does not trigger or a command cannot run, record the exact blocker and do not mark the check green.
