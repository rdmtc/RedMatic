'use strict';

/*
 * Loaded with `node --require` before Node-RED starts (bin/redmaticLoader), after compat.js.
 *
 * B-17: when Node-RED cannot start - a context store it may not read, a broken settings value -
 * its red.js logs
 *
 *   Failed to start server:
 *   Error: Error loading context store: Error: EACCES: permission denied, scandir '/media/usb0/...'
 *
 * and does nothing else. The process stays alive without a server: the loader never sees an exit,
 * so restartOnCrash does not apply, monit on a CCU sees a running process, the openccu-lite unit
 * stays active and the system's proxy answers "Node-RED is starting" forever.
 *
 * So the RED.start() that red.js calls is watched: when its promise rejects, Node-RED is given a
 * moment to log the error, then the process exits with 1. The loader then restarts it as
 * restartOnCrash says, or ends, and the failure is visible where a Node-RED that ended is (the
 * Services and Status pages on openccu-lite, monit's alert on a CCU). A Node-RED that starts is
 * not touched: the promise red.js receives is the one RED.start() returned.
 */

const Module = require('module');
const path = require('path');

// time for red.js to log the error and for the log pipes to drain before the exit
const GRACE_MS = 2000;

let watched = false;

/** true for the require of lib/red.js from Node-RED's own red.js (node_modules/node-red/red.js) */
function isNodeRedApi(request, parent) {
    if (request !== './lib/red.js' || !parent || !parent.filename) {
        return false;
    }
    return path.basename(parent.filename) === 'red.js' && path.basename(path.dirname(parent.filename)) === 'node-red';
}

function watch(RED) {
    const start = RED.start;
    RED.start = function () {
        const promise = start.apply(this, arguments);
        // the prototype's then: lib/red.js replaces the promise's own then for its deprecated otherwise()
        Promise.prototype.then.call(promise, undefined, () => {
            setTimeout(() => {
                console.error('[redmatic] Node-RED could not start its server, exiting so the failure is visible');
                process.exit(1);
            }, GRACE_MS);
        });
        return promise;
    };
}

const load = Module._load;
Module._load = function (request, parent) {
    const exported = load.apply(this, arguments);
    if (!watched && isNodeRedApi(request, parent) && exported && typeof exported.start === 'function') {
        watched = true;
        watch(exported);
    }
    return exported;
};
