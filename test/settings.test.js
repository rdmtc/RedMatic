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

// settings.js requires these by their absolute paths on the box; stand in for them here
const STUBS = [NODE_RED_DEFAULTS, SETTINGS_JSON, LOGGER];
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    return STUBS.includes(request) ? request : resolve.call(this, request, ...rest);
};

function stub(file, exports) {
    require.cache[file] = {id: file, filename: file, loaded: true, exports};
}

// a fresh settings.js with `stored` as etc/settings.json; returns the export and every path written
function loadWith(t, stored) {
    stub(NODE_RED_DEFAULTS, {logging: {console: {level: 'info'}}, editorTheme: {}});
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
