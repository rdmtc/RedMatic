#!/usr/bin/env node

/**
 * Resolves an Alpine package and everything it needs into a list of .apk URLs.
 *
 *   node alpine-packages.mjs nodejs armv7 [branch] [mirror]
 *
 * Why not just run `apk` in a container: the whole armv7l runtime is four steps - resolve,
 * download, unpack, patch - and apk only does the first. Doing it here keeps the build to curl,
 * tar and patchelf, which is one moving part instead of a docker daemon plus whichever apk-tools
 * version the image happens to ship.
 *
 * APKINDEX is a flat text file of records: P (package), V (version), D (dependencies), p
 * (what it provides). Dependencies are either plain package names, `so:libfoo.so.1` for a shared
 * library, or a virtual like `icu-data=78.1-r0` - all three are resolved through `p:`.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [pkg = 'nodejs', arch = 'armv7', branch = 'edge', mirror = 'https://dl-cdn.alpinelinux.org/alpine'] =
    process.argv.slice(2);

const base = `${mirror}/${branch}/main/${arch}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'apkindex-'));
try {
    execFileSync('sh', ['-c', `curl -fsSL --max-time 120 "${base}/APKINDEX.tar.gz" | tar -xzf - -C "${tmp}" APKINDEX`]);
    var index = fs.readFileSync(path.join(tmp, 'APKINDEX'), 'utf8');
} finally {
    fs.rmSync(tmp, {recursive: true, force: true});
}

/** @type {Map<string, {name: string, version: string, deps: string[]}>} */
const packages = new Map();
/** what a name (package, so:…, virtual) resolves to */
const provides = new Map();

for (const block of index.split('\n\n')) {
    const fields = {};
    for (const line of block.split('\n')) {
        const colon = line.indexOf(':');
        if (colon < 1) continue;
        (fields[line.slice(0, colon)] ||= []).push(line.slice(colon + 1));
    }
    if (!fields.P) continue;
    const entry = {
        name: fields.P[0],
        version: fields.V[0],
        deps: (fields.D ? fields.D[0].split(' ') : []).filter(Boolean),
    };
    packages.set(entry.name, entry);
    provides.set(entry.name, entry.name);
    for (const item of fields.p ? fields.p[0].split(' ') : []) {
        const name = item.split('=')[0];
        // first provider wins, which is Alpine's own default (icu-data-en over icu-data-full)
        if (!provides.has(name)) provides.set(name, entry.name);
    }
}

const seen = new Set();
const queue = [pkg];
const result = [];
while (queue.length > 0) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    const entry = packages.get(name);
    if (!entry) {
        console.error(`error: no package "${name}" in alpine/${branch}/main/${arch}`);
        process.exit(1);
    }
    result.push(entry);
    for (const dep of entry.deps) {
        // "!foo" is a conflict, "/bin/sh" a command dependency - neither pulls a package in
        if (dep.startsWith('!') || dep.startsWith('/')) continue;
        const target = provides.get(dep.split(/[=<>~]/)[0]);
        if (target && !seen.has(target)) queue.push(target);
    }
}

for (const entry of result) {
    process.stdout.write(`${base}/${entry.name}-${entry.version}.apk\n`);
}
