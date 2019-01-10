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
    'master/license',
    'master/License',
    'master/LICENSE.md',
    'master/license.md',
    'master/LICENSE.txt',
    'master/LICENSE-MIT.txt',
    'latest/NOTICE',
    'latest/LICENSE',
    'latest/License',
    'latest/license',
    'latest/LICENSE.md',
    'latest/license.md',
    'latest/LICENSE.txt',
    'latest/LICENSE-MIT.txt',
    'master/README.md',
    'master/Readme.md',
    'latest/README.md',
    'latest/Readme.md'
];

const notFound = [];

let modules = {};

function getModules(path) {
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

                if (!license) {
                    if (notFound.indexOf(pkg.name + '\t' +  url) === -1) {
                        notFound.push(pkg.name + '\t' +  url);
                    }
                }

                modules[pkg.name] = {
                    license: (typeof pkg.license === 'object' ? pkg.license.type : pkg.license) || '',
                    author,
                    url,
                    licTxt: license
                };
                getModules(path + '/' + d + '/node_modules');
            } else if (d.startsWith('@')) {
                getModules(path + '/' + d);
            }
        });
    }
}

paths.forEach(path => {
    getModules(path + '/node_modules');
});

console.log('\n\nNo License Texts found for:');
console.log(notFound.join('\n'));

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
                lic += res.getBody().toString().replace('----------------------------------------------------------------------', '');
                if (files[i].match(/README/i)) {
                    if (lic.match(/# License\s*\n/)) {
                        lic = lic.split('# License')[1];
                    } else if (lic.match(/# license\s*\n/)) {
                        lic = lic.split('# license')[1];
                    } else if (lic.match(/# LICENSE\s*\n/)) {
                        lic = lic.split('# LICENSE')[1];
                    } else {
                        return '';
                    }
                }

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
    licTxt: '\n' + fs.readFileSync(__dirname + '/licenses/nodejs').toString().replace(/"""/g, '\n```\n') + '\n',
    url: 'https://nodejs.org'
};

modules['RedMatic'] = {
    license: 'Apache-2.0',
    author: 'Sebastian Raff <hobbyquaker@gmail.com>',
    licTxt: '\n```\n' + fs.readFileSync(__dirname + '/LICENSE').toString() + '\n```\n',
    url: 'https://github.com/HM-RedMatic/RedMatic'
};

modules['git'] = {
    license: 'GPL-2.0',
    author: '',
    licTxt: '',
    url: 'https://git.kernel.org/pub/scm/git/git.git/'
};

modules['jq'] = {
    license: 'MIT',
    author: 'Stephen Dolan <mu@netsoc.tcd.ie>',
    licTxt: '',
    url: 'https://github.com/stedolan/jq/blob/master/COPYING'
};

modules['jo'] = {
    license: 'GPL-2.0',
    author: 'Jan-Piet Mens <jpmens@gmail.com>',
    licTxt: '\n```\n' + fs.readFileSync(__dirname + '/licenses/jo').toString() + '\n```\n',
    url: 'https://github.com/jpmens/jo'
};


modules['libcurl'] = {
    license: 'MIT',
    author: 'Daniel Stenberg, daniel@haxx.se',
    licTxt: '',
    url: 'https://curl.haxx.se/libcurl/'
};

modules['libcoap'] = {
    license: 'BSD',
    author: 'Olaf Bergmann and others',
    licTxt: '\n```\n' + fs.readFileSync(__dirname + '/licenses/libcoap').toString() + '\n```\n',
    url: 'https://libcoap.net/'
};

modules['ffmpeg'] = {
    license: 'LGPL-2.1',
    author: 'Fabrice Bellard',
    licTxt: '\n```\n' + fs.readFileSync(__dirname + '/licenses/ffmpeg').toString() + '\n```\n',
    url: 'https://www.ffmpeg.org/'
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
