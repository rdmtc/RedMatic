// Checks the bundled runtime and node versions against the newest releases
// of their pinned majors and, on request, applies the bumps. Used by the
// auto-release workflow (ROADMAP task 10) and by hand:
//
//   node update_versions.js            report only
//   node update_versions.js --apply    write the layer files, regenerate the
//                                      root package.json mirror, write
//                                      RELEASE_SUMMARY.md for the release body
//   node update_versions.js --bump     also bump the addon version: the patch
//                                      (9.0.1 -> 9.0.2) when every update is
//                                      a patch update, the minor (9.0.1 ->
//                                      9.1.0) when at least one is a minor
//                                      update; refused when nothing is new
//   node update_versions.js --json     print a JSON result; with GITHUB_OUTPUT
//                                      set, also write updates/version/summary
//   node update_versions.js --root DIR work on the tree in DIR instead of this
//                                      one: the auto-release bumps a checkout
//                                      of the newest release tag, never master
//
// Tracked (all within the major that is currently pinned):
//   Node.js               package.json engines.node          nodejs.org
//   npm, node-red         addon_files/redmatic/lib/package.json   npm registry
//   node-red-contrib-ccu  addon_files/redmatic/var/package.json   npm registry
// A major switch stays a manual release (maintainer decision, 2026-09-04).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const rootAt = argv.indexOf('--root');
const ROOT = rootAt >= 0 ? path.resolve(argv[rootAt + 1] || '.') : __dirname;
const FILES = {
    root: `${ROOT}/package.json`,
    lib: `${ROOT}/addon_files/redmatic/lib/package.json`,
    var: `${ROOT}/addon_files/redmatic/var/package.json`
};

const args = new Set(argv);
const apply = args.has('--apply');
const bump = args.has('--bump');
const json = args.has('--json');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, '  ') + '\n');
}

function parse(version) {
    return version.split('.').map(Number);
}

function compare(a, b) {
    const pa = parse(a);
    const pb = parse(b);
    return (pa[0] - pb[0]) || (pa[1] - pb[1]) || (pa[2] - pb[2]);
}

function isRelease(version) {
    return /^\d+\.\d+\.\d+$/.test(version);
}

// the part of a version an update changed: 'patch' or 'minor' ('major' does not
// happen, the majors are pinned)
function updateLevel(from, to) {
    const [fromMajor, fromMinor] = parse(from);
    const [toMajor, toMinor] = parse(to);
    if (fromMajor !== toMajor) {
        return 'major';
    }
    return fromMinor === toMinor ? 'patch' : 'minor';
}

// the addon's bump for a set of updates: patch when all of them are patch
// updates, minor otherwise. Nothing new is no release: RedMatic's own changes
// are released by the maintainer's tag, never by this script.
function bumpLevel(updates) {
    if (updates.length === 0) {
        throw new Error('no bundled component has a new version - nothing to release');
    }
    if (updates.every(u => updateLevel(u.from, u.to) === 'patch')) {
        return 'patch';
    }
    return 'minor';
}

function bumpVersion(version, level) {
    const [major, minor, patch] = parse(version);
    return level === 'patch' ? `${major}.${minor}.${patch + 1}` : `${major}.${minor + 1}.0`;
}

function newestOfMajor(versions, current) {
    const major = parse(current)[0];
    return versions
        .filter(v => isRelease(v) && parse(v)[0] === major)
        .sort(compare)
        .pop();
}

async function fetchJson(url, headers = {}) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw new Error(`${url}: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

async function nodejsVersions() {
    const releases = await fetchJson('https://nodejs.org/dist/index.json');
    return releases.map(r => r.version.replace(/^v/, ''));
}

async function npmVersions(name) {
    // abbreviated metadata: the full document of npm itself is several MB
    const doc = await fetchJson(`https://registry.npmjs.org/${name}`, {
        Accept: 'application/vnd.npm.install-v1+json'
    });
    return Object.keys(doc.versions || {});
}

async function main() {
    const root = readJson(FILES.root);
    const lib = readJson(FILES.lib);
    const nodes = readJson(FILES.var);

    const tracked = [
        { name: 'Node.js', current: root.engines.node, versions: nodejsVersions,
            set: v => { root.engines.node = v; } },
        { name: 'npm', current: lib.dependencies.npm, versions: () => npmVersions('npm'),
            set: v => { lib.dependencies.npm = v; } },
        { name: 'Node-RED', current: lib.dependencies['node-red'], versions: () => npmVersions('node-red'),
            set: v => { lib.dependencies['node-red'] = v; } },
        { name: 'node-red-contrib-ccu', current: nodes.dependencies['node-red-contrib-ccu'],
            versions: () => npmVersions('node-red-contrib-ccu'),
            set: v => { nodes.dependencies['node-red-contrib-ccu'] = v; } }
    ];

    const updates = [];
    for (const item of tracked) {
        if (!isRelease(item.current)) {
            throw new Error(`${item.name}: pinned version "${item.current}" is not a plain x.y.z version`);
        }
        const latest = newestOfMajor(await item.versions(), item.current);
        if (!latest) {
            throw new Error(`${item.name}: no release of major ${parse(item.current)[0]} found`);
        }
        const state = compare(latest, item.current) > 0 ? `-> ${latest}` : 'up to date';
        console.log(`${item.name.padEnd(22)} ${item.current.padEnd(10)} ${state}`);
        if (compare(latest, item.current) > 0) {
            updates.push({ name: item.name, from: item.current, to: latest });
            item.set(latest);
        }
    }

    const result = { updates, version: { from: root.version, to: root.version } };

    if (apply || bump) {
        if (bump) {
            if (!isRelease(root.version)) {
                throw new Error(`addon version "${root.version}" is a prerelease - automatic bumps only run on releases`);
            }
            const level = bumpLevel(updates);
            result.version.to = bumpVersion(root.version, level);
            root.version = result.version.to;
            console.log(`addon version ${result.version.from} -> ${result.version.to} (${level})`);
        }
        writeJson(FILES.root, root);
        writeJson(FILES.lib, lib);
        writeJson(FILES.var, nodes);
        // the root package.json mirror of the three layers
        execFileSync(process.execPath, [`${ROOT}/update_package.js`], { stdio: 'inherit' });
        fs.writeFileSync(`${ROOT}/RELEASE_SUMMARY.md`, summary(updates, result.version.to));
        console.log('written: layer files, package.json, RELEASE_SUMMARY.md');
    }

    if (json) {
        console.log(JSON.stringify(result));
    }
    if (process.env.GITHUB_OUTPUT) {
        const line = updates.map(u => `${u.name} ${u.from} -> ${u.to}`).join(', ');
        fs.appendFileSync(process.env.GITHUB_OUTPUT,
            `updates=${updates.length > 0}\nversion=${result.version.to}\nsummary=${line}\n`);
    }
}

// the part of the release body that says this release was made by the workflow
function summary(updates, version) {
    const list = updates.length > 0
        ? updates.map(u => `${u.name} ${u.from} → ${u.to}`).join(', ')
        : 'keine (manuell ausgelöster Lauf)';
    return `### 🤖 Automatisches Release ${version}

Dieses Release wurde automatisch von einem GitHub-Workflow erstellt, weil
neue Versionen der gebündelten Komponenten erschienen sind: **${list}**.
RedMatic selbst wurde dabei nicht verändert: das Release ist der Stand des
vorigen Releases mit diesen neuen Versionen. Der Build und ein automatischer
End-to-End-Test (Installation, Start, Paletten-Manager) sind erfolgreich
durchgelaufen.

`;
}

if (require.main === module) {
    main().catch(err => {
        console.error(err.message);
        process.exit(1);
    });
}

module.exports = { updateLevel, bumpLevel, bumpVersion };
