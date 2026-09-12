'use strict';

// Bug 10: bin/redmatic's start lock took every failed mkdir for a held lock. On a confined
// openccu-lite, where an update had left var/ root's, the unit's start as addon-redmatic said
// "another start holds the lock" about a permission error. Only an existing lock directory is held
// now; any other failure is named with the system's own reason, and a stale lock is still removed.
//
// The lock functions are cut out of bin/redmatic and run in sh (dash on Debian and Ubuntu) and,
// where busybox is installed, in busybox sh with busybox's own mkdir, rm and stat - what the box
// runs. Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'addon_files', 'redmatic', 'bin', 'redmatic');
const FUNCTIONS = ['AcquireStartLock', 'CreateStartLock', 'StartLockProblem', 'ReleaseStartLock'];

// one function of bin/redmatic: from its `Name () {` line to the first line that is only `}`
function cut(source, name) {
    const lines = source.split('\n');
    const start = lines.indexOf(name + ' () {');
    assert.ok(start >= 0, `bin/redmatic has no function ${name}`);
    return lines.slice(start, lines.indexOf('}', start) + 1).join('\n');
}

const source = fs.readFileSync(SCRIPT, 'utf8');
const functions = FUNCTIONS.map(name => cut(source, name)).join('\n\n');

const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
const user = os.userInfo().username;

function scratch(t) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-lock-'));
    fs.mkdirSync(path.join(dir, 'var'));
    t.after(() => {
        for (const d of [path.join(dir, 'var'), path.join(dir, 'var', 'start.lock')]) {
            try {
                fs.chmodSync(d, 0o755);
            } catch {}
        }
        fs.rmSync(dir, {recursive: true, force: true});
    });
    return dir;
}

// the shells to run in: sh, and busybox sh with its applets first in PATH
function shells() {
    const list = [{name: 'sh', sh: 'sh', env: {PATH: process.env.PATH}}];
    const probe = spawnSync('busybox', ['true'], {stdio: 'ignore'});
    if (!probe.error && probe.status === 0) {
        const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-busybox-'));
        const busybox = spawnSync('sh', ['-c', 'command -v busybox'], {encoding: 'utf8'}).stdout.trim();
        for (const applet of ['sh', 'mkdir', 'rm', 'cat', 'stat', 'id', 'sed', 'tr', 'head', 'awk', 'ls', 'echo']) {
            fs.symlinkSync(busybox, path.join(bin, applet));
        }
        process.on('exit', () => fs.rmSync(bin, {recursive: true, force: true}));
        list.push({name: 'busybox sh', sh: path.join(bin, 'sh'), env: {PATH: bin + ':' + process.env.PATH}});
    } else {
        list.push({name: 'busybox sh', skip: 'busybox is not installed'});
    }
    return list;
}

// AcquireStartLock in `shell` with the lock at <dir>/var/start.lock; `wrap` puts a command in front
function acquire(shell, dir, wrap = argv => argv) {
    const lock = path.join(dir, 'var', 'start.lock');
    const log = path.join(dir, 'logger.log');
    const script = path.join(dir, 'lock.sh');
    fs.writeFileSync(script, [
        `START_LOCK=${lock}`,
        // bin/redmatic logs with `logger -t redmatic -p <priority> <message>`
        `logger () { echo "$5" >> ${log}; }`,
        functions,
        'AcquireStartLock',
        'echo "rc=$?"',
        'echo "pid=$$"',
        'echo "error=$START_LOCK_ERROR"',
    ].join('\n') + '\n');
    const argv = wrap([shell.sh, script]);
    const r = spawnSync(argv[0], argv.slice(1), {encoding: 'utf8', env: shell.env});
    assert.strictEqual(r.status, 0, `${argv.join(' ')} exited ${r.status}: ${r.stderr}${r.error || ''}`);
    const out = {};
    for (const line of r.stdout.split('\n')) {
        const match = line.match(/^(rc|pid|error)=(.*)$/);
        if (match) {
            out[match[1]] = match[2];
        }
    }
    return {
        rc: Number(out.rc),
        pid: out.pid,
        error: out.error,
        lock,
        log: fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '',
        stderr: r.stderr,
    };
}

function lockPid(lock) {
    return fs.readFileSync(path.join(lock, 'pid'), 'utf8').trim();
}

// a pid that has just ended
function deadPid() {
    return spawnSync('sh', ['-c', 'echo $$'], {encoding: 'utf8'}).stdout.trim();
}

// whether this machine lets an unprivileged user mount a directory read-only in its own namespace
function readOnlyMountSkip() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-ro-'));
    try {
        const r = spawnSync('unshare', ['-rm', 'sh', '-c', 'mount --bind "$1" "$1" && mount -o remount,bind,ro "$1"', 'probe', dir], {encoding: 'utf8'});
        return r.error || r.status !== 0 ? `no read-only bind mount in a user namespace here (${r.error || r.stderr.trim()})` : false;
    } finally {
        fs.rmSync(dir, {recursive: true, force: true});
    }
}

const roSkip = readOnlyMountSkip();

for (const shell of shells()) {
    const opts = shell.skip ? {skip: shell.skip} : {};

    test(`${shell.name}: no lock - the start takes it`, opts, t => {
        const r = acquire(shell, scratch(t));
        assert.strictEqual(r.rc, 0, r.stderr);
        assert.strictEqual(r.error, '');
        assert.strictEqual(lockPid(r.lock), r.pid);
        assert.strictEqual(r.log, '');
    });

    test(`${shell.name}: a held lock is another start`, opts, t => {
        const dir = scratch(t);
        const lock = path.join(dir, 'var', 'start.lock');
        fs.mkdirSync(lock);
        fs.writeFileSync(path.join(lock, 'pid'), `${process.pid}\n`);
        const r = acquire(shell, dir);
        assert.strictEqual(r.rc, 1);
        assert.strictEqual(r.error, '', 'a held lock is no error');
        assert.strictEqual(lockPid(lock), String(process.pid), 'the holder keeps its lock');
        assert.strictEqual(r.log, '');
    });

    test(`${shell.name}: a stale lock of a pid that is gone is removed and taken`, opts, t => {
        const dir = scratch(t);
        const lock = path.join(dir, 'var', 'start.lock');
        const dead = deadPid();
        fs.mkdirSync(lock);
        fs.writeFileSync(path.join(lock, 'pid'), `${dead}\n`);
        const r = acquire(shell, dir);
        assert.strictEqual(r.rc, 0, r.stderr);
        assert.strictEqual(r.error, '');
        assert.strictEqual(lockPid(lock), r.pid);
        assert.match(r.log, new RegExp(`removing stale start lock of pid ${dead}\\n`));
    });

    test(`${shell.name}: a stale lock without a pid file is removed and taken`, opts, t => {
        const dir = scratch(t);
        fs.mkdirSync(path.join(dir, 'var', 'start.lock'));
        const r = acquire(shell, dir);
        assert.strictEqual(r.rc, 0, r.stderr);
        assert.strictEqual(r.error, '');
        assert.strictEqual(lockPid(r.lock), r.pid);
        assert.match(r.log, /removing stale start lock of pid unknown\n/);
    });

    test(`${shell.name}: var/ not writable - the permission problem is named, not another start`,
        shell.skip ? opts : {skip: isRoot && 'root may write anywhere'}, t => {
            const dir = scratch(t);
            fs.chmodSync(path.join(dir, 'var'), 0o555);
            const r = acquire(shell, dir);
            assert.strictEqual(r.rc, 1);
            assert.strictEqual(r.error, `cannot create ${r.lock}: permission denied (owner ${user}, running as ${user})`);
            assert.strictEqual(r.log, '', 'no stale lock was there, so none is removed');
            assert.ok(!fs.existsSync(r.lock));
        });

    test(`${shell.name}: a stale lock that cannot be removed - the permission problem is named`,
        shell.skip ? opts : {skip: isRoot && 'root may write anywhere'}, t => {
            const dir = scratch(t);
            fs.mkdirSync(path.join(dir, 'var', 'start.lock'));
            fs.chmodSync(path.join(dir, 'var'), 0o555);
            const r = acquire(shell, dir);
            assert.strictEqual(r.rc, 1);
            assert.strictEqual(r.error, `cannot remove the stale ${r.lock}: permission denied (owner ${user}, running as ${user})`);
            assert.match(r.log, /removing stale start lock of pid unknown\n/);
        });

    test(`${shell.name}: a read-only filesystem is named`, shell.skip ? opts : {skip: roSkip}, t => {
        const dir = scratch(t);
        const varDir = path.join(dir, 'var');
        // var/ read-only in a mount namespace of its own; the lock script and its log stay writable
        const r = acquire(shell, dir, argv => [
            'unshare', '-rm', 'sh', '-c', 'mount --bind "$1" "$1" && mount -o remount,bind,ro "$1" && shift && exec "$@"',
            'ro', varDir, ...argv,
        ]);
        assert.strictEqual(r.rc, 1);
        // inside the user namespace the owner and the caller both map to root
        assert.match(r.error, new RegExp(`^cannot create ${r.lock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: read-only file system \\(owner \\S+, running as \\S+\\)$`));
        assert.strictEqual(r.log, '');
    });
}

test('bin/redmatic reports the lock problem instead of another start', () => {
    assert.match(source, /if \[ -n "\$START_LOCK_ERROR" \]; then\n\s+echo "Node-RED cannot start: \$START_LOCK_ERROR"\n\s+logger -t redmatic -p daemon\.error "cant start - \$START_LOCK_ERROR"/);
});
