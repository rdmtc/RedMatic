'use strict';

// Bug 19: bin/redmatic's Stop returned 1 when Node-RED was not running, and `stop` exited 1 with it.
// On openccu-lite the rc script is the unit's ExecStop, so every stop or restart while Node-RED
// was down (crashed, between the loader's restarts, never started) left the unit failed. Stopping a
// stopped service is success; only a Node-RED that survives SIGKILL is a failure.
// Bug 3: with no Node-RED, Stop left a redmaticLoader (between two restarts) and a start waiting in
// its boot delay alone - the loader spawned Node-RED again after the stop, and a restart in the
// first 40 s after a boot ran into "a start is already in progress" and then "port in use".
//
// Stop and StopPendingStart are cut out of bin/redmatic and run in sh and, where busybox is
// installed, in busybox sh. RedmaticPid, RedmaticStarting, killall, kill, sleep and logger are
// stubs that record their calls. Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'addon_files', 'redmatic', 'bin', 'redmatic');
const FUNCTIONS = ['StopPendingStart', 'Stop'];

// one function of bin/redmatic: from its `Name () {` line to the first line that is only `}`
function cut(source, name) {
    const lines = source.split('\n');
    const start = lines.indexOf(name + ' () {');
    assert.ok(start >= 0, `bin/redmatic has no function ${name}`);
    return lines.slice(start, lines.indexOf('}', start) + 1).join('\n');
}

const source = fs.readFileSync(SCRIPT, 'utf8');
const functions = FUNCTIONS.map(name => cut(source, name)).join('\n\n');

test('bin/redmatic: stop exits 1 only when Stop fails', () => {
    assert.match(source, /\n {4}stop\)\n {8}Stop \|\| exit 1\n/);
});

// the shells to run in: sh, and busybox sh with its applets first in PATH
function shells() {
    const list = [{name: 'sh', sh: 'sh', env: {PATH: process.env.PATH}}];
    const probe = spawnSync('busybox', ['true'], {stdio: 'ignore'});
    if (!probe.error && probe.status === 0) {
        const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-busybox-'));
        const busybox = spawnSync('sh', ['-c', 'command -v busybox'], {encoding: 'utf8'}).stdout.trim();
        for (const applet of ['sh', 'cat', 'rm', 'echo']) {
            fs.symlinkSync(busybox, path.join(bin, applet));
        }
        process.on('exit', () => fs.rmSync(bin, {recursive: true, force: true}));
        list.push({name: 'busybox sh', sh: path.join(bin, 'sh'), env: {PATH: bin + ':' + process.env.PATH}});
    } else {
        list.push({name: 'busybox sh', skip: 'busybox is not installed'});
    }
    return list;
}

function scratch(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-stop-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    return dir;
}

// Stop with the given pretend processes:
//   nodeRed: the pid RedmaticPid prints ('' for none); loader: what RedmaticStarting prints;
//   survives: how many `kill -0 <nodeRed>` checks say "alive" (0: gone after SIGINT, 3: survives
//   even SIGKILL); lockPid: the pid in var/start.lock/pid (alive unless lockDead)
function stop(shell, t, {nodeRed = '', loader = '', survives = 0, lockPid = '', lockDead = false}) {
    const dir = scratch(t);
    const log = path.join(dir, 'calls.log');
    const lock = path.join(dir, 'var', 'start.lock');
    fs.mkdirSync(path.join(dir, 'var'));
    if (lockPid) {
        fs.mkdirSync(lock);
        fs.writeFileSync(path.join(lock, 'pid'), lockPid + '\n');
    }
    const script = path.join(dir, 'stop.sh');
    fs.writeFileSync(script, [
        `START_LOCK=${lock}`,
        `alive=${survives}`,
        `RedmaticPid () { echo "${nodeRed}"; }`,
        `RedmaticStarting () { echo "${loader}"; }`,
        `killall () { echo "killall $*" >> ${log}; }`,
        'sleep () { :; }',
        // bin/redmatic logs with `logger -t redmatic -p <priority> <message>`
        `logger () { echo "logger $4 $5" >> ${log}; }`,
        // kill -0 <pid>: Node-RED answers "alive" `alive` times, then it is gone; the lock's pid
        // is alive unless the test says it is dead
        'kill () {',
        '    if [ "$1" = "-0" ]; then',
        `        if [ "$2" = "${lockPid}" ]; then ${lockDead ? 'return 1' : 'return 0'}; fi`,
        '        if [ "$alive" -gt 0 ]; then alive=$((alive - 1)); return 0; fi',
        '        return 1',
        '    fi',
        `    echo "kill $*" >> ${log}`,
        '}',
        functions,
        'Stop',
        'echo "rc=$?"'
    ].join('\n'));
    const r = spawnSync(shell.sh, [script], {encoding: 'utf8', env: shell.env});
    assert.strictEqual(r.status, 0, r.stderr);
    const calls = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : [];
    return {out: r.stdout, rc: /rc=(\d+)/.exec(r.stdout)[1], calls, lockLeft: fs.existsSync(lock)};
}

for (const shell of shells()) {
    test(`${shell.name}: a stop with no Node-RED, no loader and no pending start is success`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {});
        assert.strictEqual(r.rc, '0');
        assert.match(r.out, /Node-RED not running/);
        assert.deepStrictEqual(r.calls, []);
    });

    test(`${shell.name}: a loader without Node-RED is ended, and the stop is success`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {loader: '4711'});
        assert.strictEqual(r.rc, '0');
        assert.ok(r.calls.includes('killall redmaticLoader'), r.calls.join('; '));
        assert.ok(r.calls.some(c => /daemon.info stopping a redmaticLoader/.test(c)), r.calls.join('; '));
    });

    test(`${shell.name}: a start waiting in its boot delay is ended and its lock removed`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {lockPid: '5150'});
        assert.strictEqual(r.rc, '0');
        assert.ok(r.calls.includes('kill 5150'), r.calls.join('; '));
        assert.ok(r.calls.some(c => /ending the start of pid 5150/.test(c)), r.calls.join('; '));
        assert.strictEqual(r.lockLeft, false);
    });

    test(`${shell.name}: a stale lock (its pid gone) is left to the next start's stale-lock handling`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {lockPid: '5150', lockDead: true});
        assert.strictEqual(r.rc, '0');
        assert.ok(!r.calls.includes('kill 5150'), r.calls.join('; '));
        assert.strictEqual(r.lockLeft, true);
    });

    test(`${shell.name}: Node-RED that ends on SIGINT - the loader is killed first, success`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {nodeRed: '2222', survives: 0});
        assert.strictEqual(r.rc, '0');
        assert.match(r.out, /Stopping Node-RED: OK/);
        assert.deepStrictEqual(r.calls.filter(c => !c.startsWith('logger')), ['killall redmaticLoader', 'kill -SIGINT 2222']);
        assert.ok(r.calls.includes('logger daemon.info Node-RED stopped'));
    });

    test(`${shell.name}: Node-RED that needs SIGKILL - still success once it is gone`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {nodeRed: '2222', survives: 2});
        assert.strictEqual(r.rc, '0');
        assert.ok(r.calls.includes('kill -SIGKILL 2222'), r.calls.join('; '));
        assert.match(r.out, /OK/);
    });

    test(`${shell.name}: Node-RED that survives SIGKILL is the one failure`, {skip: shell.skip}, t => {
        const r = stop(shell, t, {nodeRed: '2222', survives: 3});
        assert.strictEqual(r.rc, '1');
        assert.match(r.out, /FAILED/);
        assert.ok(r.calls.some(c => /daemon.error Node-RED \(pid 2222\) is still running after SIGKILL/.test(c)), r.calls.join('; '));
    });
}
