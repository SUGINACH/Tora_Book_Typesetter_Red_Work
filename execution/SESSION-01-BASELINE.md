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
- The exact full-math command is taken from `tools/layout-audit/README`/workflow, not reconstructed by guesswork.

## Run ledger

| Check | Run / URL | Commit | Result | Artifacts |
|---|---|---|---|---|
| CI | Pending | Pending | Pending | Pending |
| Layout parity | Pending | Pending | Pending | Pending |
| Full math audit | Pending | Pending | Pending | Pending |
| Determinism | Pending | Pending | Pending | Pending |
| Canonical corpus | Pending | Pending | Pending | Pending |
| Long corpus / live audit | Pending | Pending | Pending | Pending |

## Acceptance gate for Session 01

Session 01 is complete only when:

- A run is tied to an exact commit and the mirror repository.
- The workflow trigger behavior is known.
- Test output and failure artifacts are retained.
- The baseline distinguishes passed, failed, skipped, and not-run checks.
- No source code or layout behavior has changed.

If a workflow does not trigger or a command cannot run, record the exact blocker and do not mark the check green.
