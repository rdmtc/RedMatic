'use strict';

/*
 * Node-RED's file context store (localfilesystem) rewrites a whole scope file - all of global.json,
 * say - at every flush interval once anything in the scope was set, also when the value set is the
 * one the scope already holds. A flow that stores a state on every event (a common pattern) has the
 * store rewrite the same file every 30 seconds, all day; with a large global context that is
 * hundreds of megabytes an hour on the CCU's SD card.
 *
 * wrapStores() swaps every localfilesystem store for the same Node-RED store with one change: at a
 * flush, a scope whose content is what was last read or written is not written again. The file
 * format, the directory, the flush interval and the flush at Node-RED's stop stay Node-RED's own.
 * The comparison runs on the serialised scope (a hash of it is kept, not the text), so an object a
 * flow changed in place and set again is written as it should be.
 */

const crypto = require('crypto');

const NODE_RED_DIR = '/usr/local/addons/redmatic/lib/node_modules/node-red';
const LABEL = 'localfilesystem, unchanged scopes not rewritten';

function hashOf(value) {
    try {
        return crypto.createHash('sha1').update(JSON.stringify(value) || '').digest('base64');
    } catch {
        // a circular value: no comparison, Node-RED writes it as before
        return null;
    }
}

/**
 * Wraps one Node-RED localfilesystem store instance. Returns the store; `stats` counts the flushes'
 * written and skipped scopes (for tests and the debug log).
 */
function wrapStore(store) {
    const hashes = new Map();
    const stats = {written: 0, skipped: 0};
    store.redmaticStats = stats;

    const open = store.open;
    store.open = function (...args) {
        return Promise.resolve(open.apply(this, args)).then(result => {
            const flush = this._flushPendingWrites;
            if (!this.cache || typeof flush !== 'function') {
                // no cache (every set writes at once) or a Node-RED that works differently: as is
                return result;
            }
            // what was just read from the files counts as written
            const loaded = this.cache._export();
            for (const scope of Object.keys(loaded)) {
                const hash = hashOf(loaded[scope]);
                if (hash) {
                    hashes.set(scope, hash);
                }
            }
            this._flushPendingWrites = function (...flushArgs) {
                const current = this.cache._export();
                const pending = new Map();
                for (const scope of Object.keys(this.pendingWrites)) {
                    const hash = hashOf(current[scope] || {});
                    if (hash && hash === hashes.get(scope)) {
                        delete this.pendingWrites[scope];
                        stats.skipped++;
                    } else {
                        pending.set(scope, hash);
                    }
                }
                stats.written += pending.size;
                return Promise.resolve(flush.apply(this, flushArgs)).then(r => {
                    for (const [scope, hash] of pending) {
                        if (hash) {
                            hashes.set(scope, hash);
                        } else {
                            hashes.delete(scope);
                        }
                    }
                    return r;
                }, error => {
                    // not written: the next flush writes these scopes again
                    for (const scope of pending.keys()) {
                        hashes.delete(scope);
                    }
                    throw error;
                });
            };
            return result;
        });
    };

    // a deleted scope's file is gone: a scope set again later is written even if equal
    const del = store.delete;
    store.delete = function (scope, ...args) {
        hashes.delete(scope);
        return del.call(this, scope, ...args);
    };
    // a deploy removes the scopes (memory and files) of removed nodes and flows: their hashes go,
    // so such a scope set again later is written; global and the scopes still in use keep theirs
    const clean = store.clean;
    store.clean = function (...args) {
        return Promise.resolve(clean.apply(this, args)).then(result => {
            const kept = this.cache ? this.cache._export() : {};
            for (const scope of [...hashes.keys()]) {
                if (!Object.prototype.hasOwnProperty.call(kept, scope)) {
                    hashes.delete(scope);
                }
            }
            return result;
        });
    };
    return store;
}

/** The module function Node-RED calls with a store's config, around Node-RED's own localfilesystem. */
function storeModule(original) {
    const create = typeof original === 'function' ? original : require(original);
    const factory = config => wrapStore(create(config));
    // Node-RED logs a module's own toString as "Context store : 'file' [module=...]"
    Object.defineProperty(factory, 'toString', {value: () => LABEL});
    return factory;
}

/**
 * Swaps every localfilesystem store of contextStorage (as lib/settings.js hands it to Node-RED) for
 * the wrapped one. `original` is Node-RED's localfilesystem module (path or function); when it
 * cannot be found the stores stay Node-RED's own. Returns the names of the swapped stores.
 */
function wrapStores(contextStorage, {original, log = console.warn} = {}) {
    let module;
    try {
        const target = original || require.resolve('@node-red/runtime/lib/nodes/context/localfilesystem', {paths: [NODE_RED_DIR]});
        module = storeModule(target);
    } catch (error) {
        log(`[redmatic] Node-RED's file context store not found (${error.message}), stores left as they are`);
        return [];
    }
    const swapped = [];
    for (const [name, store] of Object.entries(contextStorage || {})) {
        if (store && store.module === 'localfilesystem') {
            store.module = module;
            swapped.push(name);
        }
    }
    return swapped;
}

module.exports = {wrapStores, wrapStore, storeModule, LABEL};
