'use strict';

// alpine-packages.mjs resolves an Alpine package closure over main and community: on a stable
// branch the Node line of engines.node can be community's nodejs-current (v3.24: Node 26, main's
// nodejs is 24), and some of its libraries live in community as well. Run against a local
// file:// mirror, so the test needs curl and tar but no network.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync, spawnSync} = require('child_process');

const SCRIPT = path.join(__dirname, '..', 'alpine-packages.mjs');

function record({P, V, D = '', p = ''}) {
    return [`P:${P}`, `V:${V}`, D && `D:${D}`, p && `p:${p}`].filter(Boolean).join('\n');
}

function mirror(repos) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'alpine-mirror-'));
    for (const [repo, records] of Object.entries(repos)) {
        const dir = path.join(root, 'v3.24', repo, 'armv7');
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'APKINDEX'), records.map(record).join('\n\n') + '\n\n');
        execFileSync('tar', ['-czf', 'APKINDEX.tar.gz', 'APKINDEX'], {cwd: dir});
    }
    return root;
}

function resolve(root, pkg) {
    return spawnSync(process.execPath, [SCRIPT, pkg, 'armv7', 'v3.24', `file://${root}`], {encoding: 'utf8'});
}

const repos = {
    main: [
        {P: 'nodejs', V: '24.22.3-r0', D: 'so:libc.musl-armv7.so.1 so:libuv.so.1'},
        {P: 'musl', V: '1.2.6-r3', p: 'so:libc.musl-armv7.so.1=1'},
        {P: 'libuv', V: '1.52.1-r0', p: 'so:libuv.so.1=1.0.0'},
        {P: 'icu-data-en', V: '78.1-r0', p: 'icu-data=78.1-r0'}
    ],
    community: [
        {P: 'nodejs-current', V: '26.13.1-r0', D: 'so:libc.musl-armv7.so.1 so:libuv.so.1 so:libllhttp.so.9.4 icu-data',
            p: 'nodejs cmd:node=26.13.1-r0'},
        {P: 'llhttp', V: '9.4.4-r0', p: 'so:libllhttp.so.9.4=9.4.4'},
        // a second provider of a library main has: main's package must win
        {P: 'libuv-compat', V: '9.9.9-r0', p: 'so:libuv.so.1=9'},
        {P: 'icu-data-full', V: '78.1-r0', p: 'icu-data=78.1-r0'}
    ]
};

test('resolves a community package with its closure from both repositories, the package first', () => {
    const root = mirror(repos);
    try {
        const r = resolve(root, 'nodejs-current');
        assert.strictEqual(r.status, 0, r.stderr);
        const urls = r.stdout.trim().split('\n');
        const base = `file://${root}/v3.24`;
        assert.strictEqual(urls[0], `${base}/community/armv7/nodejs-current-26.13.1-r0.apk`);
        assert.deepStrictEqual(urls.slice(1).sort(), [
            `${base}/community/armv7/llhttp-9.4.4-r0.apk`,
            `${base}/main/armv7/icu-data-en-78.1-r0.apk`,
            `${base}/main/armv7/libuv-1.52.1-r0.apk`,
            `${base}/main/armv7/musl-1.2.6-r3.apk`
        ]);
    } finally {
        fs.rmSync(root, {recursive: true, force: true});
    }
});

test('main\'s nodejs stays main\'s, although nodejs-current provides "nodejs"', () => {
    const root = mirror(repos);
    try {
        const r = resolve(root, 'nodejs');
        assert.strictEqual(r.status, 0, r.stderr);
        assert.match(r.stdout.split('\n')[0], /\/main\/armv7\/nodejs-24\.22\.3-r0\.apk$/);
    } finally {
        fs.rmSync(root, {recursive: true, force: true});
    }
});

test('an unknown package fails with a message', () => {
    const root = mirror(repos);
    try {
        const r = resolve(root, 'nodejs-lts');
        assert.notStrictEqual(r.status, 0);
        assert.match(r.stderr, /no package "nodejs-lts"/);
    } finally {
        fs.rmSync(root, {recursive: true, force: true});
    }
});
