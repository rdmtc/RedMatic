'use strict';

// Bug 11: the start read /etc/config/rdmtc.uuid, the installation id the telemetry sends. On openccu-lite
// the addon runs confined, as addon-redmatic, and the id root wrote there (0600) put "Permission denied"
// into the log at every start. There the id lives in the addon's var/ now, taken over once from
// /etc/config where that copy is readable; a CCU and OpenCCU keep /etc/config.
//
// IsOpenccuLite and TelemetryIdFile are cut out of bin/redmatic and run in sh and, where busybox is
// installed, in busybox sh with busybox's applets. Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'addon_files', 'redmatic', 'bin', 'redmatic');

// one function of bin/redmatic: from its `Name () {` line to the first line that is only `}`
function cut(source, name) {
    const lines = source.split('\n');
    const start = lines.indexOf(name + ' () {');
    assert.ok(start >= 0, `bin/redmatic has no function ${name}`);
    return lines.slice(start, lines.indexOf('}', start) + 1).join('\n');
}

const source = fs.readFileSync(SCRIPT, 'utf8');
const functions = ['IsOpenccuLite', 'TelemetryIdFile'].map(name => cut(source, name)).join('\n\n');

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

// root reads a 0600 file of anyone: the unreadable case needs another user
const isRoot = process.getuid && process.getuid() === 0;

const LITE = 'VERSION=3.89.11\nPRODUCT=rpi4\nPLATFORM=rpi4\nVARIANT=lite\nLITE=1.0.0-dev.30\n';
const OPENCCU = 'VERSION=3.89.11\nPRODUCT=rpi4\nPLATFORM=rpi4\n';
const OLD_ID = '0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0\n';
const NEW_ID = '11111111-2222-4333-8444-555555555555\n';
const KERNEL_ID = '99999999-8888-4777-8666-555555555555\n';

// a pretend system: /VERSION, /etc/config, the addon's var/, uuidgen and the kernel's uuid
function system(t, {version, ccuId = null, ccuIdMode = 0o644, configWritable = true, liteId = null, uuidgen = true}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-telemetry-'));
    t.after(() => {
        for (const sub of ['config', 'var']) {
            fs.chmodSync(path.join(dir, sub), 0o755);
        }
        fs.rmSync(dir, {recursive: true, force: true});
    });
    const sys = {
        dir,
        version: path.join(dir, 'VERSION'),
        config: path.join(dir, 'config'),
        ccuId: path.join(dir, 'config', 'rdmtc.uuid'),
        liteId: path.join(dir, 'var', 'rdmtc.uuid'),
        uuidgen: path.join(dir, 'uuidgen'),
        kernel: path.join(dir, 'kernel-uuid'),
    };
    fs.writeFileSync(sys.version, version);
    fs.mkdirSync(sys.config);
    fs.mkdirSync(path.join(dir, 'var'));
    if (ccuId !== null) {
        fs.writeFileSync(sys.ccuId, ccuId, {mode: ccuIdMode});
        fs.chmodSync(sys.ccuId, ccuIdMode);
    }
    if (!configWritable) {
        fs.chmodSync(sys.config, 0o555);
    }
    if (liteId !== null) {
        fs.writeFileSync(sys.liteId, liteId);
    }
    if (uuidgen) {
        fs.writeFileSync(sys.uuidgen, `#!/bin/sh\nprintf '${NEW_ID.trim()}\\n'\n`, {mode: 0o755});
    }
    fs.writeFileSync(sys.kernel, KERNEL_ID);
    return sys;
}

function telemetryIdFile(shell, sys) {
    const script = path.join(sys.dir, 'id.sh');
    fs.writeFileSync(script, [
        `VERSION_FILE=${sys.version}`,
        `OCCULITED=${path.join(sys.dir, 'no-occulited')}`,
        `CCU_ID_FILE=${sys.ccuId}`,
        `LITE_ID_FILE=${sys.liteId}`,
        `UUIDGEN=${sys.uuidgen}`,
        `KERNEL_UUID=${sys.kernel}`,
        functions,
        'TelemetryIdFile',
        'echo "rc=$?"',
    ].join('\n') + '\n');
    const r = spawnSync(shell.sh, [script], {encoding: 'utf8', env: shell.env});
    assert.strictEqual(r.status, 0, `${shell.sh} exited ${r.status}: ${r.stderr}${r.error || ''}`);
    const lines = r.stdout.trim().split('\n');
    return {file: lines.length > 1 ? lines[0] : '', stderr: r.stderr};
}

const read = file => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);

for (const shell of shells()) {
    const opts = shell.skip ? {skip: shell.skip} : {};

    test(`${shell.name}: openccu-lite takes a readable id from /etc/config over into var/ once`, opts, t => {
        const sys = system(t, {version: LITE, ccuId: OLD_ID});
        const r = telemetryIdFile(shell, sys);
        assert.strictEqual(r.file, sys.liteId);
        assert.strictEqual(read(sys.liteId), OLD_ID);
        assert.strictEqual(read(sys.ccuId), OLD_ID, '/etc/config is left alone');
        assert.strictEqual(r.stderr, '');
        // the next start keeps var/'s id, whatever /etc/config holds then
        fs.writeFileSync(sys.ccuId, NEW_ID);
        assert.strictEqual(telemetryIdFile(shell, sys).file, sys.liteId);
        assert.strictEqual(read(sys.liteId), OLD_ID);
    });

    test(`${shell.name}: openccu-lite with root's 0600 id - a new id in var/, no Permission denied`, {...opts, skip: opts.skip || (isRoot && 'runs as root, which reads any file')}, t => {
        const sys = system(t, {version: LITE, ccuId: OLD_ID, ccuIdMode: 0o000, configWritable: false});
        const r = telemetryIdFile(shell, sys);
        assert.strictEqual(r.stderr, '');
        assert.strictEqual(r.file, sys.liteId);
        assert.strictEqual(read(sys.liteId), NEW_ID);
    });

    test(`${shell.name}: openccu-lite without any id - uuidgen's into var/, /etc/config untouched`, opts, t => {
        const sys = system(t, {version: LITE});
        const r = telemetryIdFile(shell, sys);
        assert.strictEqual(r.file, sys.liteId);
        assert.strictEqual(read(sys.liteId), NEW_ID);
        assert.strictEqual(read(sys.ccuId), null);
    });

    test(`${shell.name}: openccu-lite without uuidgen - the kernel's uuid`, opts, t => {
        const sys = system(t, {version: LITE, uuidgen: false});
        assert.strictEqual(telemetryIdFile(shell, sys).file, sys.liteId);
        assert.strictEqual(read(sys.liteId), KERNEL_ID);
    });

    test(`${shell.name}: openccu-lite keeps an id var/ already has`, opts, t => {
        const sys = system(t, {version: LITE, ccuId: OLD_ID, liteId: NEW_ID});
        assert.strictEqual(telemetryIdFile(shell, sys).file, sys.liteId);
        assert.strictEqual(read(sys.liteId), NEW_ID);
    });

    test(`${shell.name}: openccu-lite with var/ not writable - no id, no telemetry, nothing on stderr`, {...opts, skip: opts.skip || (isRoot && 'runs as root, which writes anywhere')}, t => {
        const sys = system(t, {version: LITE});
        fs.chmodSync(path.join(sys.dir, 'var'), 0o555);
        const r = telemetryIdFile(shell, sys);
        assert.strictEqual(r.file, '');
        assert.strictEqual(r.stderr, '');
    });

    test(`${shell.name}: OpenCCU creates the id in /etc/config as before, var/ untouched`, opts, t => {
        const sys = system(t, {version: OPENCCU});
        const r = telemetryIdFile(shell, sys);
        assert.strictEqual(r.file, sys.ccuId);
        assert.strictEqual(read(sys.ccuId), NEW_ID);
        assert.strictEqual(read(sys.liteId), null);
    });

    test(`${shell.name}: OpenCCU keeps its id in /etc/config`, opts, t => {
        const sys = system(t, {version: OPENCCU, ccuId: OLD_ID});
        assert.strictEqual(telemetryIdFile(shell, sys).file, sys.ccuId);
        assert.strictEqual(read(sys.ccuId), OLD_ID);
        assert.strictEqual(read(sys.liteId), null);
    });

    test(`${shell.name}: a CCU whose /etc/config is not writable and has no id - no telemetry`, {...opts, skip: opts.skip || (isRoot && 'runs as root, which writes anywhere')}, t => {
        const sys = system(t, {version: OPENCCU, configWritable: false});
        const r = telemetryIdFile(shell, sys);
        assert.strictEqual(r.file, '');
        assert.strictEqual(r.stderr, '');
    });
}

test('Start sends the id TelemetryIdFile names, and reads /etc/config nowhere else', () => {
    const start = cut(source, 'Start');
    assert.match(start, /TELEMETRY_ID=`TelemetryIdFile`/);
    assert.doesNotMatch(start, /rdmtc\.uuid/);
});
