const fs = require('fs').promises;
const path = require('path');
const got = require('got');
const prompts = require('prompts');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

let updateCount = 0;

const dirs = ['var', 'lib', 'www'];

const pkgs = {
    combined: require(path.join(__dirname, 'package.json'))
};

dirs.forEach(dir => {
    pkgs[dir] = require(path.join(__dirname, 'addon_files/redmatic', dir, 'package.json'));
});

async function compareVersions(dir) {
    const pkgJson = pkgs[dir];
    const dependencies = pkgJson.dependencies;
    for (const pkg in dependencies) {
        const json = await got(`https://registry.npmjs.org/${pkg}`, {
            responseType: 'json'
        });

        const actual = dependencies[pkg];
        const latest = json.body['dist-tags'].latest;
        if (actual !== latest) {
            const response = await prompts({
                type: 'confirm',
                name: 'confirmed',
                message: `update ${pkg} ${actual} to ${latest}?`
            });
            if (response.confirmed) {
                dependencies[pkg] = latest;
                pkgs.combined.dependencies[pkg] = `0.0.0 - ${latest}`;
                const file = path.join('addon_files/redmatic', dir, 'package.json')
                await fs.writeFile(path.join(__dirname, 'package.json'), JSON.stringify(pkgs.combined, null, '  '));
                await fs.writeFile(path.join(__dirname, file), JSON.stringify(pkgs[dir], null, '  '));
                let changelog = '';
                switch (pkg) {
                    case 'node-red':
                        changelog = ' ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))';
                        break;
                    case 'node-red-dashboard':
                        changelog = ' ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))';
                        break;
                    default:
                }
                const {stdout, stderr} = await exec(`git commit package.json ${file} -m 'update ${pkg} ${actual} to ${latest}${changelog}'`);
                console.log(stderr, stdout);
                updateCount += 1;
            }
        }
    }

}
async function checkDirs() {
    for (dir of dirs) {
        await compareVersions(dir);
    }
    if (updateCount === 0) {
        console.log('all dependencies are up to date :)');
    }
    console.log('');
}

checkDirs();