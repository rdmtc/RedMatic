const fs = require('fs');
const request = require('sync-request');

let out = fs.readFileSync(__dirname + '/docs/README.header.md').toString();

const res = request('GET', 'https://raw.githubusercontent.com/wiki/hobbyquaker/RedMatic/Home.md');
if (res && res.statusCode === 200) {
    let toc = res.body.toString();
    toc = toc.replace(/]\(/g, '](https://github.com/hobbyquaker/RedMatic/wiki/');
    out += toc;
}

out +=  fs.readFileSync(__dirname + '/docs/README.footer.md').toString();

fs.writeFileSync('README.md', out);
