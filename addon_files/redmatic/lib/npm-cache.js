'use strict';

/*
 * Where npm keeps its cache for the palette installs Node-RED runs (settings.json "npmCache"):
 *
 *   "storage" (the default)  var/npm-cache (etc/npmrc's cache): an install writes the downloaded
 *                            packages to the SD card once more, a reinstall is faster
 *   "ram"                    /tmp/redmatic-npm-cache-<uid>: nothing of it on the SD card, but it
 *                            needs RAM for the duration of an install (a large package can take
 *                            tens of MB); emptied after each palette install, update or removal
 *                            and at every start
 *
 * bin/redmaticLoader runs `node lib/npm-cache.js dir` and exports npm_config_cache when it prints a
 * directory; update_script runs `node lib/npm-cache.js mode`. lib/settings.js calls emptyAfterNpm()
 * when the loader exported a cache in /tmp.
 *
 * 9.18.0 made "ram" the default and wrote it into the settings of a fresh install; its settings page
 * stored the value only when the user changed the select, and a change could only lead to "ram" by
 * way of "storage" first. So a "ram" without the marker npmCacheMigrated is taken for 9.18.0's
 * default and set back to "storage", once. The settings page sets the marker whenever it saves the
 * choice.
 */

const fs = require('fs');
const path = require('path');

const SETTINGS = '/usr/local/addons/redmatic/etc/settings.json';
const RAM_PREFIX = '/tmp/redmatic-npm-cache-';

function mode(settings) {
    return settings && settings.npmCache === 'ram' ? 'ram' : 'storage';
}

// the directory to export as npm_config_cache, or '' for etc/npmrc's own (var/npm-cache)
function dir(settings, uid) {
    return mode(settings) === 'ram' ? `${RAM_PREFIX}${uid}` : '';
}

function readSettings(file = SETTINGS) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return {};
    }
}

/**
 * 9.18.0's default "ram" back to "storage" (see above). Returns true when the settings were changed
 * (and written to `file` when given).
 */
function migrate(settings, file) {
    if (!settings || settings.npmCache !== 'ram' || settings.npmCacheMigrated) {
        return false;
    }
    settings.npmCache = 'storage';
    settings.npmCacheMigrated = true;
    if (file) {
        try {
            fs.writeFileSync(file, JSON.stringify(settings, null, '  '));
        } catch {
            // not writable (a start as another user): this run uses "storage" all the same
        }
    }
    return true;
}

/** Empties a RAM cache directory; npm's debug logs (_logs) stay until the next start. */
function empty(cacheDir) {
    if (!cacheDir || !cacheDir.startsWith(RAM_PREFIX)) {
        return;
    }
    let entries;
    try {
        entries = fs.readdirSync(cacheDir);
    } catch {
        return;
    }
    for (const entry of entries) {
        if (entry !== '_logs') {
            try {
                fs.rmSync(path.join(cacheDir, entry), {recursive: true, force: true});
            } catch {
                // left for the next start's cleanup
            }
        }
    }
}

/**
 * Empties cacheDir after every npm run Node-RED makes through its exec.run (@node-red/util): the
 * palette's install, update, removal and tarball install, successful or not. Node-RED's
 * preInstall/postInstall hooks would miss a failed install (postInstall does not run then), and a
 * wrapped child_process would catch far more than npm. Returns false when exec.run is not there.
 */
function emptyAfterNpm(exec, cacheDir) {
    if (!exec || typeof exec.run !== 'function' || exec.run.redmaticNpmCache) {
        return false;
    }
    const run = exec.run;
    const wrapped = function (command, args, ...rest) {
        const result = run.call(this, command, args, ...rest);
        const isNpm = Array.isArray(args) && args.some(a => /npm-cli\.js$/.test(String(a)));
        if (!isNpm || !result || typeof result.finally !== 'function') {
            return result;
        }
        return result.finally(() => empty(cacheDir));
    };
    wrapped.redmaticNpmCache = true;
    exec.run = wrapped;
    return true;
}

if (require.main === module) {
    const file = process.env.REDMATIC_SETTINGS || SETTINGS;
    const settings = readSettings(file);
    migrate(settings, file);
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

module.exports = {mode, dir, readSettings, migrate, empty, emptyAfterNpm, RAM_PREFIX};
