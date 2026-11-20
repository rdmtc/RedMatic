'use strict';

// lib/context-store.js: Node-RED's file context store rewrites a whole scope file at every flush
// once anything in the scope was set, also when nothing changed. The wrapped store skips such a
// flush and leaves everything else to Node-RED. These tests run Node-RED's own localfilesystem
// store (the root package's node-red) in a temp dir. Run with `node --test test/`.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {wrapStores, storeModule, LABEL} = require('../addon_files/redmatic/lib/context-store.js');

const ORIGINAL = require.resolve('@node-red/runtime/lib/nodes/context/localfilesystem', {
    paths: [path.dirname(require.resolve('node-red/package.json'))]
});

function scratch(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-store-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    return dir;
}

// a wrapped store in dir; flushes only when the test calls flush()
async function openStore(t, dir) {
    const store = storeModule(ORIGINAL)({dir, flushInterval: 3600});
    await store.open();
    t.after(() => store.close());
    return store;
}

const set = (store, scope, key, value) => new Promise((resolve, reject) => {
    store.set(scope, key, value, error => (error ? reject(error) : resolve()));
});

async function flush(store) {
    // what the flush timer and close() call
    clearTimeout(store._pendingWriteTimeout);
    delete store._pendingWriteTimeout;
    await store._flushPendingWrites();
}

const globalFile = dir => path.join(dir, 'context', 'global', 'global.json');
const stamp = file => {
    const s = fs.statSync(file);
    return `${s.ino}:${s.mtimeMs}`;
};

test('a changed scope is written, the same content set again is not', async t => {
    const dir = scratch(t);
    const store = await openStore(t, dir);
    await set(store, 'global', 'state', 'on');
    await flush(store);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(globalFile(dir), 'utf8')), {state: 'on'});
    const before = stamp(globalFile(dir));

    await set(store, 'global', 'state', 'on');
    await flush(store);
    assert.strictEqual(stamp(globalFile(dir)), before);
    assert.deepStrictEqual(store.redmaticStats, {written: 1, skipped: 1});

    await set(store, 'global', 'state', 'off');
    await flush(store);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(globalFile(dir), 'utf8')), {state: 'off'});
    assert.deepStrictEqual(store.redmaticStats, {written: 2, skipped: 1});
});

test('what was read at the start counts as written', async t => {
    const dir = scratch(t);
    fs.mkdirSync(path.dirname(globalFile(dir)), {recursive: true});
    fs.writeFileSync(globalFile(dir), JSON.stringify({big: {a: 1, b: [1, 2, 3]}, state: 'on'}, null, 4));
    const before = stamp(globalFile(dir));
    const store = await openStore(t, dir);
    await set(store, 'global', 'state', 'on');
    await flush(store);
    assert.strictEqual(stamp(globalFile(dir)), before);
    assert.deepStrictEqual(store.redmaticStats, {written: 0, skipped: 1});
});

test('an object changed in place and set again is written', async t => {
    const dir = scratch(t);
    const store = await openStore(t, dir);
    await set(store, 'global', 'obj', {count: 1});
    await flush(store);
    // the memory cache hands out the stored object itself: a flow changes it and sets it again
    const obj = store.cache.get('global', 'obj');
    obj.count = 2;
    await set(store, 'global', 'obj', obj);
    await flush(store);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(globalFile(dir), 'utf8')), {obj: {count: 2}});
});

test('flow and node scopes are compared on their own', async t => {
    const dir = scratch(t);
    const store = await openStore(t, dir);
    await set(store, 'flow1', 'a', 1);
    await set(store, 'node1:flow1', 'b', 2);
    await flush(store);
    await set(store, 'flow1', 'a', 1);
    await set(store, 'node1:flow1', 'b', 3);
    await flush(store);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'context', 'flow1', 'node1.json'), 'utf8')), {b: 3});
    assert.deepStrictEqual(store.redmaticStats, {written: 3, skipped: 1});
});

test('a deleted scope set again to its old content is written', async t => {
    const dir = scratch(t);
    const store = await openStore(t, dir);
    await set(store, 'node1:flow1', 'b', 2);
    await flush(store);
    const file = path.join(dir, 'context', 'flow1', 'node1.json');
    await store.delete('node1:flow1');
    assert.strictEqual(fs.existsSync(file), false);
    await set(store, 'node1:flow1', 'b', 2);
    await flush(store);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(file, 'utf8')), {b: 2});
});

test('a clean (a deploy) keeps global and the scopes in use, drops the removed ones', async t => {
    const dir = scratch(t);
    const store = await openStore(t, dir);
    await set(store, 'global', 'state', 'on');
    await set(store, 'node1:flow1', 'b', 2);
    await set(store, 'node2:flow1', 'c', 3);
    await flush(store);
    // node2 was removed by the deploy
    await store.clean(['flow1', 'node1']);
    const file2 = path.join(dir, 'context', 'flow1', 'node2.json');
    assert.strictEqual(fs.existsSync(file2), false);
    await set(store, 'global', 'state', 'on');
    await set(store, 'node1:flow1', 'b', 2);
    await set(store, 'node2:flow1', 'c', 3);
    await flush(store);
    assert.deepStrictEqual(store.redmaticStats, {written: 4, skipped: 2});
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(file2, 'utf8')), {c: 3});
});

test('a circular value is left to Node-RED, which writes it', async t => {
    const dir = scratch(t);
    const store = await openStore(t, dir);
    const loop = {name: 'x'};
    loop.self = loop;
    await set(store, 'global', 'loop', loop);
    await flush(store);
    await set(store, 'global', 'loop', loop);
    await flush(store);
    assert.deepStrictEqual(store.redmaticStats, {written: 2, skipped: 0});
    assert.strictEqual(JSON.parse(fs.readFileSync(globalFile(dir), 'utf8')).loop.name, 'x');
});

test('close() writes what changed and skips what did not', async t => {
    const dir = scratch(t);
    const store = storeModule(ORIGINAL)({dir, flushInterval: 3600});
    await store.open();
    await set(store, 'global', 'state', 'on');
    await store.close();
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(globalFile(dir), 'utf8')), {state: 'on'});

    const again = storeModule(ORIGINAL)({dir, flushInterval: 3600});
    await again.open();
    const before = stamp(globalFile(dir));
    await set(again, 'global', 'state', 'on');
    await again.close();
    assert.strictEqual(stamp(globalFile(dir)), before);
});

test('wrapStores swaps the localfilesystem stores only', () => {
    const stores = {
        default: {module: 'localfilesystem', config: {dir: '/x', flushInterval: 30}},
        memory: {module: 'memory'},
        custom: {module: 'node-red-context-redis'}
    };
    assert.deepStrictEqual(wrapStores(stores, {original: ORIGINAL}), ['default']);
    assert.strictEqual(typeof stores.default.module, 'function');
    assert.strictEqual(String(stores.default.module), LABEL);
    assert.deepStrictEqual(stores.default.config, {dir: '/x', flushInterval: 30});
    assert.strictEqual(stores.memory.module, 'memory');
    assert.strictEqual(stores.custom.module, 'node-red-context-redis');
});

test('without Node-RED\'s store the stores stay as they are, with a line', () => {
    const lines = [];
    const stores = {default: {module: 'localfilesystem', config: {dir: '/x'}}};
    assert.deepStrictEqual(wrapStores(stores, {original: '/nowhere/localfilesystem.js', log: l => lines.push(l)}), []);
    assert.strictEqual(stores.default.module, 'localfilesystem');
    assert.strictEqual(lines.length, 1);
});
