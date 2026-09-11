'use strict';

// #602: lib/compat.js keeps a got 11 retry on a settled promise from stopping Node-RED.
// Run with `node --test test/` (npm run test:unit); needs the got 11 devDependency, which brings
// p-cancelable 2.x.

const test = require('node:test');
const assert = require('node:assert');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');

const COMPAT = path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'compat.js');
const SETTLED = 'The `onCancel` handler was attached after the promise settled.';

// what got 11 does in its retry: a cancel handler registered after the promise has settled
const settledAttach = `
    const PCancelable = require('p-cancelable');
    let late;
    const p = new PCancelable((resolve, reject, onCancel) => { late = onCancel; resolve(1); });
    p.then(() => setTimeout(() => { late(() => {}); console.log('survived'); }, 10));
`;

function run(args) {
    return spawnSync(process.execPath, [...args, '-e', settledAttach], {cwd: path.join(__dirname, '..'), encoding: 'utf8'});
}

test('without the preload the late handler kills the process (the #602 crash)', () => {
    const r = run([]);
    assert.notStrictEqual(r.status, 0);
    assert.match(r.stderr, /attached after the promise settled/);
});

test('with the preload the process survives and says so once', () => {
    const r = run(['--require', COMPAT]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /survived/);
    assert.match(r.stderr, /\[redmatic\] .*got#1489/);
});

require(COMPAT);
const PCancelable = require('p-cancelable');

test('p-cancelable 2.x is wrapped and still behaves like itself', async () => {
    assert.strictEqual(require('p-cancelable/package.json').version.split('.')[0], '2');
    let handlerRan = false;
    const p = new PCancelable((resolve, reject, onCancel) => {
        onCancel(() => {
            handlerRan = true;
        });
    });
    assert.strictEqual(p.isCanceled, false);
    p.cancel('stop');
    assert.strictEqual(handlerRan, true);
    assert.strictEqual(p.isCanceled, true);
    await assert.rejects(p, (error) => error instanceof PCancelable.CancelError && error.message === 'stop');
});

test('shouldReject passes through to p-cancelable', () => {
    let seen;
    const p = new PCancelable((resolve, reject, onCancel) => {
        onCancel.shouldReject = false;
        seen = onCancel.shouldReject;
        onCancel(() => {});
    });
    assert.strictEqual(seen, false);
    p.cancel();
    assert.strictEqual(p.isCanceled, true);
});

test('a late handler is dropped, not thrown, in the same process', async () => {
    let late;
    const p = new PCancelable((resolve, reject, onCancel) => {
        late = onCancel;
        resolve('done');
    });
    assert.strictEqual(await p, 'done');
    const warn = console.warn;
    console.warn = () => {};
    try {
        assert.doesNotThrow(() => late(() => {}));
    } finally {
        console.warn = warn;
    }
});

test('PCancelable.fn hands out the guarded onCancel', async () => {
    let late;
    const cancelable = PCancelable.fn(async (value, onCancel) => {
        late = onCancel;
        return value * 2;
    });
    const p = cancelable(21);
    assert.ok(typeof p.cancel === 'function');
    assert.strictEqual(await p, 42);
    const warn = console.warn;
    console.warn = () => {};
    try {
        assert.doesNotThrow(() => late(() => {}));
    } finally {
        console.warn = warn;
    }
});

test('another major of p-cancelable is left alone', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-compat-'));
    try {
        const pkgDir = path.join(dir, 'node_modules', 'p-cancelable');
        fs.mkdirSync(pkgDir, {recursive: true});
        fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({name: 'p-cancelable', version: '3.0.0', main: 'index.js'}));
        fs.writeFileSync(path.join(pkgDir, 'index.js'), 'module.exports = function PCancelable() {};');
        const requireThere = Module.createRequire(path.join(dir, 'caller.js'));
        const loaded = requireThere('p-cancelable');
        assert.strictEqual(loaded, requireThere(path.join(pkgDir, 'index.js')));
    } finally {
        fs.rmSync(dir, {recursive: true, force: true});
    }
});

test('got 11 still resolves and cancels with the preload', async () => {
    const got = require('got');
    const http = require('node:http');
    const server = http.createServer((req, res) => {
        if (req.url === '/slow') {
            setTimeout(() => res.end('late'), 2000);
            return;
        }
        res.end('hello');
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        assert.strictEqual(await got(base + '/').text(), 'hello');
        const pending = got(base + '/slow');
        setTimeout(() => pending.cancel(), 50);
        await assert.rejects(pending, (error) => error.name === 'CancelError');
    } finally {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
    }
});

test('the error text the guard matches is p-cancelable 2.x\'s own', () => {
    const source = fs.readFileSync(require.resolve('p-cancelable'), 'utf8');
    assert.ok(source.includes(SETTLED));
});
