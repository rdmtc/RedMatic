'use strict';

// B-18: lib/context-dir.js points a file context store whose directory Node-RED may not use (the USB
// stick without the group, confined on openccu-lite) at var/ for the run, with a loud line, instead
// of letting Node-RED die on "Error loading context store: EACCES". Run with `node --test test/`.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {checkStores, problem, FALLBACK} = require('../addon_files/redmatic/lib/context-dir.js');

const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;

function scratch(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-ctx-'));
    t.after(() => {
        for (const d of fs.readdirSync(dir)) {
            try {
                fs.chmodSync(path.join(dir, d), 0o755);
            } catch {}
        }
        fs.rmSync(dir, {recursive: true, force: true});
    });
    return dir;
}

const eacces = Object.assign(new Error('permission denied'), {code: 'EACCES'});

test('an unusable store is pointed at var/ and named in the log; others stay', () => {
    const lines = [];
    const stores = {
        default: {module: 'localfilesystem', config: {dir: '/media/usb0/redmatic', flushInterval: 30}},
        memory: {module: 'memory'},
        ok: {module: 'localfilesystem', config: {dir: '/somewhere/fine'}}
    };
    const changed = checkStores(stores, {
        log: line => lines.push(line),
        check: dir => (dir.startsWith('/media/') ? eacces : null)
    });
    assert.deepStrictEqual(changed, ['default']);
    assert.strictEqual(stores.default.config.dir, FALLBACK);
    assert.strictEqual(stores.default.config.flushInterval, 30, 'the rest of the config stays');
    assert.strictEqual(stores.ok.config.dir, '/somewhere/fine');
    assert.deepStrictEqual(stores.memory, {module: 'memory'});
    assert.strictEqual(lines.length, 1);
    assert.match(lines[0], /^\[redmatic\] context store 'default': \/media\/usb0\/redmatic is not usable for .+ \(EACCES\); using \/usr\/local\/addons\/redmatic\/var/);
    assert.match(lines[0], /usbstorage/);
});

test('var/ itself, memory stores and stores without a dir are not checked', () => {
    let calls = 0;
    const check = () => {
        calls++;
        return eacces;
    };
    const stores = {
        default: {module: 'localfilesystem', config: {dir: FALLBACK}},
        memory: {module: 'memory'},
        bare: {module: 'localfilesystem'},
        none: null
    };
    assert.deepStrictEqual(checkStores(stores, {log: () => {}, check}), []);
    assert.strictEqual(calls, 0);
    assert.deepStrictEqual(checkStores(undefined, {log: () => {}, check}), []);
});

test('problem(): an existing, writable context directory and a creatable one are usable', t => {
    const dir = scratch(t);
    fs.mkdirSync(path.join(dir, 'with', 'context'), {recursive: true});
    assert.strictEqual(problem(path.join(dir, 'with')), null);
    assert.strictEqual(problem(path.join(dir, 'new', 'deeper')), null, 'Node-RED creates it');
});

test('problem(): a path below a file is not', t => {
    const dir = scratch(t);
    fs.writeFileSync(path.join(dir, 'file'), '', {mode: 0o644});
    assert.ok(problem(path.join(dir, 'file', 'redmatic')));
});

test('problem(): a directory the user may not search or write is not (the stick without usbstorage)', {skip: isRoot && 'root passes every mode'}, t => {
    const dir = scratch(t);
    // /media/usb1 as the user sees it without the group: root:usbstorage 0770
    const stick = path.join(dir, 'usb1');
    fs.mkdirSync(path.join(stick, 'redmatic', 'context'), {recursive: true});
    fs.chmodSync(stick, 0o000);
    const error = problem(path.join(stick, 'redmatic'));
    assert.ok(error);
    assert.strictEqual(error.code, 'EACCES');
    // listed but read-only (ProtectSystem=strict without /media in ReadWritePaths looks like this)
    const ro = path.join(dir, 'ro');
    fs.mkdirSync(path.join(ro, 'context'), {recursive: true});
    fs.chmodSync(path.join(ro, 'context'), 0o555);
    assert.ok(problem(ro));
});
