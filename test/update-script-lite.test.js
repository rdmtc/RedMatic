'use strict';

// Bug 16: update_script started Node-RED itself on openccu-lite when the addon's unit was not
// loaded (LoadState=not-found after occulited's generator had dropped the unit of a disabled
// addon): the old lite_unit() test was false, the CCU branch ran `rc.d/redmatic start`, and
// Node-RED ran as root in the installer's scope, outside its unit and confinement. occulited
// starts the unit itself once the installer is through, so on openccu-lite nothing is started
// here, whatever the unit's state; the stop goes to the unit when it is loaded and to the rc
// script otherwise.
//
// The functions are cut out of update_script and run in sh and, where busybox is installed, in
// busybox sh, with a stub systemctl and a stub rc.d/redmatic that record their calls.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'addon_files', 'update_script');
const FUNCTIONS = ['is_lite', 'unit_loaded', 'stop_before_update', 'start_after_update'];

// one function of update_script: from its `name() {` line to the first line that is only `}`
function cut(source, name) {
    const lines = source.split('\n');
    const start = lines.indexOf(name + '() {');
    assert.ok(start >= 0, `update_script has no function ${name}`);
    return lines.slice(start, lines.indexOf('}', start) + 1).join('\n');
}

const source = fs.readFileSync(SCRIPT, 'utf8');
const functions = FUNCTIONS.map(name => cut(source, name)).join('\n\n');

test('update_script stops and starts through the two functions only', () => {
    assert.match(source, /\n {4}stop_before_update\n/);
    assert.match(source, /\n {4}start_after_update\n/);
    let code = source;
    for (const name of FUNCTIONS) {
        code = code.replace(cut(source, name), '');
    }
    code = code.split('\n').filter(line => !/^\s*#/.test(line)).join('\n');
    assert.doesNotMatch(code, /rc\.d\/redmatic (start|stop)|systemctl (start|stop)/);
});

// the shells to run in: sh, and busybox sh with its applets first in PATH
function shells() {
    const list = [{name: 'sh', sh: 'sh', env: {PATH: process.env.PATH}}];
    const probe = spawnSync('busybox', ['true'], {stdio: 'ignore'});
    if (!probe.error && probe.status === 0) {
        const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-busybox-'));
        const busybox = spawnSync('sh', ['-c', 'command -v busybox'], {encoding: 'utf8'}).stdout.trim();
        for (const applet of ['sh', 'grep', 'echo', 'cat']) {
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
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-update-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    return dir;
}

// runs `call` (stop_before_update or start_after_update) on a pretend system:
//   lite: a LITE= line in /VERSION; loadState: what systemctl answers (null: no systemctl at all)
function run(shell, t, call, {lite, loadState}) {
    const dir = scratch(t);
    const log = path.join(dir, 'calls.log');
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(bin);
    fs.mkdirSync(path.join(dir, 'rc.d'));
    fs.writeFileSync(path.join(dir, 'VERSION'), lite ? 'VERSION=3.89.11\nLITE=1.1.0\n' : 'VERSION=3.89.11\n');
    fs.writeFileSync(path.join(dir, 'rc.d', 'redmatic'), `#!/bin/sh\necho "rc.d/redmatic $*" >> ${log}\n`, {mode: 0o755});
    if (loadState !== null) {
        fs.writeFileSync(path.join(bin, 'systemctl'), [
            '#!/bin/sh',
            `case "$1" in show) echo "LoadState=${loadState}";; *) echo "systemctl $*" >> ${log};; esac`
        ].join('\n'), {mode: 0o755});
    }
    const script = path.join(dir, 'run.sh');
    fs.writeFileSync(script, [
        `CONF_DIR=${dir}`,
        'LITE_UNIT=addon-redmatic.service',
        `VERSION_FILE=${dir}/VERSION`,
        `OCCULITED=${dir}/no-occulited`,
        functions,
        call,
        'echo "rc=$?"'
    ].join('\n'));
    // PATH: the stub bin first, then the shell's own applets; without a systemctl stub the real one
    // (if the host has it) must not be found, so a minimal PATH for the null case
    const env = Object.assign({}, shell.env, {
        PATH: loadState === null ? bin + ':' + (shell.env.PATH.split(':').find(p => /busybox/.test(p)) || '/bin:/usr/bin') : bin + ':' + shell.env.PATH
    });
    if (loadState === null) {
        // hide a host systemctl: the stub dir gets a `systemctl` that is not executable
        fs.writeFileSync(path.join(bin, 'systemctl'), '', {mode: 0o644});
    }
    const r = spawnSync(shell.sh, [script], {encoding: 'utf8', env});
    assert.strictEqual(r.status, 0, r.stderr);
    const calls = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean) : [];
    return {out: r.stdout, calls};
}

for (const shell of shells()) {
    test(`${shell.name}: openccu-lite, unit loaded - the stop goes to the unit, nothing is started here`, {skip: shell.skip}, t => {
        assert.deepStrictEqual(run(shell, t, 'stop_before_update', {lite: true, loadState: 'loaded'}).calls, ['systemctl stop addon-redmatic.service']);
        const start = run(shell, t, 'start_after_update', {lite: true, loadState: 'loaded'});
        assert.deepStrictEqual(start.calls, []);
        assert.match(start.out, /the system starts the addon's unit/);
    });

    test(`${shell.name}: openccu-lite, unit not found (bug 16) - the rc script stops a stale daemon, nothing is started here`, {skip: shell.skip}, t => {
        assert.deepStrictEqual(run(shell, t, 'stop_before_update', {lite: true, loadState: 'not-found'}).calls, ['rc.d/redmatic stop']);
        assert.deepStrictEqual(run(shell, t, 'start_after_update', {lite: true, loadState: 'not-found'}).calls, []);
    });

    test(`${shell.name}: a CCU or OpenCCU (no LITE marker) - stop and start through the rc script, as before`, {skip: shell.skip}, t => {
        assert.deepStrictEqual(run(shell, t, 'stop_before_update', {lite: false, loadState: 'loaded'}).calls, ['rc.d/redmatic stop']);
        assert.deepStrictEqual(run(shell, t, 'start_after_update', {lite: false, loadState: 'loaded'}).calls, ['rc.d/redmatic start']);
        assert.deepStrictEqual(run(shell, t, 'start_after_update', {lite: false, loadState: null}).calls, ['rc.d/redmatic start']);
    });
}
