const fs = require('fs');
const cp = require('child_process');
var crypto = require('crypto');
const pkgLib = require(__dirname + '/addon_files/redmatic/lib/package.json');
const redmaticVersion = require(__dirname + '/package.json').version;

const blacklist = [
    'node-red',
    'npm',
    'ain2'
];

const extraFiles = {
    'redmatic-homekit': [
        'bin/ffmpeg'
    ],
    'node-red-contrib-gpio': [
        'bin/pig2vcd',
        'bin/pigpiod',
        'bin/pigs',
        'lib/libpigpiod_if2.so',
        'lib/libpigpiod_if.so',
        'lib/libpigpio.so'
    ]
};

const remove = [];
const repo = {};

Object.keys(pkgLib.dependencies).forEach(name => {
    if (blacklist.includes(name)) {
        return;
    }
    const version = pkgLib.dependencies[name]
    const filename = 'redmatic-pkg-' + name + '-' + version + '.tar.gz';

    let cmd = 'tar -C ' + __dirname + '/addon_tmp/redmatic/ -czf ' + __dirname + '/dist/' + filename + ' lib/node_modules/' + name;
    remove.push(__dirname + '/addon_tmp/redmatic/lib/node_modules/' + name);
    if (extraFiles[name]) {
        extraFiles[name].forEach(file => {
            cmd += ' ' + file;
            remove.push(__dirname + '/addon_tmp/redmatic/' + file);
        });
    }
    console.log(cmd);
    cp.execSync(cmd);

    repo[name] = {
        integrity: checksum(fs.readFileSync(__dirname + '/dist/' + filename)),
        resolved: 'https://github.com/rdmtc/RedMatic/releases/download/v' + redmaticVersion + '/' + filename,
        version
    };

});

fs.writeFileSync(__dirname + '/addon_tmp/redmatic/lib/pkg-repo.json', JSON.stringify(repo, null, '  '));

remove.forEach(path => {
    console.log('remove', path);
    if (fs.statSync(path).isDirectory()) {
        cp.execSync('rm -r ' + path);
    } else {
        fs.unlinkSync(path);
    }
});

function checksum(input) {
    var hash = crypto.createHash('sha512').update(input, 'utf8');
    var hashBase64 = hash.digest('base64');
    return 'sha512-' + hashBase64;
}
