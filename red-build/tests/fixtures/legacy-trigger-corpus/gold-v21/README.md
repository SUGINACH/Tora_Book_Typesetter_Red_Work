# Gold V21 — historical trigger-text corpus (archive only)

## Provenance

- Source repository: `SUGINACH/Tora_Book_Typesetter_Gold`
- Source branch: `V21`
- Source commit: `a444d34ccad30fd5ed0d6fd3873adbe9c23cb7e0`
- Original directory: `test-triggers/`
- Import date: 2026-11-10

The ten text fixtures in this folder were copied without transformation. Their
Git blob IDs are recorded below; the imported blobs were checked against the
source IDs and match exactly.

| File | Source Git blob |
|---|---|
| `test-all-triggers.txt` | `36a2028a6b5ca7b21ef7143512eded425b5276d6` |
| `test-trigger-conflicts.txt` | `ab4d2802fa5e61f45bb2e2c28ff693c2bd4682a2` |
| `test-trigger-heading_escort.txt` | `11de3225b5a35615fcc02aaf0788b06e40f0f95d` |
| `test-trigger-imbalance.txt` | `69fed12e05b401b6fa38a188f7ded17a9c728f19` |
| `test-trigger-overflow.txt` | `d5e158fa6cd3bfbce1b859341d95b60af3b2866b` |
| `test-trigger-page_underfill.txt` | `511dcdb97d8a63567e051b3d6fc7805ec76c5607` |
| `test-trigger-settings_conversion.txt` | `2e4ee2a65df6471ea35fd54dd24b6a46aa62516b` |
| `test-trigger-sparse_line.txt` | `7d328a3aecfec2c606d72bbc795f96e3c58b31cc` |
| `test-trigger-unsolvable.txt` | `804d16e93d41e60096c65485036e408c4f4e0984` |
| `test-trigger-widow_orphan.txt` | `59d438becc286d36f46f5b01f7eb4c2d40c47e3a` |

## Important execution boundary

These are **historical source fixtures**, not current RED acceptance tests.

- They were authored for the Gold V21 parser/renderer/audit assumptions.
- They have not been adapted to RED's current source grammar, D-100 structural
  preflight, current settings contract, or current audit taxonomy.
- They are not wired into `npm test`, CI, layout audit, or any automatic
  document-generation path.
- Do not run the corpus as-is against RED and interpret its output as a RED
  regression. First create a separately reviewed RED-compatible derivative,
  preserving this folder unchanged as the source record.
- Some files may intentionally exercise mutually incompatible or unsolvable
  conditions. Their names describe the historical intent, not a promise that
  the current engine should produce a particular finding.

The old `scripts/generate-test-triggers.js` and
`scripts/test-trigger-runner.js` were deliberately **not** copied: the runner
expects the old iframe-based app and `window.__geomAudit` API, not RED's current
Worker/UI architecture. The generator also emits the old source syntax and
would need an explicit D-100-aware port before it could be used.

This import adds data only. It does not alter engine code, parser behavior,
audit rules, CI configuration, or the active test suite.
