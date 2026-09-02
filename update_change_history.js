// Regenerates the wiki CHANGE_HISTORY.md from the GitHub releases.
// Writes to stdout; called by build_change_history.sh.

const headers = {
    'User-Agent': 'redmatic-build',
    Accept: 'application/vnd.github+json'
};

if (process.env.GITHUB_OAUTH_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_OAUTH_TOKEN}`;
}

function parse(data) {
    for (const release of data) {
        console.log(`# [${release.tag_name}](https://github.com/rdmtc/RedMatic/releases/${release.tag_name}) ${release.published_at}`);
        let include = false;
        for (const line of (release.body || '').split('\n')) {
            if (line.startsWith('Module | Version')) {
                include = false;
            }
            if (line.startsWith('[Release History]') || line.startsWith('**[Change History]')) {
                include = false;
            }
            if (include && line !== '') {
                console.log(line.replace(/^\s*\* [0-9a-f]{7} /, '* '));
            }
            if (line.startsWith('### Change')) {
                include = true;
            }
        }
        console.log('\n');
    }
}

async function main() {
    for (let page = 1; ; page++) {
        const res = await fetch(`https://api.github.com/repos/rdmtc/RedMatic/releases?page=${page}&per_page=100`, { headers });
        if (!res.ok) {
            throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        parse(data);
        if (data.length < 100) {
            break;
        }
    }
}

main().catch(err => {
    console.error(err.message);
    process.exit(1);
});
