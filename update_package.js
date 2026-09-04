// Regenerates the dependency mirror in the root package.json from the three
// dependency layers of the addon (lib, var, www). The mirror only exists so
// that GitHub's dependency graph and security alerts see what the addon
// ships; nothing is installed from it (the build installs the layer files).
// Versions are copied exactly as pinned in the layers.
const fs = require('fs');

const base = require(__dirname + '/addon_files/redmatic/lib/package.json');
const nodes = require(__dirname + '/addon_files/redmatic/var/package.json');
const www = require(__dirname + '/addon_files/redmatic/www/package.json');

const common = require(__dirname + '/package.json');

const merged = Object.assign({}, base.dependencies, nodes.dependencies, www.dependencies);
common.dependencies = Object.fromEntries(Object.keys(merged).sort().map(name => [name, merged[name]]));

fs.writeFileSync(__dirname + '/package.json', JSON.stringify(common, null, '  ') + '\n');
