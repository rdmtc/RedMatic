const fs = require('fs');
const request = require('sync-request');
const showdown  = require('showdown');
const converter = new showdown.Converter();

const outfile = __dirname + '/LICENSES.md';
const outfileHtml = __dirname + '/addon_files/redmatic/www/licenses.html';

const paths = [
    __dirname + '/addon_tmp/redmatic/var',
    __dirname + '/addon_tmp/redmatic/lib',
    __dirname + '/addon_tmp/redmatic/www'
];

const files = [
    'master/LICENSE',
    'master/LICENSE.md',
   /*
    'master/LICENSE.txt',
    'master/LICENSE-MIT.txt',
    'latest/NOTICE',
    'latest/LICENSE',
    'latest/LICENSE.md',
    'latest/LICENSE.txt',
    'latest/LICENSE-MIT.txt',
    */
];

let modules = {};

function getModules(path) {
    path += '/node_modules';
    if (fs.existsSync(path)) {
        const dir = fs.readdirSync(path);
        dir.forEach((d, i) => {
            if (fs.existsSync(path + '/' + d + '/package.json')) {
                console.log((i + 1) + ' / ' + dir.length);
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
            const res = request('GET', url + files[i], {timeout: 5000, cache: 'file'});
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

let out = '';

modules['Node.js'] = {
    license: 'MIT',
    licTxt: '\n' + fs.readFileSync(__dirname + '/LICENSE_Nodejs').toString().replace(/"""/g, '\n```\n') + '\n',
    url: 'https://nodejs.org'
};

modules['RedMatic'] = {
    license: 'Apache-2.0',
    author: 'Sebastian Raff <hobbyquaker@gmail.com>',
    licTxt: '\n```\n' + fs.readFileSync(__dirname + '/LICENSE').toString() + '\n```\n',
    url: 'https://github.com/hobbyquaker/RedMatic'
};

Object.keys(modules).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}).forEach(name => {
    out += `
   
# ${name}
    
License: ${modules[name].license}    
Author: ${modules[name].author}    
Repository: [${modules[name].url}](${modules[name].url})      

${modules[name].licTxt}


`;
});

let htmlHead = `
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
`;

htmlHead += fs.readFileSync(__dirname + '/node_modules/github-markdown-css/github-markdown.css').toString();

htmlHead += `
</style>
<body class="markdown-body">
`;

const htmlFoot = `</body>`;

fs.writeFileSync(outfile, out);
fs.writeFileSync(outfileHtml, htmlHead + converter.makeHtml(out) + htmlFoot);
