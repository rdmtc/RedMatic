'use strict';

// Bug 6: openccu-lite names its session cookie per scheme (occulite_session over http,
// __Secure-occulite_session over https). The editor's single sign-on must find either, and try
// every one, because a stale cookie of one name can stand before a live one of the other.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const path = require('node:path');

// ccu-auth.js requires rega-auth.js by its absolute path on the box; stand in for it here
const REGA = '/usr/local/addons/redmatic/lib/rega-auth.js';
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    return request === REGA ? REGA : resolve.call(this, request, ...rest);
};
require.cache[REGA] = {id: REGA, filename: REGA, loaded: true, exports: {users: async () => null, authenticate: async () => null}};

const {sidsFromCookie} = require(path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'ccu-auth.js'));

test('the plain name from a login over http', () => {
    assert.deepStrictEqual(sidsFromCookie('occulite_session=AbC123dEf4'), ['AbC123dEf4']);
});

test('the __Secure- name from a login over https', () => {
    assert.deepStrictEqual(sidsFromCookie('lang=de; __Secure-occulite_session=Zz9Yy8Xx7w'), ['Zz9Yy8Xx7w']);
});

test('both names: every id in header order, a stale one before a live one', () => {
    assert.deepStrictEqual(
        sidsFromCookie('occulite_session=Stale00000; theme=dark; __Secure-occulite_session=Live111111'),
        ['Stale00000', 'Live111111'],
    );
});

test('the same id under both names counts once', () => {
    assert.deepStrictEqual(sidsFromCookie('occulite_session=Same222222; __Secure-occulite_session=Same222222'), ['Same222222']);
});

test('the CCU convention @sid@ is unwrapped', () => {
    assert.deepStrictEqual(sidsFromCookie('occulite_session=@Wrap333333@'), ['Wrap333333']);
});

test('a cookie that merely ends in the name is not the session cookie', () => {
    assert.deepStrictEqual(sidsFromCookie('myocculite_session=Nope444444; x__Secure-occulite_session=Nope555555'), []);
});

test('no header, or no session cookie in it', () => {
    assert.deepStrictEqual(sidsFromCookie(undefined), []);
    assert.deepStrictEqual(sidsFromCookie('lang=de; theme=dark'), []);
});

// Bug 7: the cookie hook exists only on openccu-lite, decided when the module loads. Node-RED's
// comms drops a WebSocket whose `tokenHeader` fails `tokens`, so a CCU must not have one.

const fs = require('node:fs');
const http = require('node:http');
const {EventEmitter} = require('node:events');

const MODULE = path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'ccu-auth.js');

// a fresh ccu-auth.js on a pretend box: `version` is the content of /VERSION (null: no file),
// `occulited` whether /usr/bin/occulited exists, `gate` the content of lighttpd's session gate
// /etc/lighttpd/occulite-gate.lua (null or left out: no file)
function loadOn(t, {version, occulited, gate = null}) {
    const readFileSync = fs.readFileSync;
    const existsSync = fs.existsSync;
    const files = {'/VERSION': version, '/etc/lighttpd/occulite-gate.lua': gate};
    t.mock.method(fs, 'readFileSync', (file, ...rest) => {
        if (!(file in files)) {
            return readFileSync.call(fs, file, ...rest);
        }
        if (files[file] === null) {
            throw Object.assign(new Error('ENOENT: no such file or directory'), {code: 'ENOENT'});
        }
        return files[file];
    });
    t.mock.method(fs, 'existsSync', file => (file === '/usr/bin/occulited' ? occulited : existsSync.call(fs, file)));
    delete require.cache[MODULE];
    const auth = require(MODULE);
    delete require.cache[MODULE];
    t.mock.restoreAll();
    return auth;
}

const CCU3_VERSION = 'VERSION=3.89.8\nPRODUCT=ccu3-ie\nPLATFORM=ccu3\n';
const LITE_VERSION = 'VERSION=3.89.8.20260719\nPRODUCT=rpi3\nPLATFORM=rpi3\nVARIANT=lite\nLITE=1.0.0-alpha.0\n';

// http.request answering every request with `status` and `body`; the requests are recorded
function fakeBox(t, status, body) {
    const requests = [];
    t.mock.method(http, 'request', (options, onResponse) => {
        requests.push(options);
        const req = new EventEmitter();
        req.setTimeout = () => req;
        req.destroy = () => {};
        req.end = () => {
            const res = new EventEmitter();
            res.statusCode = status;
            res.headers = {};
            res.setEncoding = () => {};
            onResponse(res);
            res.emit('data', body);
            res.emit('end');
        };
        return req;
    });
    return requests;
}

test('a CCU3 gets no cookie hook: no tokens, no tokenHeader', t => {
    const auth = loadOn(t, {version: CCU3_VERSION, occulited: false});
    assert.strictEqual(auth.type, 'credentials');
    assert.strictEqual(typeof auth.users, 'function');
    assert.strictEqual(typeof auth.authenticate, 'function');
    assert.ok(!('tokens' in auth));
    assert.ok(!('tokenHeader' in auth));
});

test('a box without /VERSION (a container) gets no cookie hook', t => {
    const auth = loadOn(t, {version: null, occulited: false});
    assert.ok(!('tokens' in auth));
    assert.ok(!('tokenHeader' in auth));
});

test('openccu-lite by the LITE= line of /VERSION gets the cookie hook', t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: false});
    assert.strictEqual(auth.tokenHeader, 'cookie');
    assert.strictEqual(typeof auth.tokens, 'function');
});

test('openccu-lite by /usr/bin/occulited alone gets the cookie hook', t => {
    const auth = loadOn(t, {version: CCU3_VERSION, occulited: true});
    assert.strictEqual(auth.tokenHeader, 'cookie');
});

test('openccu-lite: a Cookie header with only foreign cookies is refused without asking the box', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true});
    const requests = fakeBox(t, 200, '{"authenticated":true,"user":"admin","role":"admin"}');
    assert.strictEqual(await auth.tokens('ol-theme=dark; lang=de'), null);
    assert.strictEqual(requests.length, 0);
});

test('openccu-lite: the https session cookie names the user the box confirms', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true});
    const requests = fakeBox(t, 200, '{"authenticated":true,"user":"anna","role":"user"}');
    assert.deepStrictEqual(await auth.tokens('ol-theme=dark; __Secure-occulite_session=Live666666'), {username: 'anna', permissions: 'read'});
    assert.strictEqual(requests.length, 1);
    assert.strictEqual(requests[0].path, '/api/auth/v1/state');
    assert.strictEqual(requests[0].headers.Cookie, 'occulite_session=Live666666');
});

test('openccu-lite: a session the box does not know is refused', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true});
    fakeBox(t, 200, '{"authenticated":false}');
    assert.strictEqual(await auth.tokens('__Secure-occulite_session=Gone777777'), null);
});

// What Node-RED itself makes of it: comms checks the header only when tokenHeader() is not null.
let nodeRedUsers = null;
try {
    nodeRedUsers = require('@node-red/editor-api/lib/auth/users');
} catch {}

test('Node-RED: tokenHeader() is null on a CCU and cookie on openccu-lite', {skip: !nodeRedUsers && 'node-red is not installed'}, t => {
    nodeRedUsers.init(loadOn(t, {version: CCU3_VERSION, occulited: false}));
    assert.strictEqual(nodeRedUsers.tokenHeader(), null);
    nodeRedUsers.init(loadOn(t, {version: LITE_VERSION, occulited: true}));
    assert.strictEqual(nodeRedUsers.tokenHeader(), 'cookie');
});

// openccu-lite B-94, D-65: lighttpd's gate hands addons the validated session as X-Occulite-Session.
// With that gate the editor authenticates from the header, still checked with GET /api/auth/v1/state;
// an image from before it keeps the cookie hook.

const crypto = require('node:crypto');

const GATE_WITH_HEADER = 'local SESSION_DIR = "/var/run/occulite/sessions/"\nlocal SESSION_HEADER = "X-Occulite-Session"\n';
const GATE_BEFORE_HEADER = 'local SESSION_DIR = "/var/run/occulite/sessions/"\n';

test('openccu-lite whose gate sets the session header: tokenHeader x-occulite-session', t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    assert.strictEqual(auth.tokenHeader, 'x-occulite-session');
    assert.strictEqual(typeof auth.tokens, 'function');
});

test('cookie fallback: openccu-lite from before the header keeps the cookie hook', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_BEFORE_HEADER});
    assert.strictEqual(auth.tokenHeader, 'cookie');
    const requests = fakeBox(t, 200, '{"authenticated":true,"user":"admin","role":"admin"}');
    assert.deepStrictEqual(await auth.tokens('__Secure-occulite_session=Cook123456'), {username: 'admin', permissions: '*'});
    assert.strictEqual(requests[0].headers.Cookie, 'occulite_session=Cook123456');
});

test('a CCU without occulited gets no hook, even with a gate file that names the header', t => {
    const auth = loadOn(t, {version: CCU3_VERSION, occulited: false, gate: GATE_WITH_HEADER});
    assert.ok(!('tokens' in auth));
    assert.ok(!('tokenHeader' in auth));
});

test('session header: a valid id names the user the box confirms, asked with Bearer', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    const requests = fakeBox(t, 200, '{"authenticated":true,"user":"anna","role":"user","sid":"Head888888"}');
    assert.deepStrictEqual(await auth.tokens('Head888888'), {username: 'anna', permissions: 'read'});
    assert.strictEqual(requests.length, 1);
    assert.strictEqual(requests[0].path, '/api/auth/v1/state');
    assert.strictEqual(requests[0].headers.Authorization, 'Bearer Head888888');
    assert.ok(!('Cookie' in requests[0].headers));
});

test('session header: an id the state check rejects is refused', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    const requests = fakeBox(t, 200, '{"setup_required":false,"authenticated":false}');
    assert.strictEqual(await auth.tokens('Gone999999'), null);
    assert.strictEqual(requests.length, 1);
});

test('session header: the box confirming a different session (a box without login) is refused', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    fakeBox(t, 200, '{"authenticated":true,"user":"admin","role":"admin","sid":"Anon000000","auth_off":true}');
    assert.strictEqual(await auth.tokens('Forged0000'), null);
});

test('session header: an API token the box accepts as Bearer is not a session', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    fakeBox(t, 200, '{"authenticated":true,"user":"token","role":"admin"}');
    assert.strictEqual(await auth.tokens('Token00000'), null);
});

test('session header: a value that is not a bare session id is refused without asking the box', async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    const requests = fakeBox(t, 200, '{"authenticated":true,"user":"admin","role":"admin","sid":"Head777777"}');
    for (const value of [undefined, '', 'Head777777, Head777777', 'occulite_session=Head777777', '@Head777777@', 'Head777777\r\nX: y']) {
        assert.strictEqual(await auth.tokens(value), null, JSON.stringify(value));
    }
    assert.strictEqual(requests.length, 0);
});

test('Node-RED: tokenHeader() is x-occulite-session on openccu-lite with the header', {skip: !nodeRedUsers && 'node-red is not installed'}, t => {
    nodeRedUsers.init(loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER}));
    assert.strictEqual(nodeRedUsers.tokenHeader(), 'x-occulite-session');
});

// Node-RED's own comms: an upgrade that carries the tokenHeader is authenticated by that header
// alone (editor-api lib/editor/comms.js) - accepted with 101, or its socket destroyed.
let nodeRedComms = null;
try {
    nodeRedComms = require('@node-red/editor-api/lib/editor/comms');
} catch {}

test('Node-RED comms: a WebSocket upgrade with a valid session header connects, a rejected one is dropped', {skip: !(nodeRedUsers && nodeRedComms) && 'node-red is not installed'}, async t => {
    const auth = loadOn(t, {version: LITE_VERSION, occulited: true, gate: GATE_WITH_HEADER});
    nodeRedUsers.init(auth);

    // the box on port 80: Good000000 is its only live session. Everything else passes through.
    const realRequest = http.request;
    const asked = [];
    t.mock.method(http, 'request', (options, ...rest) => {
        if (options.port !== 80) {
            return realRequest.call(http, options, ...rest);
        }
        asked.push(options.headers.Authorization);
        const body = options.headers.Authorization === 'Bearer Good000000' ?
            '{"authenticated":true,"user":"admin","role":"admin","sid":"Good000000"}' :
            '{"authenticated":false}';
        const req = new EventEmitter();
        req.setTimeout = () => req;
        req.destroy = () => {};
        req.end = () => {
            const res = new EventEmitter();
            res.statusCode = 200;
            res.headers = {};
            res.setEncoding = () => {};
            rest[0](res);
            res.emit('data', body);
            res.emit('end');
        };
        return req;
    });

    const server = http.createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    nodeRedComms.init(server, {httpAdminRoot: '/addons/red/', adminAuth: auth}, {comms: {subscribe() {}, receive() {}}});
    nodeRedComms.start();
    t.after(() => {
        nodeRedComms.stop();
        server.close();
    });
    // start() adds its upgrade handler once Users.default() has resolved
    for (let i = 0; i < 100 && server.listenerCount('upgrade') === 0; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    const upgrade = headers => new Promise(resolve => {
        const req = realRequest.call(http, {
            host: '127.0.0.1',
            port: server.address().port,
            path: '/addons/red/comms',
            headers: Object.assign({
                Connection: 'Upgrade',
                Upgrade: 'websocket',
                'Sec-WebSocket-Version': '13',
                'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64')
            }, headers)
        });
        req.on('upgrade', (res, socket) => {
            socket.destroy();
            resolve(res.statusCode);
        });
        req.on('response', res => {
            res.resume();
            resolve(res.statusCode);
        });
        req.on('error', err => resolve(err.code || err.message));
        req.end();
    });

    assert.strictEqual(await upgrade({'X-Occulite-Session': 'Good000000'}), 101);
    assert.strictEqual(await upgrade({'X-Occulite-Session': 'Fake000000'}), 'ECONNRESET');
    assert.deepStrictEqual(asked, ['Bearer Good000000', 'Bearer Fake000000']);
});
