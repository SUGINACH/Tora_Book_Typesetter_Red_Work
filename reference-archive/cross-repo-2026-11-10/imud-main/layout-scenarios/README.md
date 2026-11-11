# IMUD historical layout scenario suite — ARCHIVE ONLY

Source: `SUGINACH/IMUD_TORANI@da31142ed868da987b14af5213b41495e81733c4`.

This folder preserves the old IMUD browser-based layout acceptance harness and its input corpus. It is **not** a RED test suite and none of its code or fixtures is connected to RED runtime, `npm test`, corpus manifests or GitHub Actions.

## Contents

- `scenarios.js`: deterministic scenario catalogue and generator.
- `baseline.json`: historical baseline with **38 named scenarios** at this exact source snapshot.
- `run-suite.js`, `check_layout.js`, `common.js`: old Playwright/Chromium harness, DOM checker and browser helpers.
- `test_doc.txt`, `problem_chapters.txt`: original input documents used by the catalogue.
- `README-tests.md`: source README.

**Count discrepancy:** the source README says “21 scenarios”, but the committed `baseline.json` contains 38 named scenario records and `scenarios.js` generates those records. The machine-readable baseline is the authoritative count for the pinned snapshot; the stale README wording has not been silently corrected in the source copy.

## Use boundary and migration notes

- Do not run the old suite against RED: it expects the IMUD root page, legacy DOM selectors/classes, old settings element IDs, Playwright harness and old renderer.
- Do not import its baseline page counts or violation counts as RED acceptance targets.
- The catalogue generates deterministic text inputs (headings, notes, parenthetical spans, dividers, continuous-footnote variants and other settings combinations). Inputs may be reviewed for semantic coverage and then converted into RED-native, D-100-valid fixtures in a separate path.
- Do not use this suite to compare line/word/paragraph sequences with historical PDFs. P6/P7 remain fully suspended.
- Preserve these originals unchanged. Any future RED adaptation must be a new tool or fixture set with its own source provenance and expectations grounded in RED requirements.

## Exact source blobs

| Archived path | Source Git blob |
|---|---|
| `imud-main/layout-scenarios/scenarios.js` | `8d05c43a70141c60fcfa6c379fdba6802f29f25c` |
| `imud-main/layout-scenarios/baseline.json` | `f9fa529b2158d3fea911c6fabd676dd17ae03bc3` |
| `imud-main/layout-scenarios/run-suite.js` | `d874880912577386a9beb9d403e35d3e76b4fc58` |
| `imud-main/layout-scenarios/check_layout.js` | `0899b27cbf4a41240b46756d65f16d819011aca8` |
| `imud-main/layout-scenarios/common.js` | `694e163bdc0ee4f97211674e8fcd4bcf7fb6f457` |
| `imud-main/README-tests.md` | `5b1b1c8fa9e8bb263243dd23b45147a439bfdc7b` |
| `imud-main/layout-scenarios/problem_chapters.txt` | `3eb24e7dadfb09cefa3e12745574d644df72310f` |
| `imud-main/layout-scenarios/test_doc.txt` | `e0146bafae845e321e8bfd5cbfcea5714dabed12` |

The eight source files were copied byte-for-byte and destination Git blob IDs were checked against the source IDs.
