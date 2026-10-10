'use strict';

// The openccu-lite manifest (addon_files/openccu-lite.json): build_addon.sh copies addon_files/*
// to the root of the package, so it sits beside update_script, where openccu-lite reads it before
// update_script runs. The CCU3 and OpenCCU ignore it. Checked here is what the platform refuses:
// the format, the id (the rc.d name), the release source. Run with `node --test test/`.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'addon_files');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'openccu-lite.json'), 'utf8'));

test('the manifest names this addon and its release source', () => {
    assert.strictEqual(manifest.format, 1);
    assert.strictEqual(manifest.id, 'redmatic');
    assert.ok(fs.existsSync(path.join(root, 'redmatic', 'bin', 'redmatic')), 'the rc.d script the id names');
    assert.strictEqual(manifest.release.github, 'rdmtc/RedMatic');
    assert.strictEqual(manifest.release.asset, 'redmatic-{arch}-{version}.tar.gz');
    assert.strictEqual(manifest.release.fallback_asset, 'redmatic-{version}.tar.gz');
});

test('the UI facts: Node-RED reads the session header, the images come with the package', () => {
    assert.strictEqual(manifest.ui.session_header, true);
    // no own updater on openccu-lite: update.cgi refuses every update there and the settings page
    // hides its own (task 15, test/session.test.js), so the system's Addons page offers the updates
    // and the manifest says nothing else (task 23)
    assert.ok(!('own_updater' in manifest.ui), 'ui.own_updater');
    // the images are copied into www by build_addon.sh from assets/
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'redmatic5-wide.png')));
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'favicon', 'favicon-96x96.png')));
    assert.deepStrictEqual(manifest.runtime.needs, ['rfd', 'hmipserver']);
    // Node-RED keeps running after the rc.d start: an empty unit is a Node-RED that ended (openccu-lite B-158)
    assert.strictEqual(manifest.runtime.daemon, true);
});

test('the runtime: the early start, USB sticks, nothing else beyond its own directories', () => {
    // node-red-contrib-ccu >= 4.4.5 waits quietly for an interface that does not answer yet and stays in
    // local mode before rfd listens, so the unit may start before rfd and hmipserver (openccu-lite D-75)
    const {note, ...runtime} = manifest.runtime;
    // B-17: a context store or userDir on the USB stick (/media/usb0 -> /media/usb1, mounted
    // root:usbstorage 0770 by the system) needs the group and /media writable under ProtectSystem=strict
    assert.deepStrictEqual(runtime, {
        daemon: true,
        needs: ['rfd', 'hmipserver'],
        start: 'early',
        groups: ['usbstorage'],
        paths: ['/media']
    });
    assert.ok(note.de && note.en);
    assert.match(note.de, /USB-Sticks/);
    assert.match(note.en, /USB sticks/);
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'redmatic', 'var', 'package.json'), 'utf8'));
    const [major, minor, patch] = pkg.dependencies['node-red-contrib-ccu'].split('.').map(Number);
    assert.ok(major > 4 || (major === 4 && (minor > 4 || patch >= 5)), 'node-red-contrib-ccu >= 4.4.5');
});
