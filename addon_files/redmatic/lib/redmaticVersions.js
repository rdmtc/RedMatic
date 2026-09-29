// Outputs version information of the addon, Node.js, the CCU firmware and all
// installed node modules as JSON. Called via bin/redmaticVersions by the
// telemetry request and www/update_check.cgi.

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

// openccu-lite: a LITE= line in /VERSION (the image build writes it), or its system service
// occulited. A CCU3 and OpenCCU have neither. The same rule as IsOpenccuLite in bin/redmatic.
function isOpenccuLite(version, occulited) {
    if (Object.prototype.hasOwnProperty.call(version, 'LITE')) {
        return true;
    }
    try {
        fs.accessSync(occulited, fs.constants.X_OK);
        return true;
    } catch {
        return false;
    }
}

// The ccu block of the telemetry (task 18). The server stores VERSION, PRODUCT and PLATFORM as they
// arrive and groups by them. openccu-lite keeps upstream's PRODUCT in /VERSION (rpi4, ova, ...), so
// it is sent as lite-<PRODUCT> to count as a product of its own, and its own version goes along as
// LITE - inside ccu, never at the top level, where the server would take it for an npm module.
// VERSION and PLATFORM stay as they are; a CCU3, OpenCCU and piVCCU send no LITE at all.
function ccuInfo({
    versionFile = '/VERSION',
    piVCCUFile = '/etc/piVCCU3',
    occulited = '/usr/bin/occulited',
    machine = ''
} = {}) {
    const version = readEnvFile(versionFile);
    const piVCCU = fs.existsSync(piVCCUFile);
    const lite = !piVCCU && isOpenccuLite(version, occulited);
    let product = version.PRODUCT || '';
    if (piVCCU) {
        product = 'pivccu3';
    } else if (lite) {
        product = 'lite-' + product;
    }
    const res = {
        VERSION: version.VERSION || '',
        PRODUCT: product,
        PLATFORM: `${version.PLATFORM || ''}-${machine}`
    };
    if (lite && version.LITE) {
        res.LITE = version.LITE;
    }
    return res;
}

function main() {
    const addonVersions = readEnvFile(path.join(ADDON_DIR, 'versions'));

    let machine = '';
    try {
        machine = execSync('uname -m').toString().trim();
    } catch {}

    const result = {
        ccu: {
            ...ccuInfo({machine}),
            deviceTypes: deviceTypes()
        },
        redmatic: addonVersions.VERSION_ADDON || '',
        nodejs: process.version.replace(/^v/, '')
    };

    scanModules(path.join(ADDON_DIR, 'lib', 'node_modules'), result);
    scanModules(path.join(ADDON_DIR, 'var', 'node_modules'), result);

    console.log(JSON.stringify(result, null, 3));
}

if (require.main === module) {
    main();
}

module.exports = {ccuInfo, isOpenccuLite, readEnvFile};
