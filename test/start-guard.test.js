'use strict';

// B-17: lib/start-guard.js makes a Node-RED that cannot start its server exit with 1 instead of
// idling without a server. A stand-in node_modules/node-red with red.js and lib/red.js is enough:
// the guard watches the require of ./lib/red.js from node-red/red.js and its start(). The loader
// part is checked on bin/redmaticLoader itself. Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ADDON = path.join(__dirname, '..', 'addon_files', 'redmatic');
const GUARD = path.join(ADDON, 'lib', 'start-guard.js');
const COMPAT = path.join(ADDON, 'lib', 'compat.js');

// lib/red.js as Node-RED 5 has it, start() with its own then for the deprecated otherwise()
const libRed = (outcome) => `
module.exports = {
    start() {
        const p = ${outcome === 'fail' ? "Promise.reject(new Error('Error loading context store: EACCES'))" : 'Promise.resolve()'};
        p._then = p.then;
        p.then = function (resolve, reject) {
            const inner = p._then(resolve, reject);
            inner.otherwise = (cb) => inner.catch(cb);
            return inner;
        };
        return p;
    }
};`;

// red.js as Node-RED has it: logs a failed start and goes on; a listening server keeps it alive
const redJs = `
const RED = require('./lib/red.js');
const server = require('http').createServer();
RED.start().then(() => {
    server.listen(0, '127.0.0.1', () => { console.log('now-running'); setTimeout(() => process.exit(0), 3500); });
}).catch((err) => {
    console.log('Failed to start server:');
    console.log(err.message);
});
setInterval(() => {}, 1000);
`;

function fakeNodeRed(t, outcome) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-guard-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    const red = path.join(dir, 'node_modules', 'node-red');
    fs.mkdirSync(path.join(red, 'lib'), {recursive: true});
    fs.writeFileSync(path.join(red, 'lib', 'red.js'), libRed(outcome));
    fs.writeFileSync(path.join(red, 'red.js'), redJs);
    return path.join(red, 'red.js');
}

function run(preloads, script, timeout = 8000) {
    const args = preloads.flatMap((p) => ['--require', p]);
    return spawnSync(process.execPath, [...args, script], {encoding: 'utf8', timeout});
}

test('without the guard a failed start idles without a server (the B-17 hang)', (t) => {
    const r = run([COMPAT], fakeNodeRed(t, 'fail'), 4000);
    assert.strictEqual(r.signal, 'SIGTERM', 'still running when the timeout killed it');
    assert.match(r.stdout, /Failed to start server:/);
});

test('with the guard a failed start is logged, then the process exits with 1', (t) => {
    const began = Date.now();
    const r = run([COMPAT, GUARD], fakeNodeRed(t, 'fail'));
    assert.strictEqual(r.status, 1, r.stderr);
    assert.match(r.stdout, /Failed to start server:\nError loading context store: EACCES/);
    assert.match(r.stderr, /\[redmatic\] Node-RED could not start its server/);
    assert.ok(Date.now() - began >= 1900, 'red.js is given time to log first');
});

test('with the guard a Node-RED that starts runs on untouched', (t) => {
    const r = run([COMPAT, GUARD], fakeNodeRed(t, 'ok'));
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /now-running/);
    assert.doesNotMatch(r.stderr, /\[redmatic\]/);
});

test('the guard watches node-red/red.js only, not another ./lib/red.js', (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-guard-other-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    fs.mkdirSync(path.join(dir, 'other', 'lib'), {recursive: true});
    fs.writeFileSync(path.join(dir, 'other', 'lib', 'red.js'), libRed('fail'));
    fs.writeFileSync(path.join(dir, 'other', 'red.js'), redJs);
    const r = run([GUARD], path.join(dir, 'other', 'red.js'), 4000);
    assert.strictEqual(r.signal, 'SIGTERM');
});

test('the loader preloads the guard and ends with 1 once it stops restarting', () => {
    const loader = fs.readFileSync(path.join(ADDON, 'bin', 'redmaticLoader'), 'utf8');
    assert.match(loader, /--require \$ADDON_DIR\/lib\/compat\.js --require \$ADDON_DIR\/lib\/start-guard\.js \$RED /);
    // the give-up branch sets failed=1, and the script's last command is exit $failed
    assert.match(loader, /status=0\n\s*failed=1\n/);
    assert.match(loader, /\nexit \$failed\n$/);
});

// a shell with pipefail, as on the systems (busybox ash, bash): dash has none, and there the
// pipeline's status is logger's (debmatic, which this does not change)
function pipefailShell() {
    for (const shell of [['busybox', 'sh'], ['bash']]) {
        const probe = spawnSync(shell[0], [...shell.slice(1), '-c', 'set -o pipefail'], {stdio: 'ignore'});
        if (!probe.error && probe.status === 0) {
            return shell;
        }
    }
    return null;
}

const shell = pipefailShell();

test('the loader exits 1 when Node-RED keeps failing, 0 when it ends cleanly', {skip: !shell && 'no busybox or bash'}, (t) => {
    // the loop of bin/redmaticLoader, from `status=1` to the end, with node and logger stubbed
    const loader = fs.readFileSync(path.join(ADDON, 'bin', 'redmaticLoader'), 'utf8');
    const loop = loader.slice(loader.indexOf('\nstatus=1\n'));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-loader-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    fs.mkdirSync(path.join(dir, 'etc'));
    fs.mkdirSync(path.join(dir, 'var'));
    fs.mkdirSync(path.join(dir, 'bin'));
    fs.writeFileSync(path.join(dir, 'bin', 'logger'), '#!/bin/sh\ncat >/dev/null\n', {mode: 0o755});
    for (const [code, limit, expected] of [
        [1, 0, 1],
        [1, 2, 1],
        [0, 0, 0]
    ]) {
        fs.writeFileSync(path.join(dir, 'etc', 'settings.json'), JSON.stringify({restartOnCrash: limit}));
        fs.writeFileSync(path.join(dir, 'var', 'runs'), '');
        const node = `#!/bin/sh\ncase "$1" in -e) exec ${JSON.stringify(process.execPath)} "$@";; esac\necho run >> ${dir}/var/runs\nexit ${code}\n`;
        fs.writeFileSync(path.join(dir, 'bin', 'node'), node, {mode: 0o755});
        const script = `ADDON_DIR=${dir}\nNODE=${dir}/bin/node\nPATH=${dir}/bin:$PATH\n${loop}`;
        const r = spawnSync(shell[0], [...shell.slice(1), '-c', script], {encoding: 'utf8', timeout: 10000});
        assert.strictEqual(r.status, expected, `node exit ${code}, restartOnCrash ${limit}: ${r.stderr}`);
        const runs = fs.readFileSync(path.join(dir, 'var', 'runs'), 'utf8').trim().split('\n').length;
        assert.strictEqual(runs, code ? limit + 1 : 1, 'runs');
    }
});
