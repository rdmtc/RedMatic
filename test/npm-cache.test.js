'use strict';

// lib/npm-cache.js: where npm caches the palette installs (the settings page's "npm cache"): on the
// storage (var/npm-cache through etc/npmrc) by default, in RAM when chosen - then emptied after
// every npm run of Node-RED's palette. 9.18.0's default "ram" goes back to "storage" once.
// bin/redmaticLoader and update_script call it as a script. Run with `node --test test/`.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const MODULE = path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'npm-cache.js');
const {mode, dir, readSettings, migrate, empty, emptyAfterNpm, RAM_PREFIX} = require(MODULE);

function scratch(t) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-npm-'));
    t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
    return tmp;
}

test('the storage unless the setting says RAM', () => {
    assert.strictEqual(mode({}), 'storage');
    assert.strictEqual(mode(undefined), 'storage');
    assert.strictEqual(mode({npmCache: 'storage'}), 'storage');
    assert.strictEqual(mode({npmCache: 'something'}), 'storage');
    assert.strictEqual(mode({npmCache: 'ram'}), 'ram');
});

test('the directory: none (etc/npmrc\'s) for the storage, per uid in /tmp for RAM', () => {
    assert.strictEqual(dir({}, 0), '');
    assert.strictEqual(dir({npmCache: 'ram'}, 30000), '/tmp/redmatic-npm-cache-30000');
});

test('a missing or broken settings.json reads as no setting', t => {
    const tmp = scratch(t);
    assert.deepStrictEqual(readSettings(path.join(tmp, 'none.json')), {});
    fs.writeFileSync(path.join(tmp, 'broken.json'), '{');
    assert.deepStrictEqual(readSettings(path.join(tmp, 'broken.json')), {});
});

test('9.18.0\'s default "ram" goes back to the storage once; a chosen RAM stays', t => {
    const tmp = scratch(t);
    const file = path.join(tmp, 'settings.json');
    const s = {restartOnCrash: 0, npmCache: 'ram'};
    assert.strictEqual(migrate(s, file), true);
    assert.deepStrictEqual(s, {restartOnCrash: 0, npmCache: 'storage', npmCacheMigrated: true});
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(file, 'utf8')), s);
    // the settings page saves the choice with the marker
    assert.strictEqual(migrate({npmCache: 'ram', npmCacheMigrated: true}), false);
    assert.strictEqual(migrate({npmCache: 'storage'}), false);
    assert.strictEqual(migrate({}), false);
});

test('empty() clears a RAM cache but npm\'s logs, and nothing outside /tmp/redmatic-npm-cache-*', t => {
    const cache = `${RAM_PREFIX}test-${process.pid}`;
    t.after(() => fs.rmSync(cache, {recursive: true, force: true}));
    fs.mkdirSync(path.join(cache, '_cacache', 'content'), {recursive: true});
    fs.mkdirSync(path.join(cache, '_logs'));
    fs.writeFileSync(path.join(cache, '_cacache', 'content', 'x'), 'tarball');
    fs.writeFileSync(path.join(cache, '_logs', 'debug.log'), 'log');
    empty(cache);
    assert.deepStrictEqual(fs.readdirSync(cache), ['_logs']);

    const other = scratch(t);
    fs.writeFileSync(path.join(other, 'keep'), 'x');
    empty(other);
    assert.deepStrictEqual(fs.readdirSync(other), ['keep']);
    empty(`${RAM_PREFIX}missing-${process.pid}`);
});

test('emptyAfterNpm empties after an npm run, successful or failed, and leaves other runs alone', async t => {
    const cache = `${RAM_PREFIX}exec-${process.pid}`;
    t.after(() => fs.rmSync(cache, {recursive: true, force: true}));
    const fill = () => {
        fs.mkdirSync(path.join(cache, '_cacache'), {recursive: true});
        fs.writeFileSync(path.join(cache, '_cacache', 'x'), 'tarball');
    };
    const calls = [];
    const exec = {
        run(command, args) {
            calls.push(args);
            return args.includes('fail') ? Promise.reject(new Error('npm failed')) : Promise.resolve({code: 0});
        }
    };
    assert.strictEqual(emptyAfterNpm(exec, cache), true);
    assert.strictEqual(emptyAfterNpm(exec, cache), false, 'wrapped once');

    fill();
    assert.deepStrictEqual(await exec.run('/node', ['/x/npm/bin/npm-cli.js', 'install', 'mod']), {code: 0});
    assert.deepStrictEqual(fs.readdirSync(cache), []);

    fill();
    await assert.rejects(exec.run('/node', ['/x/npm/bin/npm-cli.js', 'install', 'fail']), /npm failed/);
    assert.deepStrictEqual(fs.readdirSync(cache), []);

    fill();
    await exec.run('/usr/bin/git', ['status']);
    assert.deepStrictEqual(fs.readdirSync(cache), ['_cacache']);
    assert.strictEqual(calls.length, 3);
    assert.strictEqual(emptyAfterNpm({}, cache), false);
});

test('as a script: migrates, then mode and dir from the settings file', t => {
    const tmp = scratch(t);
    const file = path.join(tmp, 'settings.json');
    const run = what => execFileSync(process.execPath, [MODULE, what], {env: {...process.env, REDMATIC_SETTINGS: file}}).toString().trim();

    fs.writeFileSync(file, JSON.stringify({restartOnCrash: 0}));
    assert.strictEqual(run('mode'), 'storage');
    assert.strictEqual(run('dir'), '');

    // 9.18.0's default
    fs.writeFileSync(file, JSON.stringify({npmCache: 'ram'}));
    assert.strictEqual(run('dir'), '');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(file, 'utf8')), {npmCache: 'storage', npmCacheMigrated: true});

    // chosen on the settings page
    fs.writeFileSync(file, JSON.stringify({npmCache: 'ram', npmCacheMigrated: true}));
    assert.strictEqual(run('mode'), 'ram');
    assert.strictEqual(run('dir'), `/tmp/redmatic-npm-cache-${process.getuid()}`);
});
