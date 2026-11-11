# Cross-repository engineering references — ARCHIVE ONLY

> **Snapshot date:** 2026-11-10. **Status:** inert, byte-preserved source archive. These files are not imported into RED runtime, are not registered as RED tests and are not called from GitHub Actions.

## Source pins

| Repository / ref | Locked commit | Disposition |
|---|---|---|
| `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad30fd5ed0d6fd3873adbe9c23cb7e0` | V21 code, audit method and fixtures retained as a separate historical profile |
| `SUGINACH/Tora_Book_Typesetter_Green@V23` | `69aac0b87e7b1262d0220e2c1eaf505bb319990a` | V23 audit utility and fixtures retained; not coupled to the RED renderer |
| `SUGINACH/Tora_Book_Typesetter_Orange@main` | `d9f08b9ba1cba0b17c94c46019bd423fbbb0b5d2` | Historical design and step-audit variants |
| `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `64f64a5b0ded3f0007a170caca463efd6cdd5e12` | Input/trace/diagnostic contract and tests retained as source reference |
| `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e5395563e90a539a51c1f8856df393ab1b` | SRS, ADRs 001–011, migration inventory, settings matrix and 11 raw input fixtures |
| `SUGINACH/Tora_Book_Typesetter_Kotlin@main` | `8dc5b081d7d5c2059419c90e8a5cbca9c7e5e17c` | Technical specification only; Compose/Kotlin runtime not imported |
| `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb466231a1d4a83941c350d36db232` | ADRs, compatibility and provenance contracts only; Rust engine not imported |
| `SUGINACH/Typesetter_doc@main` | `ad71c63f87a940ac92140ea1d7a1f4de7eb8f8f9` | Curated planning, research, issue catalog and cross-repository comparison documents |

| `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | Makom Bina v20.5 runtime data and historical layout scenario suite archived separately |

## Content groups

- **Gold / Orange / Yellow / Green:** historical diagnostics and step-audit source, method documents, tests, fixtures and screenshot-report helper.
- **React:** software requirements and architecture decisions, migration/source/settings inventories, and 11 raw input fixtures. These inputs are not expected line-break outputs and must not be used as a P6/P7-style parity target.
- **Kotlin / Rust:** design and compatibility documents only; no executable engine or dependency graph is brought into RED.
- **Typesetter_doc:** curated engineering protocol, deterministic-engine and Knuth–Plass research, RTL/two-column design, V23 dependency/history maps, issue coverage and all-repositories matrix. V21 and V23 references remain distinct; the archive does not authorize merging branches or profiles.
- **IMUD main:** the historic browser-based layout scenario suite is preserved under `imud-main/layout-scenarios/`. Its committed baseline has 38 named scenarios; the old README says 21 and is stale for this pinned snapshot. Its old Playwright/DOM runner is archive-only.

## Execution boundary

1. Do not import archived modules from `red-build/src/**`.
2. Do not add archived tests or fixtures to `npm test`, corpus manifests or GitHub Actions.
3. Do not execute old renderers, old geometry-audit tools, Yellow wrappers, Gold/Orange runners, or the Green screenshot utility against RED.
4. A future port must be a new file outside this directory, using a documented RED-specific contract and targeted tests. Preserve source copies unchanged.
5. RED's existing parser, MeasureAPI, DP, balancing, notes, Worker, EventLog, Ledger, report schema and testing UI remain the only active implementation. This archive is not a second engine or diagnostics pipeline.
6. No P6/P7 calculation, report or line/word/paragraph matching is permitted. Their historical code/data remains inert.

## File-level provenance and blob identity

Each destination blob was compared with its source Git blob during import. The 67 source files below retain their exact content; the Git SHA-1 shown is the original blob identity.

| Archived path | Source ref | Locked source commit | Original source path | Git blob |
|---|---|---|---|---|
| `gold-v21/AUDIT_EXPANSION_PLAN.md` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `work_doc/AUDIT_EXPANSION_PLAN.md` | `9210ec31b54c4bfe0f8176cd3f26ad658a726f22` |
| `gold-v21/REPO_AUDIT_AND_TESTING.md` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `work_doc/REPO_AUDIT_AND_TESTING.md` | `4a366024078089ac7a007a7ef787c3ec76811215` |
| `gold-v21/audit-expansion.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `audit-expansion.js` | `b4e6b01ad3d104eebfd2c9c1e15daf4ddf04e703` |
| `gold-v21/audit-text-integrity.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `audit-text-integrity.js` | `a99800685817510f7dffb4b303a8644186272849` |
| `gold-v21/scripts/generate-issues-pdf.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `scripts/generate-issues-pdf.js` | `26fb2989d0e97b658b0dc943470a2d513aba0674` |
| `gold-v21/scripts/step-by-step-audit.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `scripts/step-by-step-audit.js` | `0bb09897b22901ed6aea55a904dbfcadf7c23a5a` |
| `gold-v21/step-by-step-audit-Method.md` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `work_doc/step-by-step-audit-Method.md` | `e19a2431461bf72180cc5f5a29ec385d20c0a40f` |
| `gold-v21/trace-manager.js` | `SUGINACH/Tora_Book_Typesetter_Gold@V21` | `a444d34ccad3…` | `trace-manager.js` | `9c0ec3bbf13f6c7f3fea4016d136d3d0ae429246` |
| `green-v23/tests/fixtures/geometry-audit-diagnostics-smoke.txt` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `69aac0b87e7b…` | `tests/fixtures/geometry-audit-diagnostics-smoke.txt` | `1524e5e32e913db5a4f74ab9bdfa93372c3df169` |
| `green-v23/tests/fixtures/geometry-audit-smoke.txt` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `69aac0b87e7b…` | `tests/fixtures/geometry-audit-smoke.txt` | `ab5e1807b162b6157fddcd1294adeefda8f1f28e` |
| `green-v23/tests/fixtures/section-end-gap-audit.txt` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `69aac0b87e7b…` | `tests/fixtures/section-end-gap-audit.txt` | `5c53f8100ba9b55d8c0b51b39cc3797333c35f7d` |
| `green-v23/tools/build_layout_issue_screenshot_report.py` | `SUGINACH/Tora_Book_Typesetter_Green@V23` | `69aac0b87e7b…` | `tools/build_layout_issue_screenshot_report.py` | `e2fe37d0009faba0f43ec798d1165faaa4c237f9` |
| `kotlin-main/Kotlin_Technical_Specification.md` | `SUGINACH/Tora_Book_Typesetter_Kotlin@main` | `8dc5b081d7d5…` | `Kotlin_Technical_Specification.md` | `1b443a8c32611b7aa1c038d823c1f7b89715c0b2` |
| `orange-main/parallel-step-by-step-audit-21.js` | `SUGINACH/Tora_Book_Typesetter_Orange@main` | `d9f08b9ba1cb…` | `parallel-step-by-step-audit-21.js` | `8d75fdb4fd2a47133f82629cecdbd4b881415b7c` |
| `orange-main/parallel-step-by-step-audit-method-21.md` | `SUGINACH/Tora_Book_Typesetter_Orange@main` | `d9f08b9ba1cb…` | `parallel-step-by-step-audit-method-21.md` | `75efcc6edaae3f8ddd2e451a71e60c3e226794df` |
| `orange-main/step-by-step-audit-Method.md` | `SUGINACH/Tora_Book_Typesetter_Orange@main` | `d9f08b9ba1cb…` | `step-by-step-audit-Method.md` | `ed9681945cc25fd0bf9177b985350efb878eedcd` |
| `react-main/Software_Requirements_Specification.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/Software_Requirements_Specification.md` | `e7a0f2c00cbff47fe5b0c6c0464c9bb6b161dac4` |
| `react-main/adr/ADR-001-units.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-001-units.md` | `dffd641b2793e772b9fb45cc67fbf0a335c30574` |
| `react-main/adr/ADR-002-canonical-hash.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-002-canonical-hash.md` | `aee032430966362d23f1679dd0e386840848539d` |
| `react-main/adr/ADR-003-harfbuzz-wasm.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-003-harfbuzz-wasm.md` | `bca5b9781b59f9fa143d6910d5d132dfbb5c1cf0` |
| `react-main/adr/ADR-004-linebreak-quality.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-004-linebreak-quality.md` | `3e6608303dfec27cfdba94a3c52827316e9f4e73` |
| `react-main/adr/ADR-005-long-note-split.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-005-long-note-split.md` | `a001d889e973518fe5cb8037556eaaf80bcea7af` |
| `react-main/adr/ADR-006-h3-behavior.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-006-h3-behavior.md` | `d40d7a234d8505afc19f365cfdb55f82114ba1ed` |
| `react-main/adr/ADR-007-unicode-fidelity.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-007-unicode-fidelity.md` | `8dda5e88371ed7dae4c80caa5651b12df3a616d3` |
| `react-main/adr/ADR-008-html-line-representation.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-008-html-line-representation.md` | `b9f6ccedd43158f68f19e51c028f346a053a02c9` |
| `react-main/adr/ADR-009-export-pdf-glyphs.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-009-export-pdf-glyphs.md` | `cffa39ef965a0f5ef5364dfd98a43d0c8c89395d` |
| `react-main/adr/ADR-010-page-search-budgets.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-010-page-search-budgets.md` | `fd8d60aabe8bfb656c3f98d5fd5601cd7ae9df99` |
| `react-main/adr/ADR-011-outer-fixed-point.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/adr/ADR-011-outer-fixed-point.md` | `017e30292a4d2d9b3318d4e8d2c530cf0e93c654` |
| `react-main/line-battery/bidi_mixed.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/bidi_mixed.txt` | `8868079a718427d5cf698e4fe45d39e6165108cf` |
| `react-main/line-battery/brackets_note.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/brackets_note.txt` | `257542530e145dc2bee1edc338cd3e3aaaa66436` |
| `react-main/line-battery/empty_line.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/empty_line.txt` | `26df4376555e1cef6584a3f0430e6bde10f74446` |
| `react-main/line-battery/first_last_line.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/first_last_line.txt` | `bcbfd44487f8f02fb4114489e78bde911996cfac` |
| `react-main/line-battery/hyphens.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/hyphens.txt` | `e1b73b2798528eeb90263bcda230ec96ee92b81c` |
| `react-main/line-battery/long_paragraph.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/long_paragraph.txt` | `cf0bfef9ca8f541957f24a3d591b31956a3c4ab4` |
| `react-main/line-battery/long_word.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/long_word.txt` | `d2ae10ab0b3202d65b16b03d57022e63269abc35` |
| `react-main/line-battery/niqqud.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/niqqud.txt` | `8c57f0ccf8ca98fe47cf3bd0207482d1e019a030` |
| `react-main/line-battery/parens.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/parens.txt` | `2e3a109bcd41b5871d7a1275c97d93c9ae10a442` |
| `react-main/line-battery/single_word.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/single_word.txt` | `4e5a14d55a6c94c77df33822926befde0a805add` |
| `react-main/line-battery/whitespace_runs.txt` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `packages/layout-engine/test/fixtures/line-battery/whitespace_runs.txt` | `2c543edd42ea5412bf15e7cdf1a4ea9032601fec` |
| `react-main/migration/compatibility-report.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/migration/compatibility-report.md` | `1fd81e8ccf1eb7b693e17aee4cc438e18bc08466` |
| `react-main/migration/settings-matrix.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/migration/settings-matrix.md` | `5f9dbde52e50e347a523bcbc19789b75df8bae5b` |
| `react-main/migration/source-manifest.json` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/migration/source-manifest.json` | `ddd40da290454ad29fbca346ba231e6448b027d3` |
| `react-main/migration/transfer-inventory.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e53955…` | `docs/migration/transfer-inventory.md` | `a952d8115c3f9732920f727cf0d65786d598198e` |
| `rust-main/adr/0001-legacy-profile-isolation.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/adr/0001-legacy-profile-isolation.md` | `317a1f69b02deda17216d03ea74c320cb0b8f3e8` |
| `rust-main/adr/0002-fixed-point-representation.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/adr/0002-fixed-point-representation.md` | `4d3f70b94f2da12fcbaac82918fc15a4c2cf4d15` |
| `rust-main/adr/0003-hebrew-shaping-and-bidi.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/adr/0003-hebrew-shaping-and-bidi.md` | `d50e70ee377119f996a1caad47df1c0bd9d865ac` |
| `rust-main/adr/0004-pdf-type0-tounicode.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/adr/0004-pdf-type0-tounicode.md` | `19e757ee25135745afeb517d1e5064e5d498242c` |
| `rust-main/compat/manifest-schema.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/compat/manifest-schema.md` | `5e6be8dccae56df7666d9b797da33633827771a4` |
| `rust-main/compat/ownership-rules.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/compat/ownership-rules.md` | `485e44e290729b61683f9367b20803f4a77a1bf2` |
| `rust-main/provenance/archive-source-recovery-2026-11-02.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/provenance/archive-source-recovery-2026-11-02.md` | `95fb90c5f6371a460dd35b0002d10e739cc01b67` |
| `rust-main/provenance/source-of-truth-matrix.md` | `SUGINACH/Tora_Book_Typesetter_Rust@main` | `00fe36350dbb…` | `docs/provenance/source-of-truth-matrix.md` | `1c9b64ae0ee4eaf164963b636a5315fc6aca0e52` |
| `typesetter-doc-main/comparisons/Monster_Comparison_All_Repos_Branches.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/comparisons/Monster_Comparison_All_Repos_Branches.md` | `b7b11f06626d18f775a4998063c97721962a9704` |
| `typesetter-doc-main/plans/Issue_resolution_protocol.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/plans/Issue_resolution_protocol.md` | `5a2643924d4873594b66f9b2af2bc4aca35c3071` |
| `typesetter-doc-main/plans/Plan_stability_completeness_transparency.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/plans/Plan_stability_completeness_transparency.md` | `4d9188e254fad87a5549949774af501a5ec69850` |
| `typesetter-doc-main/plans/Working_rules.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/plans/Working_rules.md` | `3b4fe2cab862ddeb04a8b96da7eedae68f884902` |
| `typesetter-doc-main/research/Deterministic_typesetting_engine.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/research/Deterministic_typesetting_engine.md` | `8eb7bbaf2c694c95339a3be97fd4375643717875` |
| `typesetter-doc-main/research/Dual_column_RTL_design.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/research/Dual_column_RTL_design.md` | `e723a9d82a37e2520e8e8f73e49dc65eb54e7179` |
| `typesetter-doc-main/research/Knuth-Plass_deep_dive.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `shared/research/Knuth-Plass_deep_dive.md` | `c3cadef1e4840e792c2c9db07eb3f85d90409169` |
| `typesetter-doc-main/v23/Issue_coverage_matrix.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `chatgpt_v23/issues/Issue_coverage_matrix.md` | `24660ead6d48c295c68a4349a5df06291995cf95` |
| `typesetter-doc-main/v23/Layout_dependency_map.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `chatgpt_v23/technical/Layout_dependency_map.md` | `28de3fd5bc8ad3290044c127ce71bf54fe208dcb` |
| `typesetter-doc-main/v23/Layout_issue_catalog.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `chatgpt_v23/issues/Layout_issue_catalog.md` | `69a86b4a73e05cd41c8795793577c1099f812782` |
| `typesetter-doc-main/v23/Technical_history_and_architecture.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a9…` | `chatgpt_v23/technical/Technical_history_and_architecture.md` | `fc4142c28e2bcc1d745effd9755e84f087de18f3` |
| `yellow-v22/engine-diagnostics.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `64f64a5b0ded…` | `engine-diagnostics.js` | `6a7feb01609e7063720638aaaac3312f99bca1c8` |
| `yellow-v22/engine-inputs.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `64f64a5b0ded…` | `engine-inputs.js` | `0c75b7c389c88ef612c8102ee8333ac483ea2c07` |
| `yellow-v22/engine-trace.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `64f64a5b0ded…` | `engine-trace.js` | `ee03c0f2e50949c545d04b28afca40ce37415b5a` |
| `yellow-v22/tests/engine-inputs.test.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `64f64a5b0ded…` | `tests/engine-inputs.test.js` | `2d680907e70ffcedc9f37bdf3a6cd2ff90eabaac` |
| `yellow-v22/tests/engine-trace.test.js` | `SUGINACH/Tora_Book_Typesetter_Yellow@V22` | `64f64a5b0ded…` | `tests/engine-trace.test.js` | `f8aac7207190011f0c9550f5375801d46aab2366` |

### IMUD main — historical layout suite (additional 8 files)

| Archived path | Source ref | Locked source commit | Original source path | Git blob |
|---|---|---|---|---|
| `imud-main/layout-scenarios/scenarios.js` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/layout/scenarios.js` | `8d05c43a70141c60fcfa6c379fdba6802f29f25c` |
| `imud-main/layout-scenarios/baseline.json` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/layout/baseline.json` | `f9fa529b2158d3fea911c6fabd676dd17ae03bc3` |
| `imud-main/layout-scenarios/run-suite.js` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/layout/run-suite.js` | `d874880912577386a9beb9d403e35d3e76b4fc58` |
| `imud-main/layout-scenarios/check_layout.js` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/layout/check_layout.js` | `0899b27cbf4a41240b46756d65f16d819011aca8` |
| `imud-main/layout-scenarios/common.js` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/lib/common.js` | `694e163bdc0ee4f97211674e8fcd4bcf7fb6f457` |
| `imud-main/README-tests.md` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/README.md` | `5b1b1c8fa9e8bb263243dd23b45147a439bfdc7b` |
| `imud-main/layout-scenarios/problem_chapters.txt` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/corpus/problem_chapters.txt` | `3eb24e7dadfb09cefa3e12745574d644df72310f` |
| `imud-main/layout-scenarios/test_doc.txt` | `SUGINACH/IMUD_TORANI@main` | `da31142ed868da987b14af5213b41495e81733c4` | `tests/corpus/test_doc.txt` | `e0146bafae845e321e8bfd5cbfcea5714dabed12` |

### Additional unique source files verified after the initial index

The following three upstream source files were present in the archive tree but were not included in the original 75-file index. Each destination Git blob was compared with the file at the exact pinned source commit and matched byte-for-byte.

| Archived path | Source ref | Locked source commit | Original source path | Git blob |
|---|---|---|---|---|
| `react-main/conventions/work-conventions.md` | `SUGINACH/Tora_Book_Typesetter_React@main` | `a2fa18e5395563e90a539a51c1f8856df393ab1b` | `docs/conventions/work-conventions.md` | `3a177eae23f12729042f57aa13f70c086b406bf2` |
| `typesetter-doc-main/chatgpt_v23/session/Session_handoff.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a940ac92140ea1d7a1f4de7eb8f8f9` | `chatgpt_v23/session/Session_handoff.md` | `b290bb1e7a9a6da4bb4342192261370ae420bf79` |
| `typesetter-doc-main/shared/research/Functional_gaps_analysis.md` | `SUGINACH/Typesetter_doc@main` | `ad71c63f87a940ac92140ea1d7a1f4de7eb8f8f9` | `shared/research/Functional_gaps_analysis.md` | `90c51d3f342f975976e2bb6b1831ad790bb1a1cd` |

### Duplicate path-preserving copies

Nine additional archived paths are exact Git-blob duplicates of already indexed files. They preserve the source directory layout; each duplicate has the same blob ID as its canonical indexed copy and does not add a distinct source file.

| Additional archived path | Canonical indexed copy | Identical Git blob |
|---|---|---|
| `typesetter-doc-main/chatgpt_v23/issues/Issue_coverage_matrix.md` | `typesetter-doc-main/v23/Issue_coverage_matrix.md` | `24660ead6d48c295c68a4349a5df06291995cf95` |
| `typesetter-doc-main/chatgpt_v23/technical/Layout_dependency_map.md` | `typesetter-doc-main/v23/Layout_dependency_map.md` | `28de3fd5bc8ad3290044c127ce71bf54fe208dcb` |
| `typesetter-doc-main/chatgpt_v23/technical/Technical_history_and_architecture.md` | `typesetter-doc-main/v23/Technical_history_and_architecture.md` | `fc4142c28e2bcc1d745effd9755e84f087de18f3` |
| `typesetter-doc-main/shared/plans/Issue_resolution_protocol.md` | `typesetter-doc-main/plans/Issue_resolution_protocol.md` | `5a2643924d4873594b66f9b2af2bc4aca35c3071` |
| `typesetter-doc-main/shared/plans/Plan_stability_completeness_transparency.md` | `typesetter-doc-main/plans/Plan_stability_completeness_transparency.md` | `4d9188e254fad87a5549949774af501a5ec69850` |
| `typesetter-doc-main/shared/plans/Working_rules.md` | `typesetter-doc-main/plans/Working_rules.md` | `3b4fe2cab862ddeb04a8b96da7eedae68f884902` |
| `typesetter-doc-main/shared/research/Deterministic_typesetting_engine.md` | `typesetter-doc-main/research/Deterministic_typesetting_engine.md` | `8eb7bbaf2c694c95339a3be97fd4375643717875` |
| `typesetter-doc-main/shared/research/Dual_column_RTL_design.md` | `typesetter-doc-main/research/Dual_column_RTL_design.md` | `e723a9d82a37e2520e8e8f73e49dc65eb54e7179` |
| `typesetter-doc-main/shared/research/Knuth-Plass_deep_dive.md` | `typesetter-doc-main/research/Knuth-Plass_deep_dive.md` | `c3cadef1e4840e792c2c9db07eb3f85d90409169` |

### Archive-local guide

`imud-main/layout-scenarios/README.md` is an explanatory guide written for this archive (blob `be39be5f732efe2993fc9c69fd810c3ac58f86da`); it is not an upstream source file and is not counted in the source total.

**Total:** 78 distinct upstream source files (67 cross-repository reference files + 8 IMUD layout-suite source files + 3 additional source files), plus 9 exact duplicate path copies, one archive-local guide and this index README: **89 tracked files** in this archive subtree. This is provenance-preserving reference material, not adoption into runtime.
