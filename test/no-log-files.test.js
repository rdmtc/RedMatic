'use strict';

// Task 13: openccu-lite logs to the journal only. npm writes a debug log into its cache's _logs/ for
// every run (ten kept), on the userfs. On openccu-lite bin/redmatic's start exports
// npm_config_logs_max=0, which Node-RED and every npm it starts inherit, and removes the files of
// earlier runs and an old matter-install.log. A CCU and OpenCCU keep npm's default.
//
// IsOpenccuLite and NoLogFiles are cut out of bin/redmatic and run in sh and, where busybox is
// installed, in busybox sh. home/.profile is sourced the same way. Run with `node --test test/`.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const ADDON = path.join(__dirname, '..', 'addon_files', 'redmatic');
const source = fs.readFileSync(path.join(ADDON, 'bin', 'redmatic'), 'utf8');

function cut(name) {
    const lines = source.split('\n');
    const start = lines.indexOf(name + ' () {');
    assert.ok(start >= 0, `bin/redmatic has no function ${name}`);
    return lines.slice(start, lines.indexOf('}', start) + 1).join('\n');
}

const functions = ['IsOpenccuLite', 'NoLogFiles'].map(cut).join('\n\n');

function shells() {
    const list = [{name: 'sh', sh: 'sh', env: {PATH: process.env.PATH}}];
    const probe = spawnSync('busybox', ['true'], {stdio: 'ignore'});
    if (!probe.error && probe.status === 0) {
        const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-busybox-'));
        const busybox = spawnSync('sh', ['-c', 'command -v busybox'], {encoding: 'utf8'}).stdout.trim();
        for (const applet of ['sh', 'grep', 'rm', 'echo']) {
            fs.symlinkSync(busybox, path.join(bin, applet));
        }
        process.on('exit', () => fs.rmSync(bin, {recursive: true, force: true}));
        list.push({name: 'busybox sh', sh: path.join(bin, 'sh'), env: {PATH: bin + ':' + process.env.PATH}});
    } else {
        list.push({name: 'busybox sh', skip: 'busybox is not installed'});
    }
    return list;
}

const LITE = 'VERSION=3.89.11\nPRODUCT=rpi4\nPLATFORM=rpi4\nVARIANT=lite\nLITE=1.0.0-dev.30\n';
const OPENCCU = 'VERSION=3.89.11\nPRODUCT=rpi4\nPLATFORM=rpi4\n';

// a pretend addon directory with npm logs of earlier runs and an old matter-install.log
function system(t, version) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-logs-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    const logs = path.join(dir, 'var', 'npm-cache', '_logs');
    fs.mkdirSync(logs, {recursive: true});
    fs.mkdirSync(path.join(dir, 'tmp'));
    const files = {
        debug: path.join(logs, '2026-09-11T13_38_25_551Z-debug-0.log'),
        debug2: path.join(logs, '2026-09-12T08_00_00_000Z-debug-0.log'),
        other: path.join(logs, 'keep.txt'),
        matter: path.join(dir, 'tmp', 'matter-install.log'),
        flows: path.join(dir, 'var', 'flows.json'),
    };
    for (const file of Object.values(files)) {
        fs.writeFileSync(file, 'x\n');
    }
    fs.writeFileSync(path.join(dir, 'VERSION'), version);
    return {dir, logs, files};
}

function run(shell, sys) {
    const script = path.join(sys.dir, 'logs.sh');
    fs.writeFileSync(script, [
        `VERSION_FILE=${path.join(sys.dir, 'VERSION')}`,
        `OCCULITED=${path.join(sys.dir, 'no-occulited')}`,
        `NPM_LOG_DIR=${sys.logs}`,
        `MATTER_INSTALL_LOG=${sys.files.matter}`,
        functions,
        'NoLogFiles',
        'echo "rc=$?"',
        // what a child (the loader, Node-RED, npm) inherits
        'sh -c \'echo "logs_max=${npm_config_logs_max-unset}"\'',
    ].join('\n') + '\n');
    const env = {...shell.env};
    const r = spawnSync(shell.sh, [script], {encoding: 'utf8', env});
    assert.strictEqual(r.status, 0, `${shell.sh} exited ${r.status}: ${r.stderr}`);
    assert.strictEqual(r.stderr, '');
    assert.match(r.stdout, /rc=0\n/);
    return r.stdout.match(/logs_max=(.*)\n/)[1];
}

for (const shell of shells()) {
    const opts = shell.skip ? {skip: shell.skip} : {};

    test(`${shell.name}: openccu-lite - npm logs-max 0 for the children, old logs removed`, opts, t => {
        const sys = system(t, LITE);
        assert.strictEqual(run(shell, sys), '0');
        assert.ok(!fs.existsSync(sys.files.debug));
        assert.ok(!fs.existsSync(sys.files.debug2));
        assert.ok(!fs.existsSync(sys.files.matter));
        assert.ok(fs.existsSync(sys.files.other), 'only *.log in _logs/ goes');
        assert.ok(fs.existsSync(sys.files.flows), 'nothing else is touched');
    });

    test(`${shell.name}: openccu-lite with nothing to remove - no error`, opts, t => {
        const sys = system(t, LITE);
        fs.rmSync(sys.logs, {recursive: true});
        fs.rmSync(sys.files.matter);
        assert.strictEqual(run(shell, sys), '0');
    });

    test(`${shell.name}: OpenCCU - npm's default, the logs stay`, opts, t => {
        const sys = system(t, OPENCCU);
        assert.strictEqual(run(shell, sys), 'unset');
        assert.ok(fs.existsSync(sys.files.debug));
        assert.ok(fs.existsSync(sys.files.matter));
    });
}

test('Start calls NoLogFiles before it starts the loader', () => {
    const start = cut('Start');
    const call = start.indexOf('\n    NoLogFiles\n');
    const loader = start.indexOf('redmaticLoader');
    assert.ok(call >= 0 && loader > call, 'NoLogFiles, then the loader');
});

// home/.profile: the shell a user opens for npm (the palette recipe) gets the same setting
for (const [name, version, expected] of [['openccu-lite', LITE, '0'], ['OpenCCU', OPENCCU, 'unset']]) {
    test(`home/.profile on ${name}: npm_config_logs_max ${expected}`, t => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-profile-'));
        t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
        fs.writeFileSync(path.join(dir, 'VERSION'), version);
        const profile = fs.readFileSync(path.join(ADDON, 'home', '.profile'), 'utf8')
            .replaceAll('/VERSION', path.join(dir, 'VERSION'))
            .replaceAll('/usr/bin/occulited', path.join(dir, 'no-occulited'));
        fs.writeFileSync(path.join(dir, 'profile'), profile);
        const r = spawnSync('sh', ['-c', `. ${path.join(dir, 'profile')}; echo "logs_max=\${npm_config_logs_max-unset}"`], {encoding: 'utf8', env: {PATH: process.env.PATH}});
        assert.strictEqual(r.status, 0, r.stderr);
        assert.match(r.stdout, new RegExp(`logs_max=${expected}\\n`));
    });
}
