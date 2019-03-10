const base = require(__dirname + '/addon_files/redmatic/lib/package.json');
const nodes = require(__dirname + '/addon_files/redmatic/var/package.json');
const www = require(__dirname + '/addon_files/redmatic/www/package.json');

const common = require(__dirname + '/package.json');

common.dependencies = Object.assign(
    common.dependencies,
    base.dependencies,
    nodes.dependencies,
    www.dependencies,
);

Object.keys(common.dependencies).forEach(name => {
    common.dependencies[name] = '0.0.0 - ' + common.dependencies[name];
});

require('fs').writeFileSync(__dirname + '/package.json', JSON.stringify(common, null, '  '));
