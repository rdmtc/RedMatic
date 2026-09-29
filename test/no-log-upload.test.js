'use strict';

// Task 19: the log upload is gone - the telemetry server drops its /log endpoint. No file of the addon
// may build a request to telemetry.redmatic.de/log (or any path below the host: the telemetry itself
// posts to the bare host), the upload's script, CGIs and page elements are not shipped, and an update
// removes what an earlier version left on the system.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const ADDON = path.join(ROOT, 'addon_files');
const GONE = ['bin/redmatic-logupload', 'www/logupload.cgi', 'www/getnick.cgi', 'www/setnick.cgi'];

function files(dir) {
    const res = [];
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules') {
                res.push(...files(file));
            }
        } else if (entry.isFile()) {
            res.push(file);
        }
    }
    return res;
}

test('no file of the addon or its build sends anything to a path of the telemetry host', () => {
    const sources = [
        ...files(ADDON),
        ...fs.readdirSync(ROOT).filter(f => /\.(sh|js|mjs)$/.test(f)).map(f => path.join(ROOT, f)),
    ];
    const hits = [];
    for (const file of sources) {
        const text = fs.readFileSync(file, 'latin1');
        for (const m of text.matchAll(/telemetry\.redmatic\.de(\/[^\s"'`)]*)?/g)) {
            if (m[1]) {
                hits.push(`${path.relative(ROOT, file)}: ${m[0]}`);
            }
        }
    }
    assert.deepStrictEqual(hits, []);
});

test('the upload\'s script and CGIs are not shipped', () => {
    for (const file of GONE) {
        assert.ok(!fs.existsSync(path.join(ADDON, 'redmatic', file)), `${file} is still in addon_files`);
    }
});

test('the settings page offers no upload', () => {
    const html = fs.readFileSync(path.join(ADDON, 'redmatic', 'www', 'settings.html'), 'utf8');
    const js = fs.readFileSync(path.join(ADDON, 'redmatic', 'www', 'js', 'script.js'), 'utf8');
    for (const [name, text] of [['settings.html', html], ['script.js', js]]) {
        assert.doesNotMatch(text, /log-upload|logupload|nickname|getnick|setnick|Log versenden/i, name);
    }
    // the download stays: it is how a log is shared now
    assert.match(html, /id="log"[^>]*>.*Log herunterladen/);
});

test('an update removes the upload an earlier version left behind', () => {
    const script = fs.readFileSync(path.join(ADDON, 'update_script'), 'utf8');
    for (const file of [...GONE, 'etc/nickname']) {
        assert.ok(script.includes(`$RED_DIR/${file}`), `update_script does not remove ${file}`);
    }
});
