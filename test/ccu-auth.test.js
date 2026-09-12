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
