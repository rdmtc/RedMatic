'use strict';

/*
 * Where npm keeps its cache for the palette installs Node-RED runs (settings.json "npmCache"):
 *
 *   "ram" (the default)  /tmp/redmatic-npm-cache-<uid>, emptied at every start: nothing of it on the
 *                        SD card, a reinstall downloads the package again
 *   "storage"            var/npm-cache, as up to 9.17 (etc/npmrc's cache): a reinstall is faster, the
 *                        tarballs stay on the SD card
 *
 * bin/redmaticLoader runs `node lib/npm-cache.js dir` and exports npm_config_cache when it prints a
 * directory; update_script runs `node lib/npm-cache.js mode`.
 */

const fs = require('fs');

const SETTINGS = '/usr/local/addons/redmatic/etc/settings.json';

function mode(settings) {
    return settings && settings.npmCache === 'storage' ? 'storage' : 'ram';
}

// the directory to export as npm_config_cache, or '' for etc/npmrc's own (var/npm-cache)
function dir(settings, uid) {
    return mode(settings) === 'ram' ? `/tmp/redmatic-npm-cache-${uid}` : '';
}

function readSettings(file = SETTINGS) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return {};
    }
}

if (require.main === module) {
    const settings = readSettings(process.env.REDMATIC_SETTINGS || SETTINGS);
    const what = process.argv[2];
    if (what === 'mode') {
        console.log(mode(settings));
    } else if (what === 'dir') {
        console.log(dir(settings, typeof process.getuid === 'function' ? process.getuid() : 0));
    } else {
        console.error('usage: npm-cache.js mode|dir');
        process.exit(2);
    }
}

module.exports = {mode, dir, readSettings};
