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
// `occulited` whether /usr/bin/occulited exists
function loadOn(t, {version, occulited}) {
    const readFileSync = fs.readFileSync;
    const existsSync = fs.existsSync;
    t.mock.method(fs, 'readFileSync', (file, ...rest) => {
        if (file !== '/VERSION') {
            return readFileSync.call(fs, file, ...rest);
        }
        if (version === null) {
            throw Object.assign(new Error('ENOENT: no such file or directory'), {code: 'ENOENT'});
        }
        return version;
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
