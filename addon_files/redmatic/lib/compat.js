'use strict';

/*
 * Loaded with `node --require` before Node-RED starts (bin/redmaticLoader).
 *
 * #602: Node-RED died about 40 seconds after every start with
 *
 *   Error: The `onCancel` handler was attached after the promise settled.
 *       at onCancel (/usr/local/addons/redmatic/var/node_modules/p-cancelable/index.js:48:12)
 *       at makeRequest (/usr/local/addons/redmatic/var/node_modules/got/dist/source/as-promise/index.js:38:13)
 *       at Timeout.retry (/usr/local/addons/redmatic/var/node_modules/got/dist/source/core/index.js:1278:30)
 *
 * and the supervisor restarted it into the same crash until it gave up. The `got` there is not
 * RedMatic's (its var layer bundles node-red-contrib-ccu only); it came with a node the user
 * installed. got 11 has a retry bug that was never fixed in the 11 line (sindresorhus/got#1187,
 * #1489, #1995): when a socket error reaches the request directly, the promise is rejected and a
 * retry is still scheduled; the retry registers its cancel handler on the settled promise, and
 * p-cancelable 2.x throws - inside a timer, so nothing can catch it and the whole process exits.
 * The same nodes ran for a day on RedMatic 7 (an old Node.js); Node.js 24 emits the socket error
 * in the order that takes the bad path.
 *
 * The throw guards against a programming error - a cancel handler that can never run - and in
 * got's case the handler really is pointless: the request it would cancel belongs to a promise
 * nobody waits for any more. So for p-cancelable 2.x only, and for that one error only, the
 * handler is dropped instead of thrown, and the log says once where it came from. Everything else
 * - cancel(), shouldReject, isCanceled, PCancelable.fn, other errors - behaves exactly as before.
 * No file of the user's nodes is changed; the class is wrapped where it is required.
 */

const Module = require('module');
const fs = require('fs');
const path = require('path');

const SETTLED = 'The `onCancel` handler was attached after the promise settled.';

// original class -> the class handed out instead (or the original itself, when it is not 2.x)
const replacements = new WeakMap();
let warned = false;

/** the major version of the p-cancelable package a resolved file belongs to, 0 if unknown */
function majorOf(file) {
    let dir = path.dirname(file);
    for (let i = 0; i < 3; i++) {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
            if (pkg.name === 'p-cancelable') {
                return parseInt(pkg.version, 10) || 0;
            }
        } catch {
            // no package.json at this level - look one further up
        }
        dir = path.dirname(dir);
    }
    return 0;
}

/** the node_modules path of the package whose code attached the handler, for the log */
function origin(stack) {
    const frame = String(stack || '')
        .split('\n')
        .find((line) => line.includes('node_modules') && !line.includes('p-cancelable') && !line.includes('compat.js'));
    const match = frame && frame.match(/\(?((?:\/[^/\s()]+)*?\/node_modules\/(?:@[^/]+\/)?[^/\s()]+)\//);
    return match ? match[1] : 'unknown';
}

function guard(onCancel) {
    const guarded = (handler) => {
        try {
            return onCancel(handler);
        } catch (error) {
            if (!error || error.message !== SETTLED) {
                throw error;
            }
            if (!warned) {
                warned = true;
                console.warn(
                    '[redmatic] ' +
                        origin(error.stack) +
                        ' retried a request whose promise had already settled (got 11, sindresorhus/got#1489);' +
                        ' ignored instead of stopping Node-RED. Updating the node that brings it avoids the retry.'
                );
            }
            return undefined;
        }
    };
    Object.defineProperty(guarded, 'shouldReject', {
        get: () => onCancel.shouldReject,
        set: (value) => {
            onCancel.shouldReject = value;
        }
    });
    return guarded;
}

function wrap(PCancelable) {
    class CompatCancelable extends PCancelable {
        constructor(executor) {
            super((resolve, reject, onCancel) => executor(resolve, reject, guard(onCancel)));
        }

        // p-cancelable 2.x builds its fn() around the class by name, which would bypass the guard
        static fn(userFunction) {
            return (...arguments_) =>
                new CompatCancelable((resolve, reject, onCancel) => {
                    arguments_.push(onCancel);
                    userFunction(...arguments_).then(resolve, reject);
                });
        }
    }
    return CompatCancelable;
}

const load = Module._load;
Module._load = function (request, parent, isMain) {
    const exported = load.apply(this, arguments);
    if (typeof exported !== 'function' || !/(^|\/)p-cancelable(\/index(\.js)?)?$/.test(request)) {
        return exported;
    }
    let replacement = replacements.get(exported);
    if (replacement === undefined) {
        let filename = '';
        try {
            filename = Module._resolveFilename(request, parent, isMain);
        } catch {
            // resolution failed after a successful load - leave the module as it is
        }
        replacement = filename && majorOf(filename) === 2 ? wrap(exported) : exported;
        replacements.set(exported, replacement);
    }
    return replacement;
};
