# Makom Bina v20.5 — imported source preset

This directory is an **inert, data-only import** from the original IMUD repository.

- Source repository: `SUGINACH/IMUD_TORANI`
- Source ref: `main`
- Source commit: `da31142ed868da987b14af5213b41495e81733c4`
- Original directory: `presets/makom-bina-v20.5/`
- Import date: 2026-11-10

## Contents

| File | Original Git blob | Structure |
|---|---|---|
| `default_settings.json` | `48612d30f3122ec176baed57b956f35393b53be0` | 249 settings keys |
| `setting_sets/פרשנות.json` | `4b1cfb6a8e62c59f38beba8d0355246dcf4446f6` | 249 settings keys |
| `setting_sets/קונטרס.json` | `718828aa60fa4ade70d990d1751e881d5befc4e4` | 249 settings keys |
| `setting_sets/תלמוד.json` | `56254b979a249f038a4bb35c536f0772efd7b6a9` | 249 settings keys |

The default settings file is byte-for-byte identical to the existing test fixture
`red-build/tests/fixtures/imud_default_settings_makom_bina.json`. It is copied
here as the runtime-side source asset, not as a second independently maintained
configuration.

The three preset-specific setting sets are deliberately kept separate from the
regular IMUD sets under `red-build/ui/assets/imud/setting_sets/`: their contents
differ. Existing regular settings were not overwritten.

## Activation boundary

No runtime code, settings registry, default selection, migration rule, or layout
pipeline was changed by this import. The preset is registered in `imud-library.js`
and exposed in `settings-panel.js` as an explicit preview/apply choice. Selecting
a set loads its data for preview only; active settings change only after the user
clicks the separate apply button. The preset is not loaded automatically at startup
and does not replace the regular IMUD setting sets or global defaults.
