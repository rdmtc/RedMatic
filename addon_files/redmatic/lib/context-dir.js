'use strict';

/*
 * B-18: a file context store whose directory Node-RED may not use stops Node-RED altogether:
 *
 *   Failed to start server:
 *   Error: Error loading context store: Error: EACCES: permission denied, scandir '/media/usb0/redmatic/context'
 *
 * A common CCU3 setting keeps the store on the USB stick (contextStorage.file.config.dir
 * /media/usb0/redmatic) to spare the SD card. Confined on openccu-lite Node-RED runs as
 * addon-redmatic, and the stick is the user's only where the system grants the addon the group
 * usbstorage and /media (the manifest declares both; an image that predates the group leaves it
 * out). A stick that is not plugged in, or a read-only file system, ends the same way.
 *
 * So lib/settings.js checks every file store's directory as the user Node-RED runs as, before
 * Node-RED sees it: a store whose <dir>/context cannot be listed and written gets the addon's own
 * var/ for this run, and the log says so loudly. Node-RED starts; the values kept in the original
 * directory are not loaded until it is usable again, and are not touched either.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const FALLBACK = '/usr/local/addons/redmatic/var';

/** null when Node-RED can use <dir>/context (list and write it, or create it), else the error */
function problem(dir) {
    const context = path.join(dir, 'context');
    try {
        if (fs.existsSync(context)) {
            fs.readdirSync(context);
            fs.accessSync(context, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
            return null;
        }
        // Node-RED creates the directory: the nearest one that exists must be writable. existsSync
        // is false for a path below a directory the user may not search, so this finds that one.
        let existing = dir;
        while (!fs.existsSync(existing) && path.dirname(existing) !== existing) {
            existing = path.dirname(existing);
        }
        fs.accessSync(existing, fs.constants.W_OK | fs.constants.X_OK);
        return null;
    } catch (error) {
        return error;
    }
}

function user() {
    try {
        return os.userInfo().username;
    } catch {
        return 'uid ' + process.getuid();
    }
}

/**
 * Points every localfilesystem store of contextStorage (as lib/settings.js hands it to Node-RED)
 * whose directory is not usable at fallback, and logs a line per store through log. Returns the
 * names of the stores it changed.
 */
function checkStores(contextStorage, {fallback = FALLBACK, log = console.warn, check = problem} = {}) {
    const changed = [];
    for (const [name, store] of Object.entries(contextStorage || {})) {
        if (!store || store.module !== 'localfilesystem' || !store.config || !store.config.dir) {
            continue;
        }
        const dir = path.resolve(String(store.config.dir));
        if (dir === fallback) {
            continue;
        }
        const error = check(dir);
        if (!error) {
            continue;
        }
        log(
            `[redmatic] context store '${name}': ${dir} is not usable for ${user()} (${error.code || error.message}); ` +
                `using ${fallback} for this run so Node-RED starts - the values kept in ${dir} are not loaded until it is usable again. ` +
                'On a USB stick: is it plugged in? On openccu-lite the system grants the addon the stick (group usbstorage, /media) when its manifest declares it and the image knows the group.'
        );
        store.config = Object.assign({}, store.config, {dir: fallback});
        changed.push(name);
    }
    return changed;
}

module.exports = {checkStores, problem, FALLBACK};
