'use strict';

// Task 14: bin/redmatic waits 30 s within the first 120 s after a reboot, because a CCU and OpenCCU start
// the addons with nothing to wait for. On openccu-lite (VARIANT=lite in /VERSION) the addon's unit is
// ordered by the firmware, so the pause is skipped there - and only there, whatever the init system.
//
// IsOpenccuLite and BootDelay are cut out of bin/redmatic and run in sh and, where busybox is
// installed, in busybox sh with busybox's grep. `sleep` and `logger` are stubs that record their calls.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'addon_files', 'redmatic', 'bin', 'redmatic');
const FUNCTIONS = ['IsOpenccuLite', 'BootDelay'];

// one function of bin/redmatic: from its `Name () {` line to the first line that is only `}`
function cut(source, name) {
    const lines = source.split('\n');
    const start = lines.indexOf(name + ' () {');
    assert.ok(start >= 0, `bin/redmatic has no function ${name}`);
    return lines.slice(start, lines.indexOf('}', start) + 1).join('\n');
}

const source = fs.readFileSync(SCRIPT, 'utf8');
const functions = FUNCTIONS.map(name => cut(source, name)).join('\n\n');

// the shells to run in: sh, and busybox sh with its applets first in PATH
function shells() {
    const list = [{name: 'sh', sh: 'sh', env: {PATH: process.env.PATH}}];
    const probe = spawnSync('busybox', ['true'], {stdio: 'ignore'});
    if (!probe.error && probe.status === 0) {
        const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-busybox-'));
        const busybox = spawnSync('sh', ['-c', 'command -v busybox'], {encoding: 'utf8'}).stdout.trim();
        for (const applet of ['sh', 'grep', 'cat', 'echo']) {
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
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-delay-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    return dir;
}

// BootDelay with the given /VERSION content (null: no file) and uptime
function bootDelay(shell, t, {version, uptime}) {
    const dir = scratch(t);
    const versionFile = path.join(dir, 'VERSION');
    const uptimeFile = path.join(dir, 'uptime');
    const calls = path.join(dir, 'calls.log');
    if (version !== null) {
        fs.writeFileSync(versionFile, version);
    }
    fs.writeFileSync(uptimeFile, uptime);
    const script = path.join(dir, 'delay.sh');
    fs.writeFileSync(script, [
        `VERSION_FILE=${versionFile}`,
        `UPTIME_FILE=${uptimeFile}`,
        `sleep () { echo "sleep $*" >> ${calls}; }`,
        // bin/redmatic logs with `logger -t redmatic -p <priority> <message>`
        `logger () { echo "logger $4 $5" >> ${calls}; }`,
        functions,
        'BootDelay',
        'echo "rc=$?"',
    ].join('\n') + '\n');
    const r = spawnSync(shell.sh, [script], {encoding: 'utf8', env: shell.env});
    assert.strictEqual(r.status, 0, `${shell.sh} exited ${r.status}: ${r.stderr}${r.error || ''}`);
    assert.match(r.stdout, /rc=0\n/);
    return {
        stdout: r.stdout,
        stderr: r.stderr,
        calls: fs.existsSync(calls) ? fs.readFileSync(calls, 'utf8').trim().split('\n') : [],
    };
}

const OPENCCU = 'VERSION=3.89.9.20260914\nPRODUCT=raspmatic_rpi4\nPLATFORM=rpi4\n';
const LITE = 'VERSION=3.89.9.20260914\nPRODUCT=raspmatic_rpi4\nPLATFORM=rpi4\nVARIANT=lite\nLITE=1.0.0-dev.4\n';
const CCU3 = 'VERSION=3.87.6\nPRODUCT=ccu3-ie\n';

for (const shell of shells()) {
    const opts = shell.skip ? {skip: shell.skip} : {};

    test(`${shell.name}: openccu-lite after a reboot - no pause, one log line`, opts, t => {
        const r = bootDelay(shell, t, {version: LITE, uptime: '42.17 80.03\n'});
        assert.deepStrictEqual(r.calls, ['logger daemon.info openccu-lite: the system orders the start, no boot delay']);
        assert.doesNotMatch(r.stdout, /waiting/);
    });

    test(`${shell.name}: OpenCCU after a reboot - the 30 s pause as before`, opts, t => {
        const r = bootDelay(shell, t, {version: OPENCCU, uptime: '42.17 80.03\n'});
        assert.deepStrictEqual(r.calls, [
            'logger daemon.info Starting Node-RED after reboot ... waiting 30 seconds...',
            'sleep 30',
        ]);
        assert.match(r.stdout, /Starting Node-RED \.\.\. waiting 30 seconds\.\.\.\n/);
    });

    test(`${shell.name}: a CCU3 after a reboot - the pause`, opts, t => {
        const r = bootDelay(shell, t, {version: CCU3, uptime: '10.00 12.00\n'});
        assert.deepStrictEqual(r.calls.slice(-1), ['sleep 30']);
    });

    test(`${shell.name}: no /VERSION - the pause`, opts, t => {
        const r = bootDelay(shell, t, {version: null, uptime: '10.00 12.00\n'});
        assert.deepStrictEqual(r.calls.slice(-1), ['sleep 30']);
        assert.strictEqual(r.stderr, '');
    });

    test(`${shell.name}: a VARIANT line that is not exactly lite - the pause`, opts, t => {
        const r = bootDelay(shell, t, {version: 'VERSION=3.89.9\nVARIANT=lite-ish\n#VARIANT=lite\n', uptime: '10.00 12.00\n'});
        assert.deepStrictEqual(r.calls.slice(-1), ['sleep 30']);
    });

    test(`${shell.name}: a manual start later (uptime >= 120 s) - no pause and no line, on both`, opts, t => {
        for (const version of [LITE, OPENCCU]) {
            const r = bootDelay(shell, t, {version, uptime: '120.00 300.00\n'});
            assert.deepStrictEqual(r.calls, []);
        }
    });

    test(`${shell.name}: an INVOCATION_ID alone does not skip the pause`, opts, t => {
        const withId = {...shell, env: {...shell.env, INVOCATION_ID: '0123456789abcdef0123456789abcdef'}};
        const r = bootDelay(withId, t, {version: OPENCCU, uptime: '30.00 40.00\n'});
        assert.deepStrictEqual(r.calls.slice(-1), ['sleep 30']);
    });
}

test('Start calls BootDelay while it holds the lock, before the second race check', () => {
    const start = cut(source, 'Start');
    const lock = start.indexOf('AcquireStartLock');
    const delay = start.indexOf('\n        BootDelay\n');
    const race = start.indexOf('already running after the boot delay');
    assert.ok(lock >= 0 && delay > lock && race > delay, 'AcquireStartLock, then BootDelay, then the race check');
    assert.doesNotMatch(start, /sleep 30/, 'the pause lives in BootDelay only');
});
