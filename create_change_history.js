const request = require('request');

request({
    url: 'https://api.github.com/repos/rdmtc/RedMatic/releases?per_page=1',
    headers: {
        'User-Agent': 'node-request'
    }
}, (err, res, body) => {
    if (!err) {
        parse(JSON.parse(body))
    }
});

function parse(data) {
    data.forEach(release => {
        console.log('\n#', release.tag_name, release.published_at);
        let include = false;
        release.body.split('\n').forEach(line => {
            if (line.startsWith('Module | Version')) {
                include = false;
            }
            if (include && line !== '') {
                console.log(line);
            }
            if (line.startsWith('### Changelog')) {
                include = true;
            }
        });
    });
}
