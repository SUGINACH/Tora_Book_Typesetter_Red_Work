# Gap analysis — cross-repository imports and RED step-by-step audit

> **Snapshot:** 2026-11-11  
> **Target:** `SUGINACH/Tora_Book_Typesetter_Red_Work` / `work/reference-intent-clarification`  
> **Scope:** import/adoption boundary and the specific missing diagnostic capability from Gold/Orange/Yellow/Green.  
> **Safety:** this document does not change the typesetting engine, active settings, renderer, parser, DP, or Worker.

## 1. Decisions and non-negotiable boundaries

1. RED's current parser, MeasureAPI, DP planner, balancing, notes, decoration, Worker, EventLog, Ledger, report schema and testing UI remain the one active implementation. Archived peer modules are not a parallel diagnostics system.
2. The Gold V21, Green V23, Yellow V22 and Orange profiles remain separately identified source histories. React, Kotlin and Rust are architectural references, not source code to transplant into the RED JavaScript runtime. The V21/V23 source identities are not merged by this archive.
3. Data and documents can be imported without activating them. Every imported file keeps its source commit/path/blob identity. Nothing in `reference-archive/` is loaded by runtime, `npm test`, or GitHub Actions.
4. **P6/P7 are fully suspended under the explicit user instruction dated 2026-11-10.** No computation, execution, display, interpretation, task, or line/word/paragraph matching is permitted. The historic files remain inert only.
5. A future engine change must be justified by a RED requirement and a reproduced RED defect, never by a historical line-break comparison.

## 2. Sources inspected and preserved

The archive index records 78 distinct upstream source files, 9 exact duplicate path copies and one archive-local guide; each upstream source entry is pinned to its source commit/path and Git blob in `reference-archive/cross-repo-2026-11-10/README.md`.

| Source | Relevant material | RED disposition |
|---|---|---|
| Gold V21 | `step-by-step-audit-Method.md`, runner, audit expansion, text-integrity, PDF issue report, trace manager, trigger corpus | Source method and executable originals archived; trigger text archived separately. No Gold runner or audit module is executed in RED. |
| Orange main | Parallel step-audit proposals and method variants | Historical design alternatives archived; runner is not compatible with RED's model/Worker architecture. |
| Yellow V22 | `engine-inputs`, `engine-trace`, `engine-diagnostics`, tests | Contract and test originals archived. They expect Yellow global DOM/renderer state; not RED tests. |
| Green V23 | Screenshot-to-PDF helper, audit smoke fixtures, geometry audit CLI | Helper and three fixtures archived. The CLI is not copied; the PDF helper needs a RED-specific manifest adapter before any use. |
| React main | SRS, ADR 001–011, migration/source/settings inventory, 11 raw line-battery fixtures | Documents and raw input samples archived. No React/Tauri engine code is imported. The line-battery files are inputs, not expected output or parity targets. |
| Kotlin main | Technical specification | Reference document archived. No Compose/Kotlin runtime is imported. |
| Rust main | Fixed-point, shaping/BiDi, PDF, compatibility and provenance documents | Reference documents archived. No Rust engine or package is imported. |
| Typesetter_doc main | Stability plan, issue-resolution protocol, determinism/Knuth–Plass/RTL research, V23 maps/catalogs, repository matrix | Curated documents archived as read-only reference. Historical status/metrics in them are not current RED evidence. |
| IMUD main | Makom Bina v20.5 default and three named setting sets | Four JSON files imported into the isolated runtime preset path; the existing picker already exposes preview and explicit apply. The old layout harness remains archive-only. |

## 3. What is already implemented in RED — and what is not

### 3.1 Existing diagnostics path

**EventLog — `red-build/src/engine/core/events.js`**

- One active event log with an explicit stage order: parse, scope-map, style-prepass, fonts-ready, measure, line-plan, page-plan, protections, balance, justify, notes-budget, refit, decorations, headers, folio, toc, ledger-finalize, render.
- Each event contains logical sequence number, stage, label, optional page index, logical monotonic timestamp and payload.
- `droppedEvents` counts events emitted under an unknown stage. The log does not currently store a full snapshot of every page element or an element-level diff.

**Ledger — `red-build/src/engine/core/ledger.js`**

- Ten lifecycle states already exist: `created`, `correction-blocked`, `correction-reverted`, `became-observable-later`, `competing-repair-side-effect`, `persists`, `resolved`, `reintroduced`, `not-comparable`, `unresolved`.
- An issue record already includes `issue_id`, kind, target, page, `first_seen_stage`, transitions, `predicate_before`, `predicate_after`, candidates, capacity before/after, route, selected candidate and rollback reason.
- Candidate acceptance/rejection can be recorded. This is a strong basis for causal evidence, not proof that every issue is currently wired to every state.

**Report schema — `red-build/src/audit/report-schema.js`**

- Diagnostics v2 exposes finding ID/type/target/page/status, before/after predicates, capacity before/after and transitions (unless compact mode).
- It exposes `dropped_events`, deterministic/layout/content hashes and geometry-neutral verification.
- It does not yet attach a checkpoint window of page snapshots, sibling-element changes, or a completeness flag for page-element diffs.

**Pipeline — `red-build/src/engine/core/pipeline.js`**

- A model-first CP1–CP5 pipeline exists. CP1 parses and builds structural scope; CP2 loads fonts and measures/line-plans; CP3 plans pages and applies protection/balance/AQ/notes; CP4 applies decorations, headers, folio and TOC; CP5 prepares rendering.
- Events are emitted at selected milestones such as parse, scope mapping, measure, page-plan insertion, TOC insertion, decorations, folio, ledger finalization and render readiness.
- These are coarse decision events, not a persistent full-page snapshot at every boundary.

**Testing UI — `red-build/src/ui/testing-tab.js`**

- Findings table, lifecycle status labels, stage-filtered trace table, coverage and page-level summaries already exist.
- The current trace view lists events by stage. It does not yet show an issue-centred before/after window with every other element added, removed, moved, resized or restyled on the affected page.

### 3.2 Precise remaining step-audit gap

The missing capability is **not another generic trace logger**. It is a deterministic, issue-centred page-state history that joins the existing EventLog and Ledger:

1. A stable snapshot of every relevant element on each relevant page at named checkpoints.
2. Semantic element identity sufficient to follow a paragraph/fragment, heading, footnote, side note, marker, ornament, divider, header/footer, column and body/container across checkpoints.
3. Added/removed/changed deltas between consecutive checkpoints, including unrelated sibling elements on the same page.
4. For every issue: first comparable checkpoint, target element state, lifecycle state, all same-page sibling deltas from first appearance until the operation that created the issue, failed to apply a correction, or reverted a correction.
5. A causality verdict backed by before/after predicates and Ledger evidence, or an explicit `candidate-stage` / `unresolved` result when proof is insufficient.
6. A completeness signal for event truncation, missing elements, ambiguous identities and capped snapshots. Missing evidence must never be reported as “no change”.

### 3.3 Required causal states and proof standard

| Classification | Minimum evidence required |
|---|---|
| `created-by-stage` | Same issue predicate is false immediately before and true immediately after the operation, for a comparable target. |
| `correction-blocked` | A correction was actually attempted; the relevant geometry/predicate did not change; candidate rejection, skip reason or capacity explains why it did not apply. |
| `correction-reverted` | A prior correction demonstrably improved/resolved the predicate; a later operation demonstrably restored/worsened it. |
| `became-observable-later` | The earlier checkpoint lacked a necessary measurement/element; absence is not misclassified as a clean state. |
| `competing-repair-side-effect` | A different element changed on the same page, and a measured dependency shows that this change consumed/released capacity or altered the target's layout. |
| `persists / resolved / reintroduced` | Comparable target and predicate are evaluated at successive checkpoints. |
| `not-comparable / unresolved` | Identity, predicate, checkpoint or trace coverage is insufficient. State why; do not infer causality. |

A later timestamp or the first checkpoint where an issue is noticed is not sufficient to say that the preceding stage created it. Likewise, “no geometry delta” alone is not proof that a correction was blocked.

## 4. RED-specific integration design — one trace, no duplicate engine

### 4.1 Data model to add only after the contract is approved

A future extension should be an opt-in `stepAudit` section in the existing diagnostics result, not a new global tracing framework.

Suggested top-level fields:

- `schema: "step-audit-v1"`
- `enabled`, `traceComplete`, `droppedEvents`, `droppedElements`
- `checkpoints[]`: logical sequence, named CP/stage, affected page references, compact page signatures
- `pages[pageIdentity]`: page type/label, body/column/note-area metrics, relevant element inventory
- `elements[]`: stable identity, semantic role, token/source identity where available, page/container membership, model geometry and decision attributes
- `deltas[]`: added, removed, moved, resized, structurally changed and style-only changed elements
- `issueWindows[]`: issue ID, first comparable appearance, last-good/first-bad checkpoint, attempted correction, rollback/reintroduction evidence, sibling deltas and confidence/limitations

The final field names must follow RED's actual model schema; the list above is a proposed contract, not a claim that these fields already exist.

### 4.2 Identity and geometry rules

- Prefer an existing immutable token/source ID plus a fragment/block role. Page number alone and text preview alone are not stable identities.
- If a fragment is split/merged, record parent/child lineage explicitly. If there is no reliable match, emit `not-comparable`, not a guessed match.
- Capture the model geometry the engine already computed. Do not add a DOM measurement, font measurement, re-typeset or geometry mutation for the sake of tracing.
- Keep text previews bounded and redact/omit full text where the token/source identity is enough. Preserve source order and Hebrew/Unicode data exactly.
- Keep style-only changes separate from geometry changes so a visual decoration does not masquerade as a pagination/space change.

### 4.3 Checkpoint and performance strategy

Use named checkpoints around existing pipeline boundaries first: after source/structure preparation, after line planning, after initial page planning, after balance/notes/refit, after decorations/TOC/folio, and final model/render readiness. Do not insert expensive deep snapshots after every function in the default path.

- At each checkpoint, compute a lightweight deterministic signature for all pages.
- Retain a full element inventory only for pages with a finding or a page implicated by a correction/rollback. Keep sibling elements in that same page inventory.
- When a page first becomes relevant, retain its next deltas through the triggering operation or last relevant event.
- Make deeper per-function checkpoints an explicit diagnostic escalation for selected pages/chapters only.
- Set deterministic event/element caps. If a cap is reached, mark the trace incomplete and state exactly what was dropped.
- The default non-diagnostic path must do no additional snapshotting and preserve output hashes.

This structure satisfies the user's need to see both the target status and all other elements entering/leaving/changing on the affected page, without running a heavyweight DOM audit after every layout operation during every ordinary render.

## 5. Other imported components: adoption status

| Component | Current status | Safe next step | Not permitted yet |
|---|---|---|---|
| Makom Bina v20.5 data | Four 249-key JSON files exist at `red-build/ui/assets/imud/presets/makom-bina-v20.5/`; default JSON equals the existing fixture; three sets differ from the regular sets. The isolated preset registry and preview/apply picker already exist. | Data import and integration test are verified; the decoded-path assertion was corrected in `31e7b4c`; all four workflows passed on HEAD `13c1423`. | Do not silently make it default, overwrite regular sets, or route it through the default loader without a distinct source path |
| Gold trigger corpus | Ten original text files are archived separately under `red-build/tests/fixtures/legacy-trigger-corpus/gold-v21/` | Review each candidate for current D-100 structure and convert only useful cases into new RED-native fixtures under a different path | Do not run legacy files unchanged or add them to CI |
| React line-battery | Eleven short raw inputs are in the source archive, not in the active corpus | Select cases as semantic input tests (Unicode/BiDi, note-brackets, empty lines, hyphens, long word, niqqud, parentheses, whitespace) only where RED coverage is absent | Do not treat line outputs, line counts or historical line choices as expected values |
| Green screenshot-to-PDF helper | Original script and fixtures are archived | Define a RED screenshot manifest and write a separate adapter that accepts only that schema; validate paths and remove hard-coded exclusions | Do not run the old helper directly against RED or make it a CI dependency |
| Gold issue-PDF generator | Original archived | Reuse its report-layout ideas only after mapping RED diagnostics-v2 to a documented manifest | Do not pass old issue-report objects directly |
| Yellow engine inputs/trace/diagnostics | Source modules and tests archived | Compare required fields with RED's EventLog/Ledger/report schema; move only a missing field into the single RED model | Do not load Yellow globals or instantiate a second trace manager |
| Gold/Orange step-by-step audit | Original methods and runners archived; the RED-specific gap is documented above | Implement against RED's own page model only after contract approval | Do not bring over iframe/DOM wrappers, global monkey-patching, `eval`, or old skip/stop engine controls |
| React/Kotlin/Rust code | Not imported | Use archived SRS/ADRs as review material for a specific RED requirement | Do not add foreign engine packages or parallel runtime paths |

## 6. Work sequencing and test budget

The current safe imports (JSON/text/documents) were completed without modifying the active engine. For future changes:

1. **No-code mapping first:** the source inventory is now documented; keep the 78 unique source files and their archive copies immutable.
2. **Preset UI adapter:** complete and CI-verified; the pre-existing isolated registry/picker consumes the imported files. No layout-engine change was needed.
3. **Input fixtures:** promote only D-100-valid RED-native derivatives and add focused semantic tests; no full-corpus run for every fixture edit.
4. **Screenshot report adapter:** first validate its standalone manifest reader/writer on synthetic screenshots; keep it out of the runtime and default CI until proven useful.
5. **Step-audit pure model:** implement a deterministic snapshot/delta reducer over already-serialized page models, with unit tests only; no pipeline instrumentation yet.
6. **Opt-in instrumentation:** only after the pure reducer and no-op proof work; one focused deterministic fixture, then one full-corpus gate for the completed instrumentation change.
7. **UI and long-term automation:** only after schema stability; render issue-centred windows in the existing Testing tab, and only then consider a manually triggered/periodic diagnostic workflow.

The user requested prioritizing safe work and avoiding repeated slow tests. Accordingly, the plan avoids running the full corpus for every small documentation/data change. The full stress run belongs at the integration gate where the output or runtime path is actually affected.

## 7. P6/P7 freeze

P6/P7 have no active meaning in this project stage. No test, calculation, score, report, task or matching against historical paragraph/word/line sequences may be created or run. The old data and scripts remain archived only. This restriction supersedes any older work-log, issue-register, decision or planning text.


## 8. Yellow V22 contract review — 11.11.2026

The field-by-field comparison is recorded in `spec/YELLOW_DIAGNOSTICS_CONTRACT_GAP.md`. The conclusions relevant to the step audit are:

- RED's per-run effective settings are copied at entry to `typeset`; settings are not read from live DOM controls. Yellow's frozen-control snapshot and `derivedChanged` mechanism are therefore not to be ported.
- RED has a static settings registry contract (control/key/consumer/effect-test), but does not produce a canonical per-run `settingsHash` or actual-used-settings hash. This is a potential Run Input Manifest addition, not a need to instrument all DOM reads.
- RED registers font bytes through `MeasureAPI` and the Worker protocol and records measurement cache/fallback counters. It does not yet attach a complete per-run font readiness/fingerprint report to the exact typeset job.
- EventLog/Ledger/diagnostics-v2/Testing Tab cover the basic diagnostics path. They do not yet tie each finding to a first-bad operation and a complete same-page sibling delta window.
- `trace-verbosity=off` currently returns an event list without an explicit recording/completeness marker. The next safe runtime change, if approved by its tests, is additive trace metadata; an empty event list must never look like a completed zero-event audit.
- The next implementation sequence is: trace-v2 recording metadata → pure Run Input Manifest → pure StepAudit reducer → operation/issue linkage → opt-in model checkpoints → issue-centered Testing Tab. No global wrappers or DOM geometry snapshots.


## 9. RED step-by-step audit method

נכתב מסמך שיטה מלא ונפרד: `spec/step-by-step-audit-Method.md`. הוא מגדיר את חלון הממצא, מלאי כל האלמנטים בעמוד, page/element identity ו-lineage, delta, רף הוכחת סיבתיות, סטטוסי Ledger, completeness, אפשרויות כיוונון, תקציב ביצועים וקריטריוני קבלה.

המסמך הוא מפרט ליישום, לא הצהרה שהמנגנון כבר פעיל. סדר העבודה נשאר: reducer טהור → קישור operation/issue → instrumentation opt-in → Testing Tab. אין DOM snapshots או global wrappers.


## 9. מימוש reducer — עדכון 11.11.2026 (מחליף את סעיפי התכנון הקודמים בנושא)

השלב של reducer טהור הושלם כ-prototype מבודד:
- step-audit-reducer.js מחשב delta של אלמנטים ועמודים, כולל שינוי טקסט, מעבר עמוד, ופיצול/מיזוג עם lineage מפורש.
- בדיקות יחידה חיוביות ושליליות נוספו ונכללו בפקודות הבדיקה.
- ביקורת סיבתיות הידקה את הדרישה ל-active→absent→active עבור correction-reverted, ול-sibling delta + capacity change עבור competing-repair-side-effect.
- עדיין אין adapter מה-page model האמיתי, ואין checkpoints במנוע. ה-Ledger הנוכחי מספק page מספרי ו-target טקסטואלי; יש למפות אותם בזהירות ולא להציגם כמזהי page/element יציבים.
- ה-reducer אינו משנה את ה-layout, אינו נקרא מה-pipeline ואינו רץ על טקסטי הארכיון.


## 10. Implementation status — 12.11.2026 (supersedes earlier planned sequence)

- Pure reducer implemented: red-build/src/engine/audit/step-audit-reducer.js.
- RED model adapter implemented and unit-tested: red-build/src/engine/audit/step-audit-model-adapter.js.
- Adapter maps live page objects, columns, line seqs, footnote/endnote fragments, side notes, decorations, dividers, TOC/custom/shaar elements, header/folio projection and Ledger records. Missing source identity or geometry is surfaced as incomplete; it is not guessed.
- Parenthesis mapping now has a focused runtime path: DP line indexes, per-word source refs, source refs carried through drop-word repair, semantic paren range elements and a post-map-only parenConsistency check.
- The Ledger record stores target pN@tN; CHECKS violation objects expose paren@pN@tN. The adapter consumes the Ledger record target, and unit/E2E tests cover that exact contract.
- The generic all-stage checkpoint producer, operationId linkage across every mutation, reducer integration for a full real run, Testing Tab UI and full audit stress test remain open.
- The current changes do not change line breaking, page balancing, measurement or renderer geometry. The added source-word identity is omitted from layout/body geometry hashes.

The next safe step is a pure checkpoint producer over serialized RED page-model fixtures, then opt-in checkpoint capture with a no-op hash proof. Do not start a UI implementation before capture completeness and operation/issue linkage are proven.

## 11. Ornament source identity — 12.11.2026

H2/H3 ornaments, shaar dividers and chapter-end ornaments now carry tokenId/sourceKey provenance at creation in ornament-plan.js. The model adapter uses these keys before object identity and remains conservative when no semantic key exists. A unit regression covers recreated decoration objects and verifies a stable moved/resized delta. These are metadata-only additions; layout/body hashes exclude decoration metadata.


## 12. Final validation snapshot — 12.11.2026

HEAD 0f261eabc468f7515c83e01d36f1462ae400ae20 passed:
- CI (all three test shards + layout-audit)
- Layout invariants + very-long corpus
- Worker bundle rebuild + D-65 deterministic hash
- Full Math Audit local run (largest valid corpus; live job skipped by workflow configuration)

The final sourceKey ornament identity regression is included: model-adapter 21/21, reducer 13/13, pipeline E2E 16/16, S8 decoration 48/48. The generic all-stage checkpoint producer, full mutation operation linkage, reducer over a real complete run, and Testing Tab UI are still open.
