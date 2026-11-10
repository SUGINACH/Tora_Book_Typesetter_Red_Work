// tests/integration/setting-presets.test.js — IMUD Makom Bina v20.5 runtime preset contract
'use strict';

const fs = require('fs');
const path = require('path');
const { describe, it, assert, assertEq, report } = require('../harness');
const { createImudLibrary } = require('../../src/ui/imud-library');

const ASSETS = path.join(__dirname, '..', '..', 'ui', 'assets', 'imud');
const PRESET_ID = 'makom-bina-v20.5';
const SET_IDS = ['default', 'תלמוד', 'פרשנות', 'קונטרס'];

function readSource(setId) {
  const relative = setId === 'default'
    ? 'default_settings.json'
    : path.join('setting_sets', setId + '.json');
  return JSON.parse(fs.readFileSync(
    path.join(ASSETS, 'presets', PRESET_ID, relative), 'utf8'
  ));
}

function expectReject(promise, fragment) {
  return promise.then(
    () => { throw new Error('expected rejection containing: ' + fragment); },
    (error) => assert(String(error && error.message || error).includes(fragment),
      'rejection explains the invalid preset: ' + String(error && error.message || error))
  );
}

describe('IMUD Makom Bina v20.5 — isolated runtime preset import', () => {
  it('lists one isolated preset with four explicit choices and no mutation', () => {
    const library = createImudLibrary(null);
    const first = library.listSettingPresets();
    assertEq(first.length, 1, 'one additional source preset');
    assertEq(first[0].id, PRESET_ID);
    assertEq(first[0].source, 'IMUD_TORANI');
    assertEq(first[0].version, '20.5');
    assertEq(first[0].sets.map(s => s.id), SET_IDS);
    // Returned metadata is detached; callers cannot mutate the registry.
    first[0].sets.pop();
    assertEq(library.listSettingPresets()[0].sets.map(s => s.id), SET_IDS);
  });

  it('loads all four actual asset files through the runtime loader with complete disposition', async () => {
    const originalFetch = global.fetch;
    const requests = [];
    global.fetch = async (url) => {
      const value = String(url);
      const prefix = 'assets/imud/';
      assert(value.startsWith(prefix), 'loader requests remain inside the IMUD asset root: ' + value);
      const relative = decodeURIComponent(value.slice(prefix.length));
      const resolved = path.resolve(ASSETS, relative);
      assert(resolved.startsWith(path.resolve(ASSETS) + path.sep),
        'asset path cannot escape the IMUD asset root: ' + relative);
      requests.push(relative);
      if (!fs.existsSync(resolved)) return { ok: false, status: 404 };
      const json = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      return { ok: true, status: 200, json: async () => json };
    };

    try {
      const library = createImudLibrary(null);
      for (const setId of SET_IDS) {
        const raw = readSource(setId);
        const loaded = await library.loadSettingPreset(PRESET_ID, setId);
        assertEq(Object.keys(raw).length, 249, setId + ': source has 249 keys');
        assertEq(loaded.presetId, PRESET_ID);
        assertEq(loaded.presetLabel, 'מקום בינה v20.5');
        assertEq(loaded.source, 'IMUD_TORANI');
        assertEq(loaded.version, '20.5');
        assertEq(loaded.setId, setId);
        assertEq(loaded.unmapped, [], setId + ': no unmapped source keys');
        assertEq(
          loaded.report.mapped + loaded.report.merged + loaded.report.uiState + loaded.report.removed,
          Object.keys(raw).length,
          setId + ': every source key has a documented disposition'
        );
        assertEq(loaded.settings._imudRaw, raw, setId + ': original values remain available to the IMUD compatibility path');
        assertEq(loaded.settings._layout-profile, 'imud', setId + ': explicit IMUD compatibility profile');
      }
      assert(requests.includes('presets/' + PRESET_ID + '/default_settings.json'),
        'default preset fetched from its isolated source directory');
      for (const setId of SET_IDS.slice(1)) {
        assert(requests.includes('presets/' + PRESET_ID + '/setting_sets/' + encodeURIComponent(setId) + '.json'),
          setId + ': fetched from isolated preset directory');
      }
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('rejects unknown preset and unknown set before fetching files', async () => {
    const library = createImudLibrary(null);
    await expectReject(library.loadSettingPreset('unknown-preset', 'default'), 'preset לא מוכר');
    await expectReject(library.loadSettingPreset(PRESET_ID, 'unknown-set'), 'ערכה לא מוכרת');
  });
});

report('setting-presets');
