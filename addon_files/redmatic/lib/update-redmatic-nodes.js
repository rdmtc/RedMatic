'use strict';

/*
 * After an update of RedMatic itself: update RedMatic-HomeKit and RedMatic-Matter in Node-RED's
 * userDir (var/), when they are installed there and the setting says so (settings.json
 * "updateRedmaticNodes", on unless it is false - also for a settings.json that has no value yet).
 *
 * Where RedMatic notices its own update: every way to update the addon - the CCU's and OpenCCU's
 * Zusatzsoftware page, the settings page's own updater, openccu-lite's Addons page - ends in a start
 * of bin/redmaticLoader, as the user Node-RED runs as. The loader starts `node
 * lib/update-redmatic-nodes.js run` in the background beside Node-RED. The state file
 * var/redmatic-nodes-update.json names the addon version it was last run for: another version in
 * $ADDON_DIR/versions (VERSION_ADDON) is the first start after an update. A missing state file is
 * one too - the update that brings this feature, or a fresh install, where neither package is there.
 *
 * What a run does:
 *   1. nothing on a normal start, with the setting off or with neither package installed (the
 *      version is recorded, so the setting is asked once per RedMatic update)
 *   2. waits until Node-RED answers, so npm does not compete with its start
 *   3. asks the registry with `npm view` for the versions newer than the installed one and takes
 *      the highest that is not above the dist-tag latest, no prerelease, and whose engines.node and
 *      node-red.version accept this addon's Node.js and Node-RED
 *   4. installs them in one npm run, in var/ with the arguments Node-RED's palette uses (and the
 *      npm cache the loader exported, etc/npmrc otherwise)
 *   5. when something was installed and Node-RED runs: writes var/restart_once and sends Node-RED
 *      SIGINT - the loader starts it again, once, without counting a crash
 *
 * A package is left alone when its entry in var/package.json is not a range of versions: an exact
 * version ("4.1.4" - the palette writes "~4.1.4") or a tarball, folder or git URL is the user's
 * choice. Other nodes are never touched.
 *
 * Nothing here can stop Node-RED's start: it runs beside it. A failed registry request or npm run
 * is logged, shown on the settings page (www/nodes_update.cgi prints the state file) and tried again
 * at the next start, MAX_ATTEMPTS times per RedMatic update.
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const http = require('http');

const ADDON_DIR = '/usr/local/addons/redmatic';
const SCRIPT_NAME = 'update-redmatic-nodes.js';
const PACKAGES = ['redmatic-homekit', 'redmatic-matter'];
const MAX_ATTEMPTS = 3;

// palette install arguments of Node-RED (@node-red/registry/lib/installer.js)
const INSTALL_ARGS = ['--no-audit', '--no-update-notifier', '--no-fund', '--save', '--save-prefix=~', '--omit=dev', '--engine-strict'];

const VIEW_TIMEOUT_MS = 60 * 1000;
const VIEW_TRIES = 3;
const VIEW_PAUSE_MS = 5000;
// a CCU3 writes a large package to its SD card slowly; beyond this npm hangs
const INSTALL_TIMEOUT_MS = 30 * 60 * 1000;
const NODE_RED_WAIT_MS = 10 * 60 * 1000;
const NODE_RED_SETTLE_MS = 30 * 1000;

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return undefined;
    }
}

/** On unless the setting is false: a settings.json from before the setting has no value. */
function enabled(settings) {
    return !(settings && settings.updateRedmaticNodes === false);
}

/**
 * The user's choice of a version: an exact one, or anything that is not a range of registry
 * versions (file:, git, URL, a dist-tag). The palette writes "~x.y.z".
 */
function pinned(spec, semver) {
    if (spec === undefined || spec === null || spec === '') {
        return false;
    }
    spec = String(spec).trim();
    if (semver.valid(spec, {loose: true})) {
        return true;
    }
    return semver.validRange(spec, {loose: true}) === null;
}

/**
 * Which of PACKAGES are in the userDir: listed in its package.json or present in its node_modules
 * (either alone counts - an npm run that was cut off can leave one without the other).
 * Returns {name: {version, spec}}; version is undefined when the module's package.json is unreadable.
 */
function installedPackages(userDir, packages = PACKAGES) {
    const userPkg = readJson(path.join(userDir, 'package.json')) || {};
    const deps = userPkg.dependencies || {};
    const result = {};
    for (const name of packages) {
        const modulePkg = readJson(path.join(userDir, 'node_modules', name, 'package.json'));
        if (modulePkg || Object.prototype.hasOwnProperty.call(deps, name)) {
            result[name] = {version: modulePkg && modulePkg.version, spec: deps[name]};
        }
    }
    return result;
}

/**
 * What this start has to do.
 *   state        the state file's content (undefined: none yet)
 *   addonVersion VERSION_ADDON of the running addon
 *   settings     etc/settings.json
 *   installed    installedPackages()
 *   alive        true when the run the state file names is still running
 * Returns {action: 'none' | 'record' | 'run', state?, attempts?, reason}.
 */
function decide({state, addonVersion, settings, installed, alive = false}) {
    const sameVersion = Boolean(state && state.addon === addonVersion);
    if (sameVersion && state.state === 'running' && alive) {
        return {action: 'none', reason: 'a run is in progress'};
    }
    const unfinished = sameVersion && (state.state === 'failed' || state.state === 'running');
    if (sameVersion && !unfinished) {
        return {action: 'none', reason: 'no RedMatic update since the last run'};
    }
    // from here: the first start after a RedMatic update, or a run of this version that did not finish
    if (!enabled(settings)) {
        return {action: 'record', state: 'disabled', reason: 'the setting is off'};
    }
    if (Object.keys(installed).length === 0) {
        return {action: 'record', state: 'not-installed', reason: 'neither package is installed'};
    }
    const attempts = unfinished ? (Number(state.attempts) || 0) : 0;
    if (attempts >= MAX_ATTEMPTS) {
        return {action: 'record', state: 'gave-up', reason: `${attempts} attempts failed`};
    }
    let reason = 'first start after a RedMatic update';
    if (unfinished) {
        reason = state.state === 'failed' ? 'the last attempt failed' : 'the last run was cut off';
    }
    return {action: 'run', attempts: attempts + 1, reason};
}

/** `npm view --json` prints one object for one matching version and an array for several. */
function parseView(stdout) {
    const text = String(stdout || '').trim();
    if (!text) {
        return [];
    }
    const data = JSON.parse(text);
    if (data && data.error) {
        // no version matches the range (or no such package): nothing newer
        if (data.error.code === 'E404') {
            return [];
        }
        throw new Error(data.error.summary || data.error.code || 'npm view failed');
    }
    return Array.isArray(data) ? data : [data];
}

/**
 * The version to install: the highest of `candidates` (parseView's entries) that is newer than
 * `installed`, no prerelease, not above the dist-tag latest, and accepts this Node.js and Node-RED.
 * undefined when there is none.
 */
function pickVersion(candidates, {installed, nodeVersion, redVersion, semver}) {
    let best;
    for (const c of candidates) {
        const version = c && semver.valid(c.version);
        if (!version || semver.prerelease(version)) {
            continue;
        }
        if (installed && semver.valid(installed) && !semver.gt(version, installed)) {
            continue;
        }
        const latest = c['dist-tags'] && semver.valid(c['dist-tags'].latest);
        if (latest && semver.gt(version, latest)) {
            continue;
        }
        const nodeRange = c.engines && c.engines.node;
        if (nodeRange && nodeVersion && !semver.satisfies(nodeVersion, nodeRange, {loose: true})) {
            continue;
        }
        const redRange = c['node-red'] && c['node-red'].version;
        if (redRange && redVersion && !semver.satisfies(redVersion, redRange, {loose: true, includePrerelease: true})) {
            continue;
        }
        if (!best || semver.gt(version, best)) {
            best = version;
        }
    }
    return best;
}

/** The last lines of npm's output that say something, for the log and the settings page. */
function errorText(err) {
    const text = [err && err.stderr, err && err.stdout, err && err.message].filter(Boolean).join('\n');
    // npm's "syscall connect" and "errno ..." lines repeat the code; the line after them names the request
    const lines = text.split('\n').map(l => l.trim()).filter(l => /^npm (error|ERR!)/.test(l) &&
        !/complete log of this run/.test(l) && !/^npm (error|ERR!) (syscall|errno) /.test(l));
    const picked = lines.length > 0 ? lines.slice(0, 3).join('; ') : String((err && err.message) || err).split('\n')[0];
    return picked.slice(0, 300);
}

/**
 * One run. Everything outside is injected (`io`), so the tests drive it without npm, a registry or
 * Node-RED:
 *   readState(), writeState(state)   the state file
 *   settings, addonVersion, nodeVersion, redVersion
 *   installed()                      installedPackages() of the userDir
 *   alive(pid)                       is the run with that pid still there?
 *   waitForNodeRed()                 resolves when Node-RED answers (or the wait is over)
 *   view(name, range)                resolves with npm view's stdout, rejects when npm failed
 *   install(specs)                   resolves when `npm install <specs>` succeeded
 *   restartNodeRed()                 true when a running Node-RED was told to restart
 *   sleep(ms), log(level, message), semver, now(), pid
 * Returns the state it wrote, or undefined when there was nothing to do.
 */
async function run(io) {
    const previous = io.readState();
    const before = io.installed();
    const decision = decide({
        state: previous,
        addonVersion: io.addonVersion,
        settings: io.settings,
        installed: before,
        alive: Boolean(previous && previous.pid && io.alive(previous.pid))
    });
    if (decision.action === 'none') {
        return undefined;
    }
    const base = {addon: io.addonVersion, ts: io.now()};
    if (previous && previous.addon && previous.addon !== io.addonVersion) {
        base.from = previous.addon;
    }
    if (decision.action === 'record') {
        const state = Object.assign({}, base, {state: decision.state});
        if (decision.state === 'gave-up') {
            state.attempts = previous.attempts;
            state.error = previous.error;
            state.packages = previous.packages;
            io.log('warn', `RedMatic-HomeKit/RedMatic-Matter: not updated after ${previous.attempts} attempts, left until the next RedMatic update`);
        } else if (decision.state === 'disabled') {
            io.log('info', 'RedMatic-HomeKit/RedMatic-Matter: not updated after the RedMatic update, the setting is off');
        }
        io.writeState(state);
        return state;
    }

    const state = Object.assign({}, base, {state: 'running', attempts: decision.attempts, pid: io.pid, packages: {}});
    for (const name of Object.keys(before)) {
        state.packages[name] = {installed: before[name].version};
    }
    io.writeState(state);
    io.log('info', `RedMatic-HomeKit/RedMatic-Matter: checking for updates (${decision.reason}, attempt ${decision.attempts}/${MAX_ATTEMPTS})`);

    const finish = (result, extra) => {
        const final = Object.assign({}, state, {state: result, ts: io.now()}, extra);
        delete final.pid;
        io.writeState(final);
        return final;
    };

    try {
        await io.waitForNodeRed();

        const specs = [];
        for (const name of Object.keys(before)) {
            const entry = state.packages[name];
            if (pinned(before[name].spec, io.semver)) {
                entry.result = 'pinned';
                entry.spec = String(before[name].spec);
                io.log('info', `${name}: left alone, var/package.json names "${entry.spec}" (not a version range)`);
                continue;
            }
            const current = io.semver.valid(before[name].version);
            const range = current ? `>${current}` : '*';
            let stdout;
            for (let i = 1; ; i++) {
                try {
                    stdout = await io.view(name, range);
                    break;
                } catch (err) {
                    if (i >= VIEW_TRIES) {
                        throw err;
                    }
                    await io.sleep(VIEW_PAUSE_MS);
                }
            }
            const target = pickVersion(parseView(stdout), {
                installed: current,
                nodeVersion: io.nodeVersion,
                redVersion: io.redVersion,
                semver: io.semver
            });
            if (target) {
                entry.target = target;
                specs.push(`${name}@${target}`);
            } else {
                entry.result = 'current';
            }
        }

        if (specs.length === 0) {
            io.log('info', 'RedMatic-HomeKit/RedMatic-Matter: nothing to update');
            return finish('current');
        }

        state.phase = 'install';
        io.writeState(state);
        io.log('info', `installing ${specs.join(' ')}`);
        await io.install(specs);

        const after = io.installed();
        const missing = [];
        for (const name of Object.keys(state.packages)) {
            const entry = state.packages[name];
            if (!entry.target) {
                continue;
            }
            const now = after[name] && after[name].version;
            if (now === entry.target) {
                entry.result = 'updated';
            } else {
                missing.push(`${name} is ${now || 'missing'} instead of ${entry.target}`);
            }
        }
        if (missing.length > 0) {
            throw new Error(`npm ended without an error, but ${missing.join(', ')}`);
        }
        delete state.phase;
        const restarted = Boolean(await io.restartNodeRed());
        io.log('info', `updated ${specs.join(' ')}${restarted ? ', restarting Node-RED once' : ' (Node-RED is not running, nothing to restart)'}`);
        return finish('updated', {restarted});
    } catch (err) {
        const error = errorText(err);
        const last = decision.attempts >= MAX_ATTEMPTS;
        io.log('warn', `RedMatic-HomeKit/RedMatic-Matter: update failed (attempt ${decision.attempts}/${MAX_ATTEMPTS}, ${last ? 'left until the next RedMatic update' : 'next attempt at the next start'}): ${error}`);
        delete state.phase;
        return finish(last ? 'gave-up' : 'failed', {error});
    }
}

// --- the real surroundings ------------------------------------------------------------------

function readVersions(file) {
    const res = {};
    try {
        for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
            const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
            if (m) {
                res[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {}
    return res;
}

/** Atomic, and readable for the settings page's www/nodes_update.cgi whoever it runs as. */
function writeStateFile(file, state) {
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n', {mode: 0o644});
    fs.renameSync(tmp, file);
}

/** Is `pid` a run of this script? (a pid alone could be anyone's after a reboot) */
function runAlive(pid, procDir = '/proc') {
    try {
        return fs.readFileSync(path.join(procDir, String(pid), 'cmdline'), 'utf8').includes(SCRIPT_NAME);
    } catch {
        return false;
    }
}

/** Node-RED's pids: red.js names its process node-red. */
function nodeRedPids(procDir = '/proc') {
    const pids = [];
    let entries = [];
    try {
        entries = fs.readdirSync(procDir);
    } catch {}
    for (const entry of entries) {
        if (!/^\d+$/.test(entry)) {
            continue;
        }
        try {
            if (fs.readFileSync(path.join(procDir, entry, 'comm'), 'utf8').trim() === 'node-red') {
                pids.push(Number(entry));
            }
        } catch {}
    }
    return pids;
}

/** Does anything answer HTTP at `url`? Whatever the status. */
function answers(url, timeout = 3000) {
    return new Promise(resolve => {
        const req = http.get(url, {timeout}, res => {
            res.resume();
            resolve(true);
        });
        req.on('timeout', () => req.destroy());
        req.on('error', () => resolve(false));
    });
}

function exec(file, args, options) {
    return new Promise((resolve, reject) => {
        childProcess.execFile(file, args, Object.assign({maxBuffer: 32 * 1024 * 1024}, options), (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout;
                err.stderr = stderr;
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}

function realIo(addonDir = ADDON_DIR, {nodeRedWaitMs = NODE_RED_WAIT_MS, settleMs = NODE_RED_SETTLE_MS} = {}) {
    const userDir = path.join(addonDir, 'var');
    const stateFile = path.join(userDir, 'redmatic-nodes-update.json');
    const restartOnce = path.join(userDir, 'restart_once');
    const npmDir = path.join(addonDir, 'lib', 'node_modules', 'npm');
    const npmCli = path.join(npmDir, 'bin', 'npm-cli.js');
    const settings = readJson(path.join(addonDir, 'etc', 'settings.json')) || {};
    const versions = readVersions(path.join(addonDir, 'versions'));
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    return {
        settings,
        addonVersion: versions.VERSION_ADDON || '',
        nodeVersion: process.version.replace(/^v/, ''),
        redVersion: versions.RED_VERSION || '',
        semver: require(require.resolve('semver', {paths: [npmDir]})),
        pid: process.pid,
        now: () => Math.round(Date.now() / 1000),
        sleep,
        readState: () => readJson(stateFile),
        writeState: state => {
            try {
                writeStateFile(stateFile, state);
            } catch (err) {
                console.error(`cannot write ${stateFile}: ${err.message}`);
            }
        },
        installed: () => installedPackages(userDir),
        alive: pid => pid !== process.pid && runAlive(pid),
        log: (level, message) => {
            childProcess.execFile('logger', ['-t', 'redmatic', '-p', `daemon.${level}`, message], () => {});
        },
        // any HTTP answer will do; then some time for the flows to start
        waitForNodeRed: async () => {
            const url = `http://127.0.0.1:${Number(settings.uiPort) || 1880}/`;
            const end = Date.now() + nodeRedWaitMs;
            while (Date.now() < end) {
                if (await answers(url)) {
                    await sleep(settleMs);
                    return true;
                }
                await sleep(Math.min(5000, nodeRedWaitMs));
            }
            return false;
        },
        // one request per try (the retries are run()'s), an answer that names the reason on stdout
        view: (name, range) => exec(process.execPath, [npmCli, 'view', '--json', '--fetch-retries=0', '--',
            `${name}@${range}`, 'version', 'engines', 'node-red', 'dist-tags'], {cwd: userDir, timeout: VIEW_TIMEOUT_MS})
            .catch(err => {
                // no matching version is npm's E404 with exit 1: parseView reads it off stdout
                if (/"code":\s*"E404"/.test(String(err.stdout))) {
                    return err.stdout;
                }
                throw err;
            }),
        install: specs => exec(process.execPath, [npmCli, 'install', ...INSTALL_ARGS, '--', ...specs],
            {cwd: userDir, timeout: INSTALL_TIMEOUT_MS})
            .finally(() => {
                // the npm cache in RAM is emptied after every npm run (lib/npm-cache.js)
                try {
                    require('./npm-cache.js').empty(process.env.npm_config_cache);
                } catch {}
            }),
        // the loader starts Node-RED again when it finds restart_once; without a Node-RED there is
        // nothing to restart, and the next start loads the new versions anyway
        restartNodeRed: async () => {
            const pids = nodeRedPids();
            if (pids.length === 0) {
                return false;
            }
            fs.writeFileSync(restartOnce, `${PACKAGES.join(' ')}\n`);
            if (fs.existsSync('/usr/bin/monit')) {
                // as bin/redmatic's stop does; the loader monitors again after the start
                await exec('/usr/bin/monit', ['-g', 'redmatic', 'unmonitor'], {timeout: 10000}).catch(() => {});
            }
            let signalled = false;
            for (const pid of pids) {
                try {
                    process.kill(pid, 'SIGINT');
                    signalled = true;
                } catch {}
            }
            if (!signalled) {
                fs.rmSync(restartOnce, {force: true});
            }
            return signalled;
        }
    };
}

if (require.main === module) {
    if (process.argv[2] !== 'run') {
        console.error('usage: update-redmatic-nodes.js run');
        process.exit(2);
    }
    // the two variables are the tests': another addon directory, and no waiting for Node-RED
    const waits = process.env.REDMATIC_NODES_UPDATE_WAIT_MS === undefined ? {} : {
        nodeRedWaitMs: Number(process.env.REDMATIC_NODES_UPDATE_WAIT_MS),
        settleMs: Number(process.env.REDMATIC_NODES_UPDATE_WAIT_MS)
    };
    run(realIo(process.env.REDMATIC_ADDON_DIR || ADDON_DIR, waits)).then(() => process.exit(0), err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = {
    PACKAGES, MAX_ATTEMPTS, INSTALL_ARGS,
    enabled, pinned, installedPackages, decide, parseView, pickVersion, errorText, run,
    readVersions, writeStateFile, runAlive, nodeRedPids, answers, realIo
};
