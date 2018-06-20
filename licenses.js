const fs = require('fs');
const request = require('sync-request');

const outfile = __dirname + '/LICENSES.md';

const paths = [
    __dirname + '/addon_tmp/redmatic/var',
    __dirname + '/addon_tmp/redmatic/var/lib',
    __dirname + '/addon_tmp/redmatic/www'
];

const files = [
    'master/NOTICE',
    'master/LICENSE',
    'master/LICENSE.md',
    'master/LICENSE.txt',
    'master/LICENSE-MIT.txt',
    'latest/NOTICE',
    'latest/LICENSE',
    'latest/LICENSE.md',
    'latest/LICENSE.txt',
    'latest/LICENSE-MIT.txt',
];

let modules = {};

function getModules(path) {
    path += '/node_modules';
    if (fs.existsSync(path)) {
        const dir = fs.readdirSync(path);
        dir.forEach((d, i) => {
            if (fs.existsSync(path + '/' + d + '/package.json')) {
                console.log(i + ' / ' + dir.length);
                const pkg = require(path + '/' + d + '/package.json');

                let author = '';
                if (pkg.author && pkg.author.name) {
                    author += pkg.author.name;
                    if (pkg.author.email) {
                        author += ' <' + pkg.author.email + '>';
                    }
                } else {
                    author = pkg.author || '';
                }

                let url = '';
                if (pkg.repository && pkg.repository.url) {
                    url = pkg.repository.url;
                } else {
                    url = pkg.repository || '';
                }
                url = url.replace(/^git\+/, '');
                url = url.replace(/^git:\/\//, 'https://');
                url = url.replace(/^ssh:\/\/git@/, 'https://');
                url = url.replace(/\.git$/, '');

                let license = '';
                let licUrl = url.replace(/github\.com/, 'raw.githubusercontent.com') + '/';
                if (licUrl) {
                    license = getLicense(licUrl);
                }

                modules[pkg.name] = {
                    license: pkg.license || '',
                    author,
                    url,
                    licTxt: license
                };
                getModules(path + '/' + d);
            }
        });
    }
}

paths.forEach(path => {
    getModules(path);
});

function getLicense(url) {
    console.log('   ', url);
    for (let i = 0; i < files.length; i++) {
        try {
            const res = request('GET', url + files[i]);
            console.log('   ', res && res.statusCode, files[i]);
            let lic = '';
            if (res && res.statusCode === 200) {
                if (!files[i].endsWith('.md')) {
                    lic += '\n```\n';
                }
                lic += res.getBody().toString();
                if (!files[i].endsWith('.md')) {
                    lic += '\n```\n';
                }
                return lic;
            }
        } catch (err) {
            return '';
        }
    }
    return '';
}

fs.writeFileSync(outfile, '');
Object.keys(modules).sort().forEach(name => {
    let out = `# ${name}
    
License: ${modules[name].license}    
Author: ${modules[name].author}    
Repository: ${modules[name].url}    

${modules[name].licTxt}


`;

    fs.appendFileSync(outfile, out);
});
