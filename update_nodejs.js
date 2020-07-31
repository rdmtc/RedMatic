const major = 'v14';

const request = require('sync-request');
const common = require(__dirname + '/package.json');

const arr = JSON.parse(request('GET', 'https://nodejs.org/dist/index.json').body);
const avail = arr.filter(v => v.version.split('.')[0] === major).map(v => v.version);
const latest = require('latest-semver')(avail);

if (common.engines.node !== latest) {
    console.log('update node.js to ' + latest);
    common.engines = {node: latest};
    require('fs').writeFileSync(__dirname + '/package.json', JSON.stringify(common, null, '  '));
} else {
    console.log('node.js ' + latest + ' is up to date :)');
}
