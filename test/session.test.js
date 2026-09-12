'use strict';

// openccu-lite B-94, D-65, D-67: the settings CGIs take the session from the gate's
// X-Occulite-Session header (HTTP_X_OCCULITE_SESSION) first, checked with GET /api/auth/v1/state
// the way lib/ccu-auth.js does; ?sid=@...@ and the ReGa check stay. With this occulited can stop
// putting ?sid= into the addresses of catalogue addons.
//
// The CGIs run in a real tclsh. A driver stands in for tclrega.so (the one script it answers),
// points the box's /state at a fake server here, reads /usr/local/addons/redmatic from a scratch
// directory, and points the openccu-lite markers (/VERSION, /usr/bin/occulited) at files of the test.
// Run with `node --test test/` (npm run test:unit). Needs tclsh; CI installs tcl, and there a
// missing tclsh fails the tests instead of skipping them.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {spawn, spawnSync} = require('node:child_process');

const WWW = path.join(__dirname, '..', 'addon_files', 'redmatic', 'www');

const tclsh = spawnSync('tclsh', [], {input: 'exit 0', stdio: ['pipe', 'ignore', 'ignore']});
const noTclsh = tclsh.error || tclsh.status !== 0;
const skip = noTclsh && !process.env.CI ? 'tclsh is not installed' : false;

test('tclsh is there (CI)', {skip: !process.env.CI && 'only required in CI'}, () => {
    assert.ok(!noTclsh, 'tclsh is required for the CGI tests');
});

const DRIVER = String.raw`
array set ::redmaticTest [list cgi [lindex $argv 0] addon [lindex $argv 1] state [lindex $argv 2] version [lindex $argv 3] occulited [lindex $argv 4] rega [lindex $argv 5]]

# tclrega.so is not here
rename load _load
proc load {file args} {
    if {$file eq "tclrega.so"} {
        return
    }
    uplevel 1 [list _load $file {*}$args]
}

# the one script tclrega answers (ReGa on a CCU, the shim on openccu-lite): the user of a live session
proc rega_script script {
    if {[regexp {^Write\(system\.GetSessionVarStr\('@?([A-Za-z0-9]{10})@?'\)\);$} $script all sid] && [lsearch -exact $::redmaticTest(rega) $sid] >= 0} {
        return [list 0 Admin]
    }
    return [list 0 {}]
}

rename open _open
proc open {name args} {
    regsub {^/usr/local/addons/redmatic/} $name "$::redmaticTest(addon)/" name
    uplevel 1 [list _open $name {*}$args]
}

# after lib/session.tcl: the fake box, and the markers read from the test's files
rename source _source
proc source {file args} {
    uplevel 1 [list _source $file {*}$args]
    if {[file tail $file] eq "session.tcl"} {
        proc occulite_state_url {} [list return $::redmaticTest(state)]
        rename is_openccu_lite _is_openccu_lite
        proc is_openccu_lite {} {
            return [_is_openccu_lite $::redmaticTest(version) $::redmaticTest(occulited)]
        }
    }
}

_source $::redmaticTest(cgi)
`;

const LIVE = 'AbC123dEf4'; // a live session of the box
const OTHER = 'Zz9Yy8Xx7w'; // another live session of the box
const TOKEN = 'olt0000001'; // what /state answers for an API token: no sid
const REGA_LIVE = '@Rega111111@'; // a live session as the ReGa (or the shim) knows it
const REGA_DEAD = '@Dead000000@';

const CCU3_VERSION = 'VERSION=3.89.8\nPRODUCT=ccu3-ie\nPLATFORM=ccu3\n';
const LITE_VERSION = 'VERSION=3.89.8.20260719\nPRODUCT=rpi4\nPLATFORM=rpi4\nVARIANT=lite\nLITE=1.0.0-alpha.0\n';

const SETTINGS_HTML = '<!-- settings.html of the test -->\n';
const SESSION_ERROR_HTML = '<!-- session-error.html of the test -->\n';
const SETTINGS_JSON = '{"test":"settings.json"}';

// the box: GET /api/auth/v1/state as occulited answers it, for the Bearer it is sent
function box(t) {
    const requests = [];
    const server = http.createServer((req, res) => {
        requests.push({method: req.method, url: req.url, authorization: req.headers.authorization});
        const bearer = (req.headers.authorization || '').replace(/^Bearer /, '');
        let body = {authenticated: false, setup_required: false};
        if (req.url === '/api/auth/v1/state' && (bearer === LIVE || bearer === OTHER)) {
            body = {authenticated: true, must_change_password: false, role: 'admin', setup_required: false, sid: bearer, user: 'admin'};
        } else if (req.url === '/api/auth/v1/state' && bearer === TOKEN) {
            body = {authenticated: true, must_change_password: false, role: 'user', setup_required: false, user: 'token:addon'};
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(body));
    });
    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            t.after(() => server.close());
            resolve({url: `http://127.0.0.1:${server.address().port}/api/auth/v1/state`, requests});
        });
    });
}

function scratch(t, {version, occulited}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-cgi-'));
    t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
    fs.mkdirSync(path.join(dir, 'addon', 'www'), {recursive: true});
    fs.mkdirSync(path.join(dir, 'addon', 'etc'));
    fs.writeFileSync(path.join(dir, 'addon', 'www', 'settings.html'), SETTINGS_HTML);
    fs.writeFileSync(path.join(dir, 'addon', 'www', 'session-error.html'), SESSION_ERROR_HTML);
    fs.writeFileSync(path.join(dir, 'addon', 'etc', 'settings.json'), SETTINGS_JSON);
    fs.writeFileSync(path.join(dir, 'driver.tcl'), DRIVER);
    const versionFile = path.join(dir, 'VERSION');
    if (version !== null) {
        fs.writeFileSync(versionFile, version);
    }
    const occulitedFile = path.join(dir, 'occulited');
    if (occulited) {
        fs.writeFileSync(occulitedFile, '');
    }
    return {dir, versionFile, occulitedFile};
}

// runs www/<cgi> the way lighttpd or occulited do: cwd www/, the query in QUERY_STRING, the gate's
// header as HTTP_X_OCCULITE_SESSION
function cgi(t, name, {kind = 'lite', header, query = '', stateUrl}) {
    const s = scratch(t, kind === 'lite' ? {version: LITE_VERSION} : kind === 'occulited' ? {version: null, occulited: true} : {version: CCU3_VERSION});
    const env = {PATH: process.env.PATH, QUERY_STRING: query, REQUEST_METHOD: 'GET'};
    if (header !== undefined) {
        env.HTTP_X_OCCULITE_SESSION = header;
    }
    const args = [path.join(s.dir, 'driver.tcl'), './' + name, path.join(s.dir, 'addon'), stateUrl, s.versionFile, s.occulitedFile, REGA_LIVE.replace(/@/g, '')];
    return new Promise((resolve, reject) => {
        const child = spawn('tclsh', args, {cwd: WWW, env});
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => stdout += d);
        child.stderr.on('data', d => stderr += d);
        child.on('error', reject);
        child.on('close', code => resolve({code, stdout, stderr}));
    });
}

const PAGE = 'Content-Type: text/html; charset=utf-8\r\n\r\n';
const TEXT = 'Content-Type: text/plain; charset=utf-8\r\n\r\n';

async function expectPage(t, opts, box_) {
    const r = await cgi(t, 'settings.cgi', opts);
    assert.strictEqual(r.stdout, PAGE + SETTINGS_HTML, r.stderr);
    const c = await cgi(t, 'getconfig.cgi', opts);
    assert.strictEqual(c.stdout, TEXT + SETTINGS_JSON, c.stderr);
}

async function expectRefused(t, opts, pageAnswer = 'error: session invalid\n') {
    const r = await cgi(t, 'settings.cgi', opts);
    assert.strictEqual(r.stdout, PAGE + pageAnswer, r.stderr);
    const c = await cgi(t, 'getconfig.cgi', opts);
    assert.strictEqual(c.stdout, TEXT + 'error: invalid session\n', c.stderr);
}

test('openccu-lite: a live session in the header opens the page without ?sid=', {skip}, async t => {
    const b = await box(t);
    await expectPage(t, {header: LIVE, stateUrl: b.url});
    assert.ok(b.requests.length >= 2, 'the box was asked');
    for (const req of b.requests) {
        assert.deepStrictEqual(req, {method: 'GET', url: '/api/auth/v1/state', authorization: 'Bearer ' + LIVE});
    }
});

test('openccu-lite: the header is taken before ?sid=', {skip}, async t => {
    const b = await box(t);
    await expectPage(t, {header: LIVE, query: 'sid=' + REGA_DEAD, stateUrl: b.url});
});

test('openccu-lite: a header the box rejects is refused, also next to a live ?sid=', {skip}, async t => {
    const b = await box(t);
    await expectRefused(t, {header: 'Nope000000', stateUrl: b.url});
    await expectRefused(t, {header: 'Nope000000', query: 'sid=' + REGA_LIVE, stateUrl: b.url});
    assert.ok(b.requests.every(req => req.authorization === 'Bearer Nope000000'));
});

test('openccu-lite: /state has to confirm that very session - an API token is refused', {skip}, async t => {
    const b = await box(t);
    await expectRefused(t, {header: TOKEN, stateUrl: b.url});
});

test('openccu-lite: a header that is no bare session id is refused without asking the box', {skip}, async t => {
    const b = await box(t);
    for (const header of [`${LIVE}, ${OTHER}`, `@${LIVE}@`, `${LIVE}\n`, `${LIVE};`, 'x'.repeat(65)]) {
        await expectRefused(t, {header, stateUrl: b.url});
    }
    assert.deepStrictEqual(b.requests, []);
});

test('openccu-lite: a box that cannot be asked refuses', {skip}, async t => {
    const b = await box(t);
    const closed = b.url.replace(/:\d+\//, ':1/');
    await expectRefused(t, {header: LIVE, stateUrl: closed});
});

test('openccu-lite: without the header ?sid= works as before (an image from before it)', {skip}, async t => {
    const b = await box(t);
    await expectPage(t, {query: 'sid=' + REGA_LIVE, stateUrl: b.url});
    await expectRefused(t, {query: 'sid=' + REGA_DEAD, stateUrl: b.url});
    assert.strictEqual((await cgi(t, 'settings.cgi', {stateUrl: b.url})).stdout, PAGE + SESSION_ERROR_HTML);
    assert.deepStrictEqual(b.requests, [], 'the box is not asked without the header');
});

test('openccu-lite: an empty header counts as none', {skip}, async t => {
    const b = await box(t);
    await expectPage(t, {header: '', query: 'sid=' + REGA_LIVE, stateUrl: b.url});
    assert.deepStrictEqual(b.requests, []);
});

test('openccu-lite without a LITE= line but with occulited uses the header', {skip}, async t => {
    const b = await box(t);
    await expectPage(t, {kind: 'occulited', header: LIVE, stateUrl: b.url});
});

test('CCU: a header a client sends is ignored, ?sid= and the ReGa decide as before', {skip}, async t => {
    const b = await box(t);
    // the ReGa check alone: a live box session in the header opens nothing
    assert.strictEqual((await cgi(t, 'settings.cgi', {kind: 'ccu', header: LIVE, stateUrl: b.url})).stdout, PAGE + SESSION_ERROR_HTML);
    assert.strictEqual((await cgi(t, 'getconfig.cgi', {kind: 'ccu', header: LIVE, stateUrl: b.url})).stdout, TEXT + 'error: invalid session\n');
    await expectPage(t, {kind: 'ccu', header: 'Nope000000', query: 'sid=' + REGA_LIVE, stateUrl: b.url});
    await expectPage(t, {kind: 'ccu', query: 'sid=' + REGA_LIVE, stateUrl: b.url});
    await expectRefused(t, {kind: 'ccu', query: 'sid=' + REGA_DEAD, stateUrl: b.url});
    // settings.cgi's own form check of ?sid= is unchanged
    assert.strictEqual((await cgi(t, 'settings.cgi', {kind: 'ccu', query: 'sid=Rega111111', stateUrl: b.url})).stdout, PAGE + SESSION_ERROR_HTML);
    assert.deepStrictEqual(b.requests, [], 'a CCU never asks for /api/auth/v1/state');
});

test('every CGI with a session check goes through request_session_ok', () => {
    const checked = [];
    for (const name of fs.readdirSync(WWW).filter(f => f.endsWith('.cgi'))) {
        const code = fs.readFileSync(path.join(WWW, name), 'utf8');
        if (!code.includes('session.tcl')) {
            continue;
        }
        checked.push(name);
        if (name === 'settings.cgi') {
            assert.match(code, /if \{\[session_header\] != ""\} \{/);
            continue;
        }
        assert.doesNotMatch(code, /check_session \$sid/, `${name} still checks ?sid= alone`);
        assert.match(code, /\[request_session_ok\]/, `${name} does not use request_session_ok`);
    }
    assert.deepStrictEqual(checked.sort(), [
        'backup.cgi', 'getconfig.cgi', 'getnick.cgi', 'log.cgi', 'logupload.cgi', 'safemode.cgi',
        'service.cgi', 'setconfig.cgi', 'setnick.cgi', 'settings.cgi', 'update.cgi',
    ]);
});
