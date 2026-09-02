// Bumps engines.node in package.json to the latest release of the tracked
// Node.js major (used by build_addon.sh for the aarch64/x86_64 downloads;
// the armv7l build follows Alpine's package of the same major).

const major = 'v24';

const fs = require('fs');
const common = require(__dirname + '/package.json');

(async () => {
    const res = await fetch('https://nodejs.org/dist/index.json');
    if (!res.ok) {
        throw new Error(`nodejs.org: ${res.status} ${res.statusText}`);
    }
    const releases = await res.json();
    const latest = releases
        .map(r => r.version)
        .filter(v => v.split('.')[0] === major)
        .sort((a, b) => {
            const pa = a.slice(1).split('.').map(Number);
            const pb = b.slice(1).split('.').map(Number);
            return (pb[0] - pa[0]) || (pb[1] - pa[1]) || (pb[2] - pa[2]);
        })[0];

    if (!latest) {
        throw new Error(`no ${major}.x release found on nodejs.org`);
    }

    const version = latest.slice(1);
    if (common.engines.node !== version) {
        console.log('update node.js to ' + version);
        common.engines = { node: version };
        fs.writeFileSync(__dirname + '/package.json', JSON.stringify(common, null, '  ') + '\n');
    } else {
        console.log('node.js ' + version + ' is up to date :)');
    }
})().catch(err => {
    console.error(err.message);
    process.exit(1);
});
