'use strict';

// Bug 22: the settings page judged start/stop/restart by the text service.cgi passed on from
// rc.d/redmatic ("Starting Node-RED: OK"). On openccu-lite rc.d/redmatic is the addon-rc wrapper,
// which hands the command to `systemctl <cmd> addon-redmatic.service` (or occulited's addonctl
// call) - that prints nothing, so every restart showed "Ein Fehler ist aufgetreten" although
// Node-RED came back. service.cgi now answers with the exit status first ("ok" / "error: ...")
// and script.js decides on that, with the old text match left for an answer without it.
//
// service.cgi runs in a real tclsh. A driver points its rc.d/redmatic at a stub of the test and
// stands in for lib/session.tcl's session check. The page's decision is serviceResult, cut out of
// www/js/script.js. Run with `node --test test/` (npm run test:unit). Needs tclsh; CI installs
// tcl, and there a missing tclsh fails the tests instead of skipping them.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const WWW = path.join(__dirname, '..', 'addon_files', 'redmatic', 'www');

const tclsh = spawnSync('tclsh', [], {input: 'exit 0', stdio: ['pipe', 'ignore', 'ignore']});
const noTclsh = tclsh.error || tclsh.status !== 0;
const skip = noTclsh && !process.env.CI ? 'tclsh is not installed' : false;

const DRIVER = String.raw`
array set ::serviceTest [list rc [lindex $argv 0] session [lindex $argv 1]]

# rc.d/redmatic is the test's stub
rename exec _exec
proc exec args {
    if {[lindex $args 0] eq "/usr/local/etc/config/rc.d/redmatic"} {
        set args [lreplace $args 0 0 $::serviceTest(rc)]
    }
    uplevel 1 [list _exec {*}$args]
}

# lib/session.tcl's check: the test says whether the session is live
rename source _source
proc source {file args} {
    if {[file tail $file] eq "session.tcl"} {
        proc request_session_ok {} {return $::serviceTest(session)}
        return
    }
    uplevel 1 [list _source $file {*}$args]
}

_source ./service.cgi
`;

const TEXT = 'Content-Type: text/plain; charset=utf-8\r\n\r\n';

function service(t, cmd, rc, {session = 1} = {}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-service-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    fs.writeFileSync(path.join(dir, 'driver.tcl'), DRIVER);
    const stub = path.join(dir, 'redmatic');
    fs.writeFileSync(stub, '#!/bin/sh\n' + rc + '\n', {mode: 0o755});
    const r = spawnSync('tclsh', [path.join(dir, 'driver.tcl'), stub, String(session)], {
        cwd: WWW,
        env: {PATH: process.env.PATH, QUERY_STRING: `sid=@AbC123dEf4@&cmd=${cmd}`, REQUEST_METHOD: 'GET'},
        encoding: 'utf8'
    });
    assert.ok(r.stdout.startsWith(TEXT), r.stdout + r.stderr);
    return {code: r.status, body: r.stdout.slice(TEXT.length), stderr: r.stderr};
}

// serviceResult of www/js/script.js: from its `function serviceResult(` line to the closing brace
// at its own indentation
function serviceResult() {
    const lines = fs.readFileSync(path.join(WWW, 'js', 'script.js'), 'utf8').split('\n');
    const start = lines.findIndex(l => l.trim().startsWith('function serviceResult('));
    assert.ok(start >= 0, 'script.js has no serviceResult');
    const indent = lines[start].match(/^\s*/)[0];
    const end = lines.indexOf(indent + '}', start);
    const source = lines.slice(start, end + 1).join('\n');
    return new Function('$', source + '\nreturn serviceResult;')({trim: s => String(s).trim()});
}

test('openccu-lite: systemctl prints nothing and exits 0 - the answer is ok', {skip}, t => {
    const r = service(t, 'restart', 'exit 0');
    assert.strictEqual(r.body, 'ok\n', r.stderr);
    assert.strictEqual(r.code, 0);
});

test('a classic CCU: the script\'s output follows the status line', {skip}, t => {
    const r = service(t, 'start', 'echo "Starting Node-RED: OK"');
    assert.strictEqual(r.body, 'ok\nStarting Node-RED: OK\n', r.stderr);
});

test('a non-zero exit is an error with its code, the output still there', {skip}, t => {
    const r = service(t, 'start', 'echo "Node-RED already running"; exit 1');
    assert.match(r.body, /^error: exit 1\nNode-RED already running/, r.stderr);
});

test('systemctl failing with its message on stderr is an error', {skip}, t => {
    const r = service(t, 'restart', 'echo "Job for addon-redmatic.service failed." >&2; exit 1');
    assert.match(r.body, /^error: exit 1\nJob for addon-redmatic.service failed\./, r.stderr);
});

test('exit 0 with something on stderr is ok, not the error Tcl\'s exec makes of it', {skip}, t => {
    const r = service(t, 'stop', 'echo "Stopping Node-RED: OK"; echo "monit: not monitored" >&2; exit 0');
    assert.match(r.body, /^ok\nStopping Node-RED: OK/, r.stderr);
});

test('a script killed by a signal is an error', {skip}, t => {
    const r = service(t, 'stop', 'kill -9 $$');
    assert.match(r.body, /^error: killed by SIGKILL/, r.stderr);
});

test('without a live session nothing runs', {skip}, t => {
    const r = service(t, 'restart', 'echo ran', {session: 0});
    assert.strictEqual(r.body, 'error: invalid session\n');
    assert.strictEqual(r.code, 1);
});

test('the page: the status line decides', () => {
    const result = serviceResult();
    const started = /Starting Node-RED: OK/;
    assert.strictEqual(result('ok\n', started), 'ok');
    assert.strictEqual(result('ok\nStarting Node-RED: OK\n', started), 'ok');
    assert.strictEqual(result('ok\nNode-RED not running\n', /Stopping Node-RED: OK/), 'ok');
    assert.strictEqual(result('error: exit 1\nStarting Node-RED: OK\n', started), 'error');
    assert.strictEqual(result('error: killed by SIGKILL\n', started), 'error');
    assert.strictEqual(result('error: invalid session\n', started), 'session');
});

test('the page: an answer without the status line is judged by the script\'s text', () => {
    const result = serviceResult();
    assert.strictEqual(result('Stopping Node-RED: OK\nStarting Node-RED: OK\n', /Starting Node-RED: OK/), 'ok');
    assert.strictEqual(result('Stopping Node-RED: OK\n', /Stopping Node-RED: OK/), 'ok');
    assert.strictEqual(result('Node-RED already running\n', /Starting Node-RED: OK/), 'error');
    assert.strictEqual(result('', /Starting Node-RED: OK/), 'error');
    assert.strictEqual(result(undefined, /Starting Node-RED: OK/), 'error');
});
