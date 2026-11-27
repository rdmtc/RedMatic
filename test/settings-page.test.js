'use strict';

// The settings page (www/settings.html, css/style.css, js/script.js) and the two pages that share
// its stylesheet:
//  - Dark mode follows the system's setting. Bootstrap 4 has no dark theme, so css/style.css sets
//    the colours in a prefers-color-scheme block - colours only, so that no element changes its
//    size between the themes.
//  - On openccu-lite the line "Node-RED Abstürze seit letztem RedMatic-Start" is hidden: systemd
//    watches the unit there, and its web server does not serve the link to var/restart_count (the
//    line always said "keine"). A CCU and OpenCCU keep it.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const WWW = path.join(__dirname, '..', 'addon_files', 'redmatic', 'www');
const read = file => fs.readFileSync(path.join(WWW, file), 'utf8');

// the body of the `@media (prefers-color-scheme: dark) { ... }` block
function darkBlock(css) {
    const start = css.indexOf('@media (prefers-color-scheme: dark)');
    assert.ok(start >= 0, 'no prefers-color-scheme block');
    const open = css.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < css.length; i++) {
        if (css[i] === '{') {
            depth++;
        } else if (css[i] === '}' && --depth === 0) {
            return css.slice(open + 1, i);
        }
    }
    throw new Error('unbalanced braces');
}

test('dark mode: the stylesheet has a block for the system\'s dark setting that sets colours only', () => {
    const block = darkBlock(read('css/style.css'));
    const properties = [...block.matchAll(/^\s+([a-z-]+)\s*:[^;{]*;/gm)].map(m => m[1]);
    assert.ok(properties.length > 30, `only ${properties.length} declarations`);
    const allowed = new Set(['color', 'background', 'background-color', 'border-color']);
    assert.deepStrictEqual([...new Set(properties.filter(p => !allowed.has(p)))], [], 'a property that can change an element\'s box');
    // what the page is made of
    for (const selector of ['body', '.card', '.navbar.bg-light', '.form-control', '.custom-select', '.dropdown-menu',
        '.modal-content', '.alert-success', '.alert-warning', '.alert-danger', '.text-muted', '.custom-control-label::before']) {
        assert.ok(block.includes(selector), `${selector} has no dark colours`);
    }
});

test('dark mode: every page says it supports both schemes and swaps the logo without changing its size', () => {
    for (const file of ['settings.html', 'session-error.html', 'lighttpd-error-503.html']) {
        const html = read(file);
        assert.match(html, /<meta name="color-scheme" content="light dark">/, file);
        assert.match(html, /<picture><source srcset="[^"]*redmatic5-compact-dark\.png" media="\(prefers-color-scheme: dark\)"><img src="[^"]*redmatic5-compact\.png" style="height: 42px; "><\/picture>/, file);
    }
    assert.match(read('licenses.html'), /prefers-color-scheme: dark/);
    // both logos are shipped (build_addon.sh copies assets/redmatic5*)
    for (const logo of ['redmatic5-compact.png', 'redmatic5-compact-dark.png']) {
        assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', logo)), logo);
    }
});

test('dark mode: no colour is left in a style attribute of the settings page, where the stylesheet cannot reach it', () => {
    const styles = [...read('settings.html').matchAll(/style="([^"]*)"/g)].map(m => m[1]);
    assert.deepStrictEqual(styles.filter(s => /(^|[;\s])(color|background(-color)?|border-color)\s*:/.test(s)), []);
});

test('the crash counter: hidden on openccu-lite and not asked for there, read on a CCU', () => {
    const html = read('settings.html');
    assert.match(html, /<p id="restarts-line"[^>]*>Node-RED Abstürze seit letztem RedMatic-Start: <span id="restarts">keine<\/span><\/p>/);
    const js = read('js/script.js');
    // update.cgi's status says managed: 'system' on openccu-lite: the branch hides the line and
    // returns before the counter is loaded
    const branch = js.slice(js.indexOf("if (state && state.managed === 'system') {"));
    const system = branch.slice(0, branch.indexOf('return;'));
    assert.ok(system.includes("$('#restarts-line').hide();"), 'the line is not hidden on openccu-lite');
    assert.ok(!system.includes('loadRestarts'), 'the counter is loaded on openccu-lite');
    assert.match(branch.slice(branch.indexOf('return;')), /^return;\s*\}\s*loadRestarts\(\);/);
    assert.strictEqual(js.match(/\$\.get\('restart_count'/g).length, 1);
    assert.match(js, /function loadRestarts\(\) \{\s*\$\.get\('restart_count'/);
    // a CCU still gets the file: the link into var/ that lighttpd serves there
    assert.strictEqual(fs.readlinkSync(path.join(WWW, 'restart_count')), '../var/restart_count');
});
