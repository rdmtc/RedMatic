'use strict';

// lib/update-redmatic-nodes.js: after an update of RedMatic itself, RedMatic-HomeKit and
// RedMatic-Matter in Node-RED's userDir are updated too - when the setting is on (the default, also
// without a stored value), only when they are installed, to the highest version that accepts this
// Node.js and Node-RED, in one npm run and with one restart of Node-RED. A failing registry or npm
// is recorded and tried again at the next start, three times. bin/redmaticLoader starts it beside
// Node-RED and restarts Node-RED once when it leaves var/restart_once.
// Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const ADDON = path.join(__dirname, '..', 'addon_files', 'redmatic');
const MODULE = path.join(ADDON, 'lib', 'update-redmatic-nodes.js');
const LOADER = path.join(ADDON, 'bin', 'redmaticLoader');
const semver = require(require.resolve('semver', {paths: [path.dirname(require.resolve('npm/package.json'))]}));
const {
    MAX_ATTEMPTS, INSTALL_ARGS, enabled, pinned, installedPackages, decide, parseView, pickVersion, errorText, run,
    writeStateFile, runAlive, nodeRedPids, answers
} = require(MODULE);

function scratch(t) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'redmatic-nodes-'));
    t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
    return tmp;
}

function writeJson(file, data) {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, JSON.stringify(data));
}

test('the setting is on unless it is false - a settings.json from before it has no value', () => {
    assert.strictEqual(enabled({}), true);
    assert.strictEqual(enabled(undefined), true);
    assert.strictEqual(enabled({updateRedmaticNodes: true}), true);
    assert.strictEqual(enabled({updateRedmaticNodes: 'false'}), true);
    assert.strictEqual(enabled({updateRedmaticNodes: false}), false);
});

test('the default settings of a fresh install switch it on', () => {
    const defaults = JSON.parse(fs.readFileSync(path.join(ADDON, 'etc', 'default-settings.json'), 'utf8'));
    assert.strictEqual(defaults.updateRedmaticNodes, true);
});

test('pinned: an exact version or a source that is not the registry; the palette\'s ranges are not', () => {
    for (const spec of ['~4.1.4', '^4.1.4', '>=4', '4.x', '*', '', undefined, null]) {
        assert.strictEqual(pinned(spec, semver), false, String(spec));
    }
    for (const spec of ['4.1.4', 'v4.1.4', '4.2.0-beta.1', 'file:../redmatic-homekit-4.1.4.tgz', 'github:rdmtc/RedMatic-HomeKit',
        'git+https://github.com/rdmtc/RedMatic-HomeKit.git#v4.0.0', 'https://example.org/x.tgz', 'next']) {
        assert.strictEqual(pinned(spec, semver), true, spec);
    }
});

test('installed: listed in the userDir\'s package.json or present in its node_modules; other nodes are not looked at', t => {
    const tmp = scratch(t);
    assert.deepStrictEqual(installedPackages(tmp), {});
    writeJson(path.join(tmp, 'package.json'), {dependencies: {'node-red-contrib-ccu': '4.14.1', 'node-red-dashboard': '~3.6.0'}});
    writeJson(path.join(tmp, 'node_modules', 'node-red-dashboard', 'package.json'), {name: 'node-red-dashboard', version: '3.6.0'});
    assert.deepStrictEqual(installedPackages(tmp), {});

    writeJson(path.join(tmp, 'package.json'), {dependencies: {'redmatic-homekit': '~4.1.4', 'redmatic-matter': '~1.0.1'}});
    writeJson(path.join(tmp, 'node_modules', 'redmatic-homekit', 'package.json'), {name: 'redmatic-homekit', version: '4.1.4'});
    assert.deepStrictEqual(installedPackages(tmp), {
        'redmatic-homekit': {version: '4.1.4', spec: '~4.1.4'},
        // listed, but its directory is gone (an npm run that was cut off): still to be installed
        'redmatic-matter': {version: undefined, spec: '~1.0.1'}
    });

    writeJson(path.join(tmp, 'package.json'), {});
    assert.deepStrictEqual(installedPackages(tmp), {'redmatic-homekit': {version: '4.1.4', spec: undefined}});
});

test('decide: which start runs the update', async t => {
    const both = {'redmatic-homekit': {version: '4.1.4', spec: '~4.1.4'}, 'redmatic-matter': {version: '1.0.1', spec: '~1.0.1'}};
    const cases = [
        {
            name: 'no state file, packages installed (the update that brings the feature): run',
            in: {state: undefined, settings: {}, installed: both},
            out: {action: 'run', attempts: 1}
        },
        {
            name: 'no state file, nothing installed (a fresh install): recorded, no run',
            in: {state: undefined, settings: {}, installed: {}},
            out: {action: 'record', state: 'not-installed'}
        },
        {
            name: 'first start after an update, the setting has no value: run',
            in: {state: {addon: '10.0.0', state: 'updated'}, settings: {npmCache: 'storage'}, installed: both},
            out: {action: 'run', attempts: 1}
        },
        {
            name: 'first start after an update, the setting on: run',
            in: {state: {addon: '10.0.0', state: 'current'}, settings: {updateRedmaticNodes: true}, installed: both},
            out: {action: 'run', attempts: 1}
        },
        {
            name: 'first start after an update, the setting off: recorded, no run',
            in: {state: {addon: '10.0.0', state: 'updated'}, settings: {updateRedmaticNodes: false}, installed: both},
            out: {action: 'record', state: 'disabled'}
        },
        {
            name: 'first start after an update, only one package installed: run',
            in: {state: {addon: '10.0.0', state: 'updated'}, settings: {}, installed: {'redmatic-matter': both['redmatic-matter']}},
            out: {action: 'run', attempts: 1}
        },
        {
            name: 'first start after an update, neither installed: recorded, no run',
            in: {state: {addon: '10.0.0', state: 'updated'}, settings: {}, installed: {}},
            out: {action: 'record', state: 'not-installed'}
        },
        {
            name: 'a downgrade of RedMatic is another version too: run',
            in: {state: {addon: '10.2.0', state: 'updated'}, settings: {}, installed: both},
            out: {action: 'run', attempts: 1}
        },
        ...['updated', 'current', 'disabled', 'not-installed', 'gave-up'].map(state => ({
            name: `a normal start (same version, ${state}): nothing`,
            in: {state: {addon: '10.1.0', state, attempts: 3}, settings: {}, installed: both},
            out: {action: 'none'}
        })),
        {
            name: 'a normal start with the setting off: nothing, not even a record',
            in: {state: {addon: '10.1.0', state: 'disabled'}, settings: {updateRedmaticNodes: false}, installed: both},
            out: {action: 'none'}
        },
        {
            name: 'the same version, the last attempt failed: the next start tries again',
            in: {state: {addon: '10.1.0', state: 'failed', attempts: 1}, settings: {}, installed: both},
            out: {action: 'run', attempts: 2, reason: 'the last attempt failed'}
        },
        {
            name: 'failed, and the setting was switched off meanwhile: no further attempt',
            in: {state: {addon: '10.1.0', state: 'failed', attempts: 1}, settings: {updateRedmaticNodes: false}, installed: both},
            out: {action: 'record', state: 'disabled'}
        },
        {
            name: `failed ${MAX_ATTEMPTS} times: given up until the next RedMatic update`,
            in: {state: {addon: '10.1.0', state: 'failed', attempts: MAX_ATTEMPTS}, settings: {}, installed: both},
            out: {action: 'record', state: 'gave-up'}
        },
        {
            name: 'a run that was cut off (still "running", its process gone) counts as an attempt',
            in: {state: {addon: '10.1.0', state: 'running', attempts: 1, pid: 4711}, settings: {}, installed: both, alive: false},
            out: {action: 'run', attempts: 2, reason: 'the last run was cut off'}
        },
        {
            name: 'a run that is still going on: nothing (no second npm beside it)',
            in: {state: {addon: '10.1.0', state: 'running', attempts: 1, pid: 4711}, settings: {}, installed: both, alive: true},
            out: {action: 'none'}
        },
        {
            name: 'a failed attempt of an earlier version does not count for the new one',
            in: {state: {addon: '10.0.0', state: 'failed', attempts: 2}, settings: {}, installed: both},
            out: {action: 'run', attempts: 1}
        }
    ];
    for (const c of cases) {
        await t.test(c.name, () => {
            const result = decide(Object.assign({addonVersion: '10.1.0'}, c.in));
            for (const key of Object.keys(c.out)) {
                assert.strictEqual(result[key], c.out[key], key);
            }
            assert.ok(result.reason);
        });
    }
});

test('parseView: npm view\'s one object, its array, nothing, "no match" and an error', () => {
    assert.deepStrictEqual(parseView(''), []);
    assert.deepStrictEqual(parseView('{"version":"1.0.2"}'), [{version: '1.0.2'}]);
    assert.deepStrictEqual(parseView('[{"version":"1.0.1"},{"version":"1.0.2"}]'), [{version: '1.0.1'}, {version: '1.0.2'}]);
    assert.deepStrictEqual(parseView('{"error":{"code":"E404","summary":"No match found for version >9.0.1"}}'), []);
    assert.throws(() => parseView('{"error":{"code":"ETIMEDOUT","summary":"request failed"}}'), /request failed/);
    assert.throws(() => parseView('<html>captive portal</html>'));
});

test('pickVersion: the highest version that fits, never a prerelease, a downgrade or one above latest', () => {
    const tags = {latest: '4.2.0', next: '5.0.0-beta.1'};
    const v = (version, node, red) => ({version, engines: node ? {node} : undefined, 'node-red': red ? {version: red} : {}, 'dist-tags': tags});
    const env = {installed: '4.1.4', nodeVersion: '26.13.1', redVersion: '5.0.10', semver};

    assert.strictEqual(pickVersion([v('4.1.5', '>=22'), v('4.2.0', '^22.12 || >=24', '>=4.0.0')], env), '4.2.0');
    assert.strictEqual(pickVersion([v('4.2.0', '>=22'), v('4.1.5', '>=22')], env), '4.2.0', 'order does not matter');
    assert.strictEqual(pickVersion([], env), undefined);
    assert.strictEqual(pickVersion([v('4.1.4'), v('4.0.0')], env), undefined, 'nothing newer');
    assert.strictEqual(pickVersion([v('5.0.0-beta.1')], env), undefined, 'a prerelease');
    assert.strictEqual(pickVersion([v('4.3.0')], env), undefined, 'published, but above the dist-tag latest');
    assert.strictEqual(pickVersion([v('4.1.5', '>=22'), v('4.2.0', '>=28')], env), '4.1.5', 'the newest needs another Node.js');
    assert.strictEqual(pickVersion([v('4.1.5', '>=22', '>=4'), v('4.2.0', '>=22', '>=6.0.0')], env), '4.1.5', 'the newest needs another Node-RED');
    assert.strictEqual(pickVersion([v('4.2.0', '>=22', '>=5.0.0')], Object.assign({}, env, {redVersion: '5.1.0-beta.2'})), '4.2.0', 'a Node-RED beta counts as its version');
    assert.strictEqual(pickVersion([v('4.2.0')], env), '4.2.0', 'no engines, no node-red.version');
    assert.strictEqual(pickVersion([v('4.2.0'), v('4.1.0')], Object.assign({}, env, {installed: undefined})), '4.2.0', 'installed version unknown');
    assert.strictEqual(pickVersion([{version: '4.2.0'}], env), '4.2.0', 'no dist-tags in the answer');
    assert.strictEqual(pickVersion([null, {}, {version: 'x'}], env), undefined);
});

test('errorText: npm\'s own error lines, short', () => {
    const err = new Error('Command failed: node npm-cli.js install');
    err.stderr = 'npm warn something\nnpm error code ENOTFOUND\nnpm error syscall getaddrinfo\nnpm error errno ENOTFOUND\nnpm error network request to https://registry.npmjs.org/x failed\nnpm error A complete log of this run can be found in: /x\n';
    assert.strictEqual(errorText(err), 'npm error code ENOTFOUND; npm error network request to https://registry.npmjs.org/x failed');
    assert.strictEqual(errorText(new Error('spawn ENOMEM\nat x')), 'spawn ENOMEM');
    assert.ok(errorText(new Error('x'.repeat(1000))).length <= 300);
});

// run() with everything outside replaced: a registry that knows `registry[name]` (npm view's JSON
// text, or an Error to reject with - an array plays one answer per call), an npm install that
// installs what it is asked for unless `installFails`, and a Node-RED that runs unless `nodeRed` is false.
function world({state, settings = {}, addonVersion = '10.1.0', installed, registry = {}, installFails, installDoesNothing, nodeRed = true, alive = false}) {
    const w = {
        state,
        installed: JSON.parse(JSON.stringify(installed || {})),
        states: [], views: [], installs: [], restarts: 0, sleeps: [], logs: [], waited: 0
    };
    w.io = {
        settings, addonVersion, nodeVersion: '26.13.1', redVersion: '5.0.10', semver, pid: 4242,
        now: () => 1795000000,
        readState: () => w.state,
        writeState: s => {
            w.state = JSON.parse(JSON.stringify(s));
            w.states.push(w.state);
        },
        installed: () => JSON.parse(JSON.stringify(w.installed)),
        alive: () => alive,
        log: (level, message) => w.logs.push(`${level}: ${message}`),
        sleep: async ms => {
            w.sleeps.push(ms);
        },
        waitForNodeRed: async () => {
            w.waited++;
        },
        view: async (name, range) => {
            w.views.push(`${name}@${range}`);
            let answer = registry[name];
            if (Array.isArray(answer)) {
                answer = answer.length > 1 ? answer.shift() : answer[0];
            }
            if (answer instanceof Error) {
                throw answer;
            }
            return answer === undefined ? '' : answer;
        },
        install: async specs => {
            w.installs.push(specs.slice());
            if (installFails) {
                const err = new Error('Command failed');
                err.stderr = 'npm error code ENOSPC\nnpm error nospc no space left on device\n';
                throw err;
            }
            if (!installDoesNothing) {
                for (const spec of specs) {
                    const at = spec.lastIndexOf('@');
                    w.installed[spec.slice(0, at)] = {version: spec.slice(at + 1), spec: '~' + spec.slice(at + 1)};
                }
            }
        },
        restartNodeRed: async () => {
            if (nodeRed) {
                w.restarts++;
            }
            return nodeRed;
        }
    };
    return w;
}

const HOMEKIT = {version: '4.1.4', spec: '~4.1.4'};
const MATTER = {version: '1.0.1', spec: '~1.0.1'};
const answer = (...versions) => JSON.stringify(versions.map(version => ({
    version, engines: {node: '^22.13 || >=24'}, 'node-red': {version: '>=4.0.0'}, 'dist-tags': {latest: versions[versions.length - 1]}
})));
const offline = () => Object.assign(new Error('Command failed'), {stderr: 'npm error code ENOTFOUND\nnpm error network request to https://registry.npmjs.org/redmatic-homekit failed\n'});

test('first start after an update: both packages updated in one npm run, Node-RED restarted once', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'},
        installed: {'redmatic-homekit': HOMEKIT, 'redmatic-matter': MATTER},
        registry: {'redmatic-homekit': answer('4.1.5', '4.2.0'), 'redmatic-matter': answer('1.0.2')}
    });
    const result = await run(w.io);
    assert.deepStrictEqual(w.views, ['redmatic-homekit@>4.1.4', 'redmatic-matter@>1.0.1']);
    assert.deepStrictEqual(w.installs, [['redmatic-homekit@4.2.0', 'redmatic-matter@1.0.2']]);
    assert.strictEqual(w.restarts, 1);
    assert.strictEqual(w.waited, 1, 'waited for Node-RED before npm');
    assert.deepStrictEqual(result, {
        addon: '10.1.0', from: '10.0.0', ts: 1795000000, state: 'updated', attempts: 1, restarted: true,
        packages: {
            'redmatic-homekit': {installed: '4.1.4', target: '4.2.0', result: 'updated'},
            'redmatic-matter': {installed: '1.0.1', target: '1.0.2', result: 'updated'}
        }
    });
    assert.deepStrictEqual(w.state, result);
    // while it ran, the state file said so (the settings page shows it, a second loader sees the pid)
    assert.strictEqual(w.states[0].state, 'running');
    assert.strictEqual(w.states[0].pid, 4242);
    assert.strictEqual(w.states.find(s => s.phase === 'install').state, 'running');
});

test('only the installed package is asked for and installed; one that is current stays', async () => {
    let w = world({state: {addon: '10.0.0', state: 'current'}, installed: {'redmatic-matter': MATTER}, registry: {'redmatic-matter': answer('1.0.2')}});
    await run(w.io);
    assert.deepStrictEqual(w.views, ['redmatic-matter@>1.0.1']);
    assert.deepStrictEqual(w.installs, [['redmatic-matter@1.0.2']]);
    assert.strictEqual(w.restarts, 1);

    w = world({
        state: undefined,
        installed: {'redmatic-homekit': HOMEKIT, 'redmatic-matter': MATTER},
        registry: {'redmatic-homekit': '{"error":{"code":"E404","summary":"No match found for version >4.1.4"}}', 'redmatic-matter': answer('1.0.2')}
    });
    const result = await run(w.io);
    assert.deepStrictEqual(w.installs, [['redmatic-matter@1.0.2']]);
    assert.deepStrictEqual(result.packages['redmatic-homekit'], {installed: '4.1.4', result: 'current'});
    assert.strictEqual(result.packages['redmatic-matter'].result, 'updated');
    assert.strictEqual(result.from, undefined);
});

test('nothing newer: no npm install, no restart', async () => {
    const w = world({state: {addon: '10.0.0', state: 'current'}, installed: {'redmatic-homekit': HOMEKIT, 'redmatic-matter': MATTER}});
    const result = await run(w.io);
    assert.deepStrictEqual(w.installs, []);
    assert.strictEqual(w.restarts, 0);
    assert.strictEqual(result.state, 'current');
});

test('the setting off: no registry request, no npm, no restart - recorded once per RedMatic update', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'updated'}, settings: {updateRedmaticNodes: false},
        installed: {'redmatic-homekit': HOMEKIT, 'redmatic-matter': MATTER},
        registry: {'redmatic-homekit': answer('4.2.0'), 'redmatic-matter': answer('1.0.2')}
    });
    const result = await run(w.io);
    assert.deepStrictEqual([w.views, w.installs, w.restarts, w.waited], [[], [], 0, 0]);
    assert.deepStrictEqual(result, {addon: '10.1.0', from: '10.0.0', ts: 1795000000, state: 'disabled'});
    // the next start, and one with the setting switched on again: nothing until the next RedMatic update
    assert.strictEqual(await run(w.io), undefined);
    w.io.settings = {updateRedmaticNodes: true};
    assert.strictEqual(await run(w.io), undefined);
    assert.strictEqual(w.states.length, 1);
});

test('a normal start does nothing at all', async () => {
    const w = world({
        state: {addon: '10.1.0', state: 'updated'},
        installed: {'redmatic-homekit': HOMEKIT}, registry: {'redmatic-homekit': answer('4.2.0')}
    });
    assert.strictEqual(await run(w.io), undefined);
    assert.deepStrictEqual([w.views, w.installs, w.restarts, w.states], [[], [], 0, []]);
});

test('neither package installed: recorded, nothing else', async () => {
    const w = world({state: undefined, installed: {}});
    const result = await run(w.io);
    assert.deepStrictEqual(result, {addon: '10.1.0', ts: 1795000000, state: 'not-installed'});
    assert.deepStrictEqual([w.views, w.installs, w.restarts], [[], [], 0]);
});

test('a pinned package is left alone, the other one is updated', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'},
        installed: {'redmatic-homekit': {version: '4.0.0', spec: '4.0.0'}, 'redmatic-matter': MATTER},
        registry: {'redmatic-homekit': answer('4.2.0'), 'redmatic-matter': answer('1.0.2')}
    });
    const result = await run(w.io);
    assert.deepStrictEqual(w.views, ['redmatic-matter@>1.0.1']);
    assert.deepStrictEqual(w.installs, [['redmatic-matter@1.0.2']]);
    assert.deepStrictEqual(result.packages['redmatic-homekit'], {installed: '4.0.0', result: 'pinned', spec: '4.0.0'});
});

test('the registry does not answer: three tries, then failed - nothing thrown, nothing installed, no restart', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'},
        installed: {'redmatic-homekit': HOMEKIT, 'redmatic-matter': MATTER},
        registry: {'redmatic-homekit': offline(), 'redmatic-matter': answer('1.0.2')}
    });
    const result = await run(w.io);
    assert.strictEqual(w.views.length, 3);
    assert.strictEqual(w.sleeps.length, 2);
    assert.deepStrictEqual([w.installs, w.restarts], [[], 0]);
    assert.strictEqual(result.state, 'failed');
    assert.strictEqual(result.attempts, 1);
    assert.match(result.error, /ENOTFOUND/);
    assert.strictEqual(result.pid, undefined);
    assert.ok(w.logs.some(l => /^warn: .*update failed \(attempt 1\/3, next attempt at the next start\)/.test(l)), w.logs.join('\n'));
});

test('a registry that answers at the second try is enough', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'}, installed: {'redmatic-homekit': HOMEKIT},
        registry: {'redmatic-homekit': [offline(), answer('4.2.0')]}
    });
    const result = await run(w.io);
    assert.strictEqual(result.state, 'updated');
    assert.strictEqual(w.views.length, 2);
});

test('failed attempts: tried again at the next two starts, then left until the next RedMatic update', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'}, installed: {'redmatic-homekit': HOMEKIT},
        registry: {'redmatic-homekit': answer('4.2.0')}, installFails: true
    });
    let result = await run(w.io);
    assert.deepStrictEqual([result.state, result.attempts], ['failed', 1]);
    assert.match(result.error, /ENOSPC/);
    assert.strictEqual(w.restarts, 0);
    result = await run(w.io);
    assert.deepStrictEqual([result.state, result.attempts], ['failed', 2]);
    result = await run(w.io);
    assert.deepStrictEqual([result.state, result.attempts], ['gave-up', 3]);
    assert.strictEqual(w.installs.length, 3);
    // the fourth start and every later one: nothing
    assert.strictEqual(await run(w.io), undefined);
    assert.strictEqual(w.installs.length, 3);
    // the next RedMatic update starts over
    w.io.addonVersion = '10.2.0';
    result = await run(w.io);
    assert.deepStrictEqual([result.state, result.attempts, result.from], ['failed', 1, '10.1.0']);
});

test('a failed attempt that succeeds at the next start', async () => {
    const w = world({
        state: {addon: '10.1.0', state: 'failed', attempts: 1, error: 'x'}, installed: {'redmatic-homekit': HOMEKIT},
        registry: {'redmatic-homekit': answer('4.2.0')}
    });
    const result = await run(w.io);
    assert.deepStrictEqual([result.state, result.attempts, result.error], ['updated', 2, undefined]);
    assert.strictEqual(w.restarts, 1);
});

test('npm ends without an error but the version is not there: failed, no restart', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'}, installed: {'redmatic-homekit': HOMEKIT},
        registry: {'redmatic-homekit': answer('4.2.0')}, installDoesNothing: true
    });
    const result = await run(w.io);
    assert.strictEqual(result.state, 'failed');
    assert.match(result.error, /redmatic-homekit is 4\.1\.4 instead of 4\.2\.0/);
    assert.strictEqual(w.restarts, 0);
});

test('updated while Node-RED is not running: nothing to restart', async () => {
    const w = world({
        state: {addon: '10.0.0', state: 'current'}, installed: {'redmatic-homekit': HOMEKIT},
        registry: {'redmatic-homekit': answer('4.2.0')}, nodeRed: false
    });
    const result = await run(w.io);
    assert.deepStrictEqual([result.state, result.restarted], ['updated', false]);
});

test('a second loader while a run is going on does nothing; a run that was cut off is taken up again', async () => {
    const state = {addon: '10.1.0', state: 'running', attempts: 1, pid: 99};
    let w = world({state, installed: {'redmatic-homekit': HOMEKIT}, registry: {'redmatic-homekit': answer('4.2.0')}, alive: true});
    assert.strictEqual(await run(w.io), undefined);
    assert.deepStrictEqual(w.installs, []);
    w = world({state, installed: {'redmatic-homekit': HOMEKIT}, registry: {'redmatic-homekit': answer('4.2.0')}, alive: false});
    const result = await run(w.io);
    assert.deepStrictEqual([result.state, result.attempts], ['updated', 2]);
});

test('a package whose directory is gone (listed in package.json only) is installed again', async () => {
    const w = world({
        state: {addon: '10.1.0', state: 'running', attempts: 1, pid: 99},
        installed: {'redmatic-matter': {version: undefined, spec: '~1.0.1'}},
        registry: {'redmatic-matter': answer('1.0.1', '1.0.2')}
    });
    const result = await run(w.io);
    assert.deepStrictEqual(w.views, ['redmatic-matter@*']);
    assert.deepStrictEqual(w.installs, [['redmatic-matter@1.0.2']]);
    assert.strictEqual(result.state, 'updated');
});

test('the state file: written whole, readable for the web server', t => {
    const tmp = scratch(t);
    const file = path.join(tmp, 'redmatic-nodes-update.json');
    writeStateFile(file, {addon: '10.1.0', state: 'current'});
    writeStateFile(file, {addon: '10.1.0', state: 'updated'});
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(file, 'utf8')), {addon: '10.1.0', state: 'updated'});
    assert.strictEqual(fs.statSync(file).mode & 0o044, 0o044);
    assert.deepStrictEqual(fs.readdirSync(tmp), ['redmatic-nodes-update.json']);
});

// www/nodes_update.cgi in a real tclsh, its state file pointed at the test's (CI installs tcl, and
// there a missing tclsh fails the test instead of skipping it)
const tclsh = spawnSync('tclsh', [], {input: 'exit 0', stdio: ['pipe', 'ignore', 'ignore']});
const noTclsh = Boolean(tclsh.error) || tclsh.status !== 0;

test('tclsh is there (CI)', {skip: !process.env.CI && 'only required in CI'}, () => {
    assert.strictEqual(noTclsh, false);
});

test('the settings page reads the state file from www/nodes_update.cgi: the file as JSON, {} without one', {skip: noTclsh && !process.env.CI && 'tclsh is not installed'}, t => {
    const tmp = scratch(t);
    const stateFile = path.join(tmp, 'redmatic-nodes-update.json');
    const cgi = path.join(tmp, 'nodes_update.cgi');
    const source = fs.readFileSync(path.join(ADDON, 'www', 'nodes_update.cgi'), 'utf8');
    assert.ok(source.includes('/usr/local/addons/redmatic/var/redmatic-nodes-update.json'));
    fs.writeFileSync(cgi, source.replace('/usr/local/addons/redmatic/var/redmatic-nodes-update.json', stateFile));
    const get = () => {
        const r = spawnSync('tclsh', [cgi], {encoding: 'utf8', env: {PATH: process.env.PATH, REQUEST_METHOD: 'GET'}});
        assert.strictEqual(r.status, 0, r.stderr);
        const head = 'Content-Type: application/json; charset=utf-8\r\n\r\n';
        assert.ok(r.stdout.startsWith(head), r.stdout);
        return JSON.parse(r.stdout.slice(head.length));
    };
    assert.deepStrictEqual(get(), {});
    const state = {addon: '10.1.0', state: 'updated', packages: {'redmatic-homekit': {installed: '4.1.4', target: '4.2.0', result: 'updated'}}};
    writeStateFile(stateFile, state);
    assert.deepStrictEqual(get(), state);
    fs.writeFileSync(stateFile, '');
    assert.deepStrictEqual(get(), {});
    assert.ok(fs.statSync(path.join(ADDON, 'www', 'nodes_update.cgi')).mode & 0o111, 'executable');
    // not a link out of www/ (openccu-lite serves none), and no state file shipped: an update of the
    // addon would overwrite the record of the last run
    assert.strictEqual(fs.existsSync(path.join(ADDON, 'www', 'nodes_update.json')), false);
    assert.strictEqual(fs.existsSync(path.join(ADDON, 'var', 'redmatic-nodes-update.json')), false);
});

test('runAlive and nodeRedPids read /proc', t => {
    const proc = scratch(t);
    fs.mkdirSync(path.join(proc, '100'));
    fs.writeFileSync(path.join(proc, '100', 'cmdline'), 'node\0/usr/local/addons/redmatic/lib/update-redmatic-nodes.js\0run\0');
    fs.writeFileSync(path.join(proc, '100', 'comm'), 'node\n');
    fs.mkdirSync(path.join(proc, '200'));
    fs.writeFileSync(path.join(proc, '200', 'cmdline'), 'node-red\0');
    fs.writeFileSync(path.join(proc, '200', 'comm'), 'node-red\n');
    fs.mkdirSync(path.join(proc, 'self'));
    assert.strictEqual(runAlive(100, proc), true);
    assert.strictEqual(runAlive(200, proc), false, 'the pid is someone else\'s now');
    assert.strictEqual(runAlive(300, proc), false);
    assert.deepStrictEqual(nodeRedPids(proc), [200]);
    assert.deepStrictEqual(nodeRedPids(path.join(proc, 'none')), []);
});

test('answers: any HTTP answer counts as Node-RED being there, a closed port does not', async t => {
    const server = require('node:http').createServer((req, res) => {
        res.statusCode = 401;
        res.end();
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    assert.strictEqual(await answers(`http://127.0.0.1:${port}/`), true);
    await new Promise(resolve => server.close(resolve));
    assert.strictEqual(await answers(`http://127.0.0.1:${port}/`), false);
});

// --- the script itself, with a pretend addon directory and a pretend npm ------------------------
// lib/node_modules/npm/bin/npm-cli.js records its arguments, answers `view` from registry.json and
// "installs" by writing the modules' package.json; semver is the real one.
function addon(t, {settings = {}, version = '10.1.0', state, registry = {}}) {
    const dir = scratch(t);
    writeJson(path.join(dir, 'etc', 'settings.json'), settings);
    fs.writeFileSync(path.join(dir, 'versions'), `export NODE_VERSION=26.13.1\nexport VERSION_ADDON=${version}\nexport RED_VERSION=5.0.10\n`);
    writeJson(path.join(dir, 'var', 'package.json'), {dependencies: {'node-red-contrib-ccu': '4.14.1', 'node-red-dashboard': '~3.6.0', 'redmatic-homekit': '~4.1.4', 'redmatic-matter': '~1.0.1'}});
    writeJson(path.join(dir, 'var', 'node_modules', 'redmatic-homekit', 'package.json'), {name: 'redmatic-homekit', version: '4.1.4'});
    writeJson(path.join(dir, 'var', 'node_modules', 'redmatic-matter', 'package.json'), {name: 'redmatic-matter', version: '1.0.1'});
    writeJson(path.join(dir, 'var', 'node_modules', 'node-red-dashboard', 'package.json'), {name: 'node-red-dashboard', version: '3.6.0'});
    if (state) {
        writeJson(path.join(dir, 'var', 'redmatic-nodes-update.json'), state);
    }
    const npm = path.join(dir, 'lib', 'node_modules', 'npm');
    fs.mkdirSync(path.join(npm, 'bin'), {recursive: true});
    fs.mkdirSync(path.join(npm, 'node_modules'));
    fs.symlinkSync(path.dirname(require.resolve('semver/package.json', {paths: [path.dirname(require.resolve('npm/package.json'))]})), path.join(npm, 'node_modules', 'semver'));
    writeJson(path.join(npm, 'registry.json'), registry);
    fs.writeFileSync(path.join(npm, 'bin', 'npm-cli.js'), `
        const fs = require('fs');
        const path = require('path');
        const args = process.argv.slice(2);
        fs.appendFileSync(path.join(__dirname, '..', 'calls.log'), JSON.stringify({cwd: process.cwd(), args}) + '\\n');
        const rest = args.slice(args.indexOf('--') + 1);
        if (args[0] === 'view') {
            const answer = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'registry.json'), 'utf8'))[rest[0].split('@')[0]];
            if (answer === undefined) {
                console.error('npm error code ENOTFOUND\\nnpm error network request failed');
                process.exit(1);
            }
            if (answer.error) {
                console.log(JSON.stringify(answer));
                process.exit(1);
            }
            console.log(JSON.stringify(answer));
        } else if (args[0] === 'install') {
            for (const spec of rest) {
                const [name, version] = spec.split('@');
                fs.writeFileSync(path.join(process.cwd(), 'node_modules', name, 'package.json'), JSON.stringify({name, version}));
            }
        }
    `);
    return dir;
}

function runScript(dir) {
    const bin = path.join(dir, 'stubs');
    fs.mkdirSync(bin, {recursive: true});
    fs.writeFileSync(path.join(bin, 'logger'), `#!/bin/sh\necho "$@" >> ${path.join(dir, 'logger.log')}\n`, {mode: 0o755});
    const result = spawnSync(process.execPath, [MODULE, 'run'], {
        encoding: 'utf8',
        env: {PATH: bin + ':' + process.env.PATH, REDMATIC_ADDON_DIR: dir, REDMATIC_NODES_UPDATE_WAIT_MS: '0'}
    });
    const read = file => {
        try {
            return fs.readFileSync(path.join(dir, file), 'utf8');
        } catch {
            return '';
        }
    };
    return {
        status: result.status,
        output: result.stdout + result.stderr,
        calls: read('lib/node_modules/npm/calls.log').split('\n').filter(Boolean).map(l => JSON.parse(l)),
        state: read('var/redmatic-nodes-update.json') ? JSON.parse(read('var/redmatic-nodes-update.json')) : undefined,
        version: name => JSON.parse(read(`var/node_modules/${name}/package.json`)).version,
        log: read('logger.log')
    };
}

const entry = version => ({version, engines: {node: '>=24'}, 'node-red': {version: '>=4.0.0'}, 'dist-tags': {latest: version}});

test('the script: first start after an update - npm view per package, one npm install in var/ with the palette\'s arguments', t => {
    const dir = addon(t, {
        state: {addon: '10.0.0', state: 'current'},
        registry: {'redmatic-homekit': [entry('4.1.5'), Object.assign(entry('4.2.0'), {'dist-tags': {latest: '4.2.0'}})], 'redmatic-matter': entry('1.0.2')}
    });
    const r = runScript(dir);
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls.map(c => c.args[0]), ['view', 'view', 'install']);
    assert.deepStrictEqual(r.calls[0].args.slice(-5), ['redmatic-homekit@>4.1.4', 'version', 'engines', 'node-red', 'dist-tags']);
    const install = r.calls[2];
    assert.strictEqual(fs.realpathSync(install.cwd), fs.realpathSync(path.join(dir, 'var')));
    assert.deepStrictEqual(install.args, ['install', ...INSTALL_ARGS, '--', 'redmatic-homekit@4.2.0', 'redmatic-matter@1.0.2']);
    assert.strictEqual(r.version('redmatic-homekit'), '4.2.0');
    assert.strictEqual(r.version('redmatic-matter'), '1.0.2');
    assert.strictEqual(r.version('node-red-dashboard'), '3.6.0');
    assert.strictEqual(r.state.state, 'updated');
    assert.strictEqual(r.state.from, '10.0.0');
    // no Node-RED in the test: nothing was signalled, and no restart_once is left for the loader
    assert.strictEqual(r.state.restarted, false);
    assert.strictEqual(fs.existsSync(path.join(dir, 'var', 'restart_once')), false);
    assert.match(r.log, /-t redmatic -p daemon\.info updated redmatic-homekit@4\.2\.0 redmatic-matter@1\.0\.2/);
});

test('the script: the setting off - npm is not started at all', t => {
    const dir = addon(t, {settings: {updateRedmaticNodes: false}, registry: {'redmatic-homekit': entry('4.2.0'), 'redmatic-matter': entry('1.0.2')}});
    const r = runScript(dir);
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls, []);
    assert.strictEqual(r.state.state, 'disabled');
    assert.strictEqual(r.version('redmatic-homekit'), '4.1.4');
    assert.strictEqual(r.version('redmatic-matter'), '1.0.1');
});

test('the script: a settings.json without the value, no state file yet (the update that brings the feature) - updated', t => {
    const dir = addon(t, {settings: {npmCache: 'storage'}, registry: {'redmatic-homekit': {error: {code: 'E404', summary: 'No match found'}}, 'redmatic-matter': entry('1.0.2')}});
    const r = runScript(dir);
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls.map(c => c.args[0]), ['view', 'view', 'install']);
    assert.strictEqual(r.version('redmatic-homekit'), '4.1.4');
    assert.strictEqual(r.version('redmatic-matter'), '1.0.2');
    assert.strictEqual(r.state.packages['redmatic-homekit'].result, 'current');
});

test('the script: a normal start - npm is not started', t => {
    const dir = addon(t, {state: {addon: '10.1.0', state: 'updated'}, registry: {'redmatic-homekit': entry('4.2.0'), 'redmatic-matter': entry('1.0.2')}});
    const r = runScript(dir);
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls, []);
    assert.deepStrictEqual(r.state, {addon: '10.1.0', state: 'updated'});
});

test('the script: no registry - exit 0, the failure in the state file and the log, the packages as they were', {timeout: 60000}, t => {
    const dir = addon(t, {state: {addon: '10.0.0', state: 'current'}, registry: {}});
    // three tries with their pauses would take 10 s; the module's pause is not the test's to wait for
    const r = runScript(dir);
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls.map(c => c.args[0]), ['view', 'view', 'view']);
    assert.strictEqual(r.state.state, 'failed');
    assert.strictEqual(r.state.attempts, 1);
    assert.match(r.state.error, /ENOTFOUND/);
    assert.strictEqual(r.version('redmatic-homekit'), '4.1.4');
    assert.match(r.log, /daemon\.warn .*update failed \(attempt 1\/3/);
});

// --- bin/redmaticLoader -------------------------------------------------------------------------
// The loader with its paths pointed at a scratch directory and a pretend node: it records what it
// is started with; as Node-RED it "ends" at once, the first time leaving var/restart_once when the
// scenario says so (what lib/update-redmatic-nodes.js does before it ends Node-RED).
function loader(t, {restartOnce = false, stale = false, exit = 0}) {
    const dir = scratch(t);
    for (const d of ['bin', 'etc', 'var', 'lib', 'stubs']) {
        fs.mkdirSync(path.join(dir, d));
    }
    fs.writeFileSync(path.join(dir, 'versions'), 'export VERSION_ADDON=10.1.0\n');
    fs.writeFileSync(path.join(dir, 'etc', 'settings.json'), '{}');
    if (stale) {
        fs.writeFileSync(path.join(dir, 'var', 'restart_once'), 'stale\n');
    }
    fs.writeFileSync(path.join(dir, 'bin', 'node'), `#!/bin/sh
case "$*" in
    *update-redmatic-nodes.js*) echo "update $*" >> ${dir}/calls.log ;;
    *red.js*)
        echo "node-red" >> ${dir}/calls.log
        if [ -f ${dir}/var/restart_once ]; then echo "restart_once present at start" >> ${dir}/calls.log; fi
        if [ "${restartOnce ? 1 : 0}" = 1 ] && [ ! -f ${dir}/restarted ]; then
            touch ${dir}/restarted ${dir}/var/restart_once
            exit ${exit}
        fi
        ;;
    *npm-cache.js*) ;;
    *) echo 0 ;;
esac
exit 0
`, {mode: 0o755});
    fs.writeFileSync(path.join(dir, 'stubs', 'logger'), `#!/bin/sh\ncat > /dev/null\necho "$@" >> ${dir}/logger.log\n`, {mode: 0o755});
    const script = fs.readFileSync(LOADER, 'utf8').replaceAll('/usr/local/addons/redmatic', dir);
    fs.writeFileSync(path.join(dir, 'bin', 'redmaticLoader'), script, {mode: 0o755});
    const result = spawnSync('sh', [path.join(dir, 'bin', 'redmaticLoader')], {encoding: 'utf8', env: {PATH: path.join(dir, 'stubs') + ':' + process.env.PATH}, timeout: 30000});
    // the update runs in the background beside Node-RED: give its record a moment
    const end = Date.now() + 5000;
    while (Date.now() < end && !(fs.existsSync(path.join(dir, 'calls.log')) && /update /.test(fs.readFileSync(path.join(dir, 'calls.log'), 'utf8')))) {
        spawnSync('sleep', ['0.1']);
    }
    return {
        status: result.status,
        output: result.stdout + result.stderr,
        calls: fs.readFileSync(path.join(dir, 'calls.log'), 'utf8').split('\n').filter(Boolean),
        restartCount: fs.readFileSync(path.join(dir, 'var', 'restart_count'), 'utf8').trim(),
        left: fs.existsSync(path.join(dir, 'var', 'restart_once'))
    };
}

test('the loader starts the update beside Node-RED, and Node-RED once', t => {
    const r = loader(t, {});
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls.filter(c => c === 'node-red'), ['node-red']);
    assert.strictEqual(r.calls.filter(c => /^update .*lib\/update-redmatic-nodes\.js run$/.test(c)).length, 1, r.calls.join('\n'));
});

for (const exit of [0, 1]) {
    test(`the loader starts Node-RED again once when restart_once is there (Node-RED ended with ${exit}), not counted as a crash`, t => {
        const r = loader(t, {restartOnce: true, exit});
        assert.strictEqual(r.status, 0, r.output);
        assert.deepStrictEqual(r.calls.filter(c => c !== 'node-red' && !/^update /.test(c)), [], 'restart_once is gone before the second start');
        assert.strictEqual(r.calls.filter(c => c === 'node-red').length, 2);
        assert.strictEqual(r.calls.filter(c => /^update /.test(c)).length, 1, 'the update is started once, not per Node-RED start');
        assert.strictEqual(r.restartCount, '0');
        assert.strictEqual(r.left, false);
    });
}

test('a restart_once an earlier loader left is removed, not acted on', t => {
    const r = loader(t, {stale: true});
    assert.strictEqual(r.status, 0, r.output);
    assert.deepStrictEqual(r.calls.filter(c => c === 'node-red'), ['node-red']);
    assert.strictEqual(r.calls.includes('restart_once present at start'), false);
    assert.strictEqual(r.left, false);
});
