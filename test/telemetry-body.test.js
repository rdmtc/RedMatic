'use strict';

// Task 18: the ccu block of the telemetry body (lib/redmaticVersions.js). openccu-lite keeps upstream's
// PRODUCT in /VERSION, so without a marker it counts as OpenCCU's rpi4, ova, ... on the statistics page.
// On openccu-lite (a LITE= line in /VERSION, or occulited; bug 13's rule) PRODUCT is sent as
// lite-<PRODUCT> and the openccu-lite version as ccu.LITE. VERSION and PLATFORM stay as they are, and
// a CCU3, OpenCCU and piVCCU send what they sent before, with no LITE key at all.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {ccuInfo} = require('../addon_files/redmatic/lib/redmaticVersions.js');

const VERSIONS = {
    // an openccu-lite Pi 4 on 1.0.0-dev.30
    lite: 'VERSION=3.89.11.20260919\nPRODUCT=rpi4\nPLATFORM=rpi4\nVARIANT=lite\nLITE=1.0.0-dev.30\n',
    // the LXC container product of openccu-lite, quoted the way a shell may write it
    liteLxc: 'VERSION=3.89.11.20260919\nPRODUCT="lxc_amd64"\nPLATFORM=lxc\nVARIANT=lite\nLITE="1.0.0-dev.31"\n',
    ccu3: 'VERSION=3.83.6.20250901\nPRODUCT=ccu3\nPLATFORM=ccu3\n',
    openccu: 'VERSION=3.83.6.20250904\nPRODUCT=raspmatic_rpi4\nPLATFORM=rpi4\n',
};

function system(t, {version, piVCCU = false, occulited = false}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-telemetry-body-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    const sys = {
        versionFile: path.join(dir, 'VERSION'),
        piVCCUFile: path.join(dir, 'piVCCU3'),
        occulited: path.join(dir, 'occulited'),
        machine: 'aarch64',
    };
    if (version !== undefined) {
        fs.writeFileSync(sys.versionFile, version);
    }
    if (piVCCU) {
        fs.writeFileSync(sys.piVCCUFile, '');
    }
    if (occulited) {
        fs.writeFileSync(sys.occulited, '#!/bin/sh\n', {mode: 0o755});
    }
    return sys;
}

test('openccu-lite: PRODUCT lite-<PRODUCT>, its version as LITE, VERSION and PLATFORM unchanged', t => {
    assert.deepStrictEqual(ccuInfo(system(t, {version: VERSIONS.lite, occulited: true})), {
        VERSION: '3.89.11.20260919',
        PRODUCT: 'lite-rpi4',
        PLATFORM: 'rpi4-aarch64',
        LITE: '1.0.0-dev.30',
    });
});

test('openccu-lite: quoted values are sent unquoted', t => {
    assert.deepStrictEqual(ccuInfo(system(t, {version: VERSIONS.liteLxc})), {
        VERSION: '3.89.11.20260919',
        PRODUCT: 'lite-lxc_amd64',
        PLATFORM: 'lxc-aarch64',
        LITE: '1.0.0-dev.31',
    });
});

test('openccu-lite known by occulited alone: lite-<PRODUCT>, and no LITE key without a version', t => {
    const info = ccuInfo(system(t, {version: VERSIONS.openccu.replace('raspmatic_rpi4', 'rpi4'), occulited: true}));
    assert.strictEqual(info.PRODUCT, 'lite-rpi4');
    assert.ok(!('LITE' in info), JSON.stringify(info));
});

test('openccu-lite with an empty LITE= line: lite-<PRODUCT>, no LITE key', t => {
    const info = ccuInfo(system(t, {version: 'VERSION=3.89.11\nPRODUCT=ova\nPLATFORM=ova\nLITE=\n'}));
    assert.strictEqual(info.PRODUCT, 'lite-ova');
    assert.ok(!('LITE' in info), JSON.stringify(info));
});

test('CCU3: unchanged, no LITE key', t => {
    assert.deepStrictEqual(ccuInfo(system(t, {version: VERSIONS.ccu3})), {
        VERSION: '3.83.6.20250901',
        PRODUCT: 'ccu3',
        PLATFORM: 'ccu3-aarch64',
    });
});

test('OpenCCU: unchanged, no LITE key', t => {
    assert.deepStrictEqual(ccuInfo(system(t, {version: VERSIONS.openccu})), {
        VERSION: '3.83.6.20250904',
        PRODUCT: 'raspmatic_rpi4',
        PLATFORM: 'rpi4-aarch64',
    });
});

test('piVCCU: pivccu3 as before, no LITE key', t => {
    assert.deepStrictEqual(ccuInfo(system(t, {version: VERSIONS.ccu3, piVCCU: true})), {
        VERSION: '3.83.6.20250901',
        PRODUCT: 'pivccu3',
        PLATFORM: 'ccu3-aarch64',
    });
});

test('no /VERSION: empty strings as before, no LITE key', t => {
    assert.deepStrictEqual(ccuInfo(system(t, {})), {VERSION: '', PRODUCT: '', PLATFORM: '-aarch64'});
});

// the server stores every top-level key it does not know as an installed npm module: LITE must only
// ever be built into the ccu block
test('redmaticVersions.js builds LITE only inside ccu', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'redmaticVersions.js'), 'utf8');
    const main = code.slice(code.indexOf('function main()'), code.indexOf('if (require.main === module)'));
    assert.match(main, /ccu: \{\s*\.\.\.ccuInfo\(\{machine\}\),/);
    assert.doesNotMatch(main, /LITE/);
});
