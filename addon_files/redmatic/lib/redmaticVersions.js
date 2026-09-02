// Outputs version information of the addon, Node.js, the CCU firmware and all
// installed node modules as JSON. Called via bin/redmaticVersions by the
// telemetry request, the log upload and www/update_check.cgi.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ADDON_DIR = '/usr/local/addons/redmatic';

function readEnvFile(file) {
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

function scanModules(dir, res) {
    let entries;
    try {
        entries = fs.readdirSync(dir);
    } catch {
        return;
    }
    for (const name of entries) {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(dir, name, 'package.json'), 'utf8'));
            if (pkg.name && pkg.version) {
                res[pkg.name] = pkg.version;
            }
        } catch {}
        if (name.startsWith('@')) {
            scanModules(path.join(dir, name), res);
        }
    }
}

function deviceTypes() {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(ADDON_DIR, 'var', 'ccu_localhost.json'), 'utf8'));
        const types = new Set();
        for (const iface of Object.values(data.types || {})) {
            for (const key of Object.keys(iface)) {
                if (key.includes('-')) {
                    types.add(key);
                }
            }
        }
        return [...types].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    } catch {
        return [];
    }
}

const addonVersions = readEnvFile(path.join(ADDON_DIR, 'versions'));
const ccu = readEnvFile('/VERSION');

let machine = '';
try {
    machine = execSync('uname -m').toString().trim();
} catch {}

const result = {
    ccu: {
        VERSION: ccu.VERSION || '',
        PRODUCT: fs.existsSync('/etc/piVCCU3') ? 'pivccu3' : (ccu.PRODUCT || ''),
        PLATFORM: `${ccu.PLATFORM || ''}-${machine}`,
        deviceTypes: deviceTypes()
    },
    redmatic: addonVersions.VERSION_ADDON || '',
    nodejs: process.version.replace(/^v/, '')
};

scanModules(path.join(ADDON_DIR, 'lib', 'node_modules'), result);
scanModules(path.join(ADDON_DIR, 'var', 'node_modules'), result);

console.log(JSON.stringify(result, null, 3));
