// Validates the files of the Node-RED file context store and quarantines
// corrupted ones (renamed to <file>.corrupt), so a file that was truncated by
// a power loss cannot prevent Node-RED from starting (issue #452).
// Called by bin/checkContext from the start sequence in bin/redmatic.

const fs = require('fs');
const path = require('path');

let settings;
try {
    settings = JSON.parse(fs.readFileSync('/usr/local/addons/redmatic/etc/settings.json', 'utf8'));
} catch {
    process.exit(0);
}

const dir = settings
    && settings.contextStorage
    && settings.contextStorage.file
    && settings.contextStorage.file.config
    && settings.contextStorage.file.config.dir;

if (!dir) {
    process.exit(0);
}

function check(file) {
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (typeof data !== 'object' || data === null) {
            throw new TypeError('not an object');
        }
    } catch (err) {
        try {
            fs.renameSync(file, file + '.corrupt');
            console.log('context file ' + file + ' corrupted (' + err.message + '), quarantined as ' + path.basename(file) + '.corrupt');
        } catch {}
    }
}

function walk(d) {
    let entries;
    try {
        entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
        return;
    }
    for (const entry of entries) {
        const p = path.join(d, entry.name);
        if (entry.isDirectory()) {
            walk(p);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            check(p);
        }
    }
}

walk(path.join(dir, 'context'));
