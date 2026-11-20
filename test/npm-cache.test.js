'use strict';

// lib/npm-cache.js: where npm caches the palette installs (the settings page's "npm cache"): in RAM
// by default, on the storage (var/npm-cache through etc/npmrc) when chosen. bin/redmaticLoader and
// update_script call it as a script. Run with `node --test test/`.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const MODULE = path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'npm-cache.js');
const {mode, dir, readSettings} = require(MODULE);

test('RAM unless the setting says storage', () => {
    assert.strictEqual(mode({}), 'ram');
    assert.strictEqual(mode(undefined), 'ram');
    assert.strictEqual(mode({npmCache: 'ram'}), 'ram');
    assert.strictEqual(mode({npmCache: 'something'}), 'ram');
    assert.strictEqual(mode({npmCache: 'storage'}), 'storage');
});

test('the directory: per uid in /tmp for RAM, none (etc/npmrc\'s) for storage', () => {
    assert.strictEqual(dir({}, 30000), '/tmp/redmatic-npm-cache-30000');
    assert.strictEqual(dir({npmCache: 'storage'}, 0), '');
});

test('a missing or broken settings.json reads as no setting', t => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-npm-'));
    t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
    assert.deepStrictEqual(readSettings(path.join(tmp, 'none.json')), {});
    fs.writeFileSync(path.join(tmp, 'broken.json'), '{');
    assert.deepStrictEqual(readSettings(path.join(tmp, 'broken.json')), {});
});

test('as a script: mode and dir from the settings file', t => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-npm-'));
    t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
    const file = path.join(tmp, 'settings.json');
    const run = what => execFileSync(process.execPath, [MODULE, what], {env: {...process.env, REDMATIC_SETTINGS: file}}).toString().trim();

    fs.writeFileSync(file, JSON.stringify({npmCache: 'storage'}));
    assert.strictEqual(run('mode'), 'storage');
    assert.strictEqual(run('dir'), '');

    fs.writeFileSync(file, JSON.stringify({restartOnCrash: 0}));
    assert.strictEqual(run('mode'), 'ram');
    assert.strictEqual(run('dir'), `/tmp/redmatic-npm-cache-${process.getuid()}`);
});
