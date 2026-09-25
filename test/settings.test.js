'use strict';

// Bug 8: lib/settings.js wrote the merged settings to /tmp/red-settings.json. Nothing read that
// file; it held credentialSecret for every local user to read, and on openccu-lite it belonged
// to the addon's own user, so a start as root (an update's installer) failed to open it in the
// sticky /tmp and Node-RED did not start. settings.js may write its own etc/settings.json (the
// logging key migration) and nothing else.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const MODULE = path.join(__dirname, '..', 'addon_files', 'redmatic', 'lib', 'settings.js');
const ADDON = '/usr/local/addons/redmatic';
const NODE_RED_DEFAULTS = ADDON + '/lib/node_modules/node-red/settings.js';
const SETTINGS_JSON = ADDON + '/etc/settings.json';
const LOGGER = ADDON + '/lib/logger.js';
const CCU_AUTH = ADDON + '/lib/ccu-auth.js';
const EDITOR_SSO = ADDON + '/lib/editor-sso.js';

// settings.js requires these by their absolute paths on the box; stand in for them here
const STUBS = [NODE_RED_DEFAULTS, SETTINGS_JSON, LOGGER, CCU_AUTH];
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    return STUBS.includes(request) ? request : resolve.call(this, request, ...rest);
};

function stub(file, exports) {
    require.cache[file] = {id: file, filename: file, loaded: true, exports};
}

// a fresh settings.js with `stored` as etc/settings.json; returns the export and every path written
// `ccuAuth`: what lib/ccu-auth.js exports on the pretend box (tokenHeader only on openccu-lite)
function loadWith(t, stored, ccuAuth = {type: 'credentials'}) {
    stub(NODE_RED_DEFAULTS, {logging: {console: {level: 'info'}}, editorTheme: {}});
    stub(CCU_AUTH, Object.assign({}, ccuAuth));
    stub(SETTINGS_JSON, stored);
    stub(LOGGER, {logging: {syslog: {level: 'info'}}});
    const written = [];
    // no credentials.key, no settings-user.js on the pretend box
    t.mock.method(fs, 'existsSync', () => false);
    t.mock.method(fs, 'writeFileSync', file => {
        written.push(String(file));
    });
    delete require.cache[MODULE];
    const settings = require(MODULE);
    delete require.cache[MODULE];
    t.mock.restoreAll();
    return {settings, written};
}

test('a plain start writes no file', t => {
    const {settings, written} = loadWith(t, {logging: {syslog: {level: 'warn'}}});
    assert.deepStrictEqual(written, []);
    assert.strictEqual(settings.contextStorage.default.module, 'memory');
});

test('the logging key migration writes etc/settings.json and nothing else', t => {
    const {settings, written} = loadWith(t, {logging: {ain: {level: 'debug'}}});
    assert.deepStrictEqual(written, [SETTINGS_JSON]);
    assert.strictEqual(settings.logging.syslog.level, 'debug');
});

// Bug 14: on openccu-lite the editor signs in with the system's session; a Node-RED token the browser
// kept from an earlier form login made Node-RED show its login dialog over the workspace. The editor
// page gets lib/editor-sso.js, which drops that token, and only where the single sign-on is on.
const clone = o => JSON.parse(JSON.stringify(o));
const REGA = {adminAuth: {type: 'rega', sessionExpiryTime: 86400}, editorTheme: {projects: {enabled: false}}};

test('openccu-lite with the session header: the editor page gets editor-sso.js first', t => {
    const {settings} = loadWith(t, clone(REGA), {type: 'credentials', tokenHeader: 'x-occulite-session'});
    assert.deepStrictEqual(settings.editorTheme.page.scripts, [EDITOR_SSO]);
    assert.strictEqual(settings.editorTheme.projects.enabled, false);
    assert.strictEqual(settings.adminAuth.sessionExpiryTime, 86400);
});

test('openccu-lite with the cookie hook (an older image) gets it too', t => {
    const {settings} = loadWith(t, clone(REGA), {type: 'credentials', tokenHeader: 'cookie'});
    assert.deepStrictEqual(settings.editorTheme.page.scripts, [EDITOR_SSO]);
});

test('page scripts of the stored settings are kept, and editor-sso.js is not added twice', t => {
    const stored = clone(REGA);
    stored.editorTheme.page = {scripts: ['/usr/local/addons/redmatic/etc/mine.js', EDITOR_SSO]};
    const {settings} = loadWith(t, stored, {type: 'credentials', tokenHeader: 'x-occulite-session'});
    assert.deepStrictEqual(settings.editorTheme.page.scripts, ['/usr/local/addons/redmatic/etc/mine.js', EDITOR_SSO]);
    const one = clone(REGA);
    one.editorTheme.page = {scripts: '/usr/local/addons/redmatic/etc/mine.js'};
    assert.deepStrictEqual(loadWith(t, one, {type: 'credentials', tokenHeader: 'cookie'}).settings.editorTheme.page.scripts,
        [EDITOR_SSO, '/usr/local/addons/redmatic/etc/mine.js']);
});

test('a CCU (no tokenHeader) and a Node-RED login of its own get no script', t => {
    assert.strictEqual(loadWith(t, clone(REGA)).settings.editorTheme.page, undefined);
    const own = {adminAuth: {type: 'credentials', users: []}};
    assert.strictEqual(loadWith(t, own, {type: 'credentials', tokenHeader: 'cookie'}).settings.editorTheme.page, undefined);
});
