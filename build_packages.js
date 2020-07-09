const fs = require('fs');
const cp = require('child_process');
const crypto = require('crypto');
const pkgLib = require(__dirname + '/addon_files/redmatic/lib/package.json');
const redmaticVersion = require(__dirname + '/package.json').version;

let tarch = process.argv[2] || 'armv6l';
let arch = '';

if (tarch !== 'armv6l') {
    arch = '-' + tarch;
}

const blacklist = [
    'node-red',
    'npm',
    'ain2',
    '@node-red-contrib-themes/midnight-red'
];

const extraFiles = {
    'redmatic-homekit': [
        'bin/ffmpeg'
    ],
    'node-red-contrib-johnny-five': [
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

// TODO handle scoped packages

Object.keys(pkgLib.dependencies).forEach(name => {
    if (blacklist.includes(name)) {
        return;
    }

    remove.push(__dirname + '/addon_tmp/redmatic/lib/node_modules/' + name);

    if (tarch !== 'armv6l' && name === 'node-red-contrib-johnny-five') {
        return;
    }

    let pkgJson;
    try {
        pkgJson = require(__dirname + '/addon_tmp/redmatic/lib/node_modules/' + name + '/package.json');
    } catch (err) {
        console.error(err.message);
        return;
    }
    const {version, description, keywords, homepage, repository} = pkgJson;

    const filename = 'redmatic' + arch + '-pkg-' + name + '-' + version + '.tar.gz';

    let cmd = 'tar -C ' + __dirname + '/addon_tmp/redmatic/ -czf ' + __dirname + '/dist/' + filename + ' lib/node_modules/' + name;
    if (extraFiles[name]) {
        extraFiles[name].forEach(file => {
            cmd += ' ' + file;
            remove.push(__dirname + '/addon_tmp/redmatic/' + file);
        });
    }
    console.log(`  ${filename}`);
    cp.execSync(cmd);

    repo[name] = {
        integrity: checksum(fs.readFileSync(__dirname + '/dist/' + filename)),
        resolved: 'https://github.com/rdmtc/RedMatic/releases/download/v' + redmaticVersion + '/' + filename,
        version,
        description,
        keywords,
        homepage,
        repository
    };

});

fs.writeFileSync(__dirname + '/addon_tmp/redmatic/lib/pkg-repo.json', JSON.stringify(repo, null, '  '));

remove.forEach(path => {
    console.log('remove', path);
    if (fs.existsSync(path)) {
        if (fs.statSync(path).isDirectory()) {
            cp.execSync('rm -r ' + path);
        } else {
            fs.unlinkSync(path);
        }
    } else {
        console.log(path, 'does not exist');
    }
});

function checksum(input) {
    const hash = crypto.createHash('sha512').update(input, 'utf8');
    return 'sha512-' + hash.digest('base64');
}
