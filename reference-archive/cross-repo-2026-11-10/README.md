# Cross-repository engineering references — ARCHIVE ONLY

> **Status:** inert source archive, imported 2026-11-10. Nothing in this tree is loaded by RED, registered as a test, called by a workflow, or copied into runtime paths.

## Why these files are preserved

| Source | Contents | Use in RED Work |
|---|---|---|
| Gold V21 | Step-by-step geometry-audit method, audit expansion/text-integrity plans and implementations, old issue-PDF generator, trace manager | Reference for future gap analysis against RED's EventLog, Ledger, report schema and testing tab. Do not run old scripts. |
| Orange main | Parallel step-audit method and runner; method variants | Historical design variants. Runner depends on old browser globals; not a RED adapter. |
| Yellow V22 | Engine input snapshot, trace wrappers, diagnostics report builder and their unit tests | Contract/reference only. These modules and tests expect Yellow's global DOM/renderer; they are not RED tests. |
| Green V23 | Screenshot-to-PDF report utility and small geometry-audit text fixtures | Reference for a future RED screenshot-manifest adapter. The utility expects an older report format and has old page-exclusion assumptions; not executable as a RED tool without adaptation. |

## Hard execution boundary

- Do not import these modules from `red-build/src/**`.
- Do not add archived tests to `npm test` or GitHub Actions.
- Do not execute archived runners, old geometry-audit tools, or the screenshot report generator against RED.
- Any future port must be a **new file outside this archive**, with an explicit RED contract and targeted tests. Keep these originals unchanged.
- The existing RED EventLog/Ledger/trace is the single active diagnostics path. This archive is not a second implementation.

## Imported files and source blob identities

The files below were copied without transformation. Each destination Git blob was verified to equal the listed source Git blob.

| Archived path | Source ref | Original path | Source Git blob |
|---|---|---|---|
| `gold-v21/step-by-step-audit-Method.md` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `step-by-step-audit-Method.md` | `e19a2431461bf72180cc5f5a29ec385d20c0a40f` |
| `gold-v21/AUDIT_EXPANSION_PLAN.md` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `AUDIT_EXPANSION_PLAN.md` | `9210ec31b54c4bfe0f8176cd3f26ad658a726f22` |
| `gold-v21/REPO_AUDIT_AND_TESTING.md` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `REPO_AUDIT_AND_TESTING.md` | `4a366024078089ac7a007a7ef787c3ec76811215` |
| `gold-v21/scripts/step-by-step-audit.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `scripts/step-by-step-audit.js` | `0bb09897b22901ed6aea55a904dbfcadf7c23a5a` |
| `gold-v21/audit-expansion.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `audit-expansion.js` | `b4e6b01ad3d104eebfd2c9c1e15daf4ddf04e703` |
| `gold-v21/audit-text-integrity.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `audit-text-integrity.js` | `a99800685817510f7dffb4b303a8644186272849` |
| `gold-v21/scripts/generate-issues-pdf.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `scripts/generate-issues-pdf.js` | `26fb2989d0e97b658b0dc943470a2d513aba0674` |
| `gold-v21/trace-manager.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `trace-manager.js` | `9c0ec3bbf13f6c7f3fea4016d136d3d0ae429246` |
| `orange-main/parallel-step-by-step-audit-method-21.md` | `SUGINACH/Tora_Book_Typesetter_Orange@main` | `parallel-step-by-step-audit-method-21.md` | `75efcc6edaae3f8ddd2e451a71e60c3e226794df` |
| `orange-main/parallel-step-by-step-audit-21.js` | `SUGINACH/Tora_Book_Typesetter_Orange@main` | `parallel-step-by-step-audit-21.js` | `8d75fdb4fd2a47133f82629cecdbd4b881415b7c` |
| `orange-main/step-by-step-audit-Method.md` | `SUGINACH/Tora_Book_Typesetter_Orange@main` | `step-by-step-audit-Method.md` | `ed9681945cc25fd0bf9177b985350efb878eedcd` |
| `yellow-v22/engine-inputs.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `engine-inputs.js` | `0c75b7c389c88ef612c8102ee8333ac483ea2c07` |
| `yellow-v22/engine-trace.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `engine-trace.js` | `ee03c0f2e50949c545d04b28afca40ce37415b5a` |
| `yellow-v22/engine-diagnostics.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `engine-diagnostics.js` | `6a7feb01609e7063720638aaaac3312f99bca1c8` |
| `yellow-v22/tests/engine-inputs.test.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `tests/engine-inputs.test.js` | `2d680907e70ffcedc9f37bdf3a6cd2ff90eabaac` |
| `yellow-v22/tests/engine-trace.test.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `tests/engine-trace.test.js` | `f8aac7207190011f0c9550f5375801d46aab2366` |
| `green-v23/tools/build_layout_issue_screenshot_report.py` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `tools/build_layout_issue_screenshot_report.py` | `e2fe37d0009faba0f43ec798d1165faaa4c237f9` |
| `green-v23/tests/fixtures/geometry-audit-smoke.txt` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `tests/fixtures/geometry-audit-smoke.txt` | `ab5e1807b162b6157fddcd1294adeefda8f1f28e` |
| `green-v23/tests/fixtures/geometry-audit-diagnostics-smoke.txt` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `tests/fixtures/geometry-audit-diagnostics-smoke.txt` | `1524e5e32e913db5a4f74ab9bdfa93372c3df169` |
| `green-v23/tests/fixtures/section-end-gap-audit.txt` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `tests/fixtures/section-end-gap-audit.txt` | `5c53f8100ba9b55d8c0b51b39cc3797333c35f7d` |

**Total: 20 files.** This is preservation only, not adoption.
