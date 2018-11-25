const fs = require('fs');

const defaults = require('/usr/local/addons/redmatic/lib/node_modules/node-red/settings.js');
const settings = require('/usr/local/addons/redmatic/etc/settings.json');
const logging = require('/usr/local/addons/redmatic/lib/logger.js');

// Migration
if (settings.logging.console) {
    settings.logging.ain = settings.logging.console;
    delete settings.logging.console;
    fs.writeFileSync('/usr/local/addons/redmatic/etc/settings.json', JSON.stringify(settings, null, '  '));
}

// Credentials encryption key
if (fs.existsSync('/usr/local/addons/redmatic/etc/credentials.key')) {
    settings.credentialSecret = fs.readFileSync('/usr/local/addons/redmatic/etc/credentials.key').toString();
}

// Logging
delete defaults.logging.console;
Object.assign(logging.logging.ain, settings.logging.ain);

// https://github.com/HM-RedMatic/RedMatic/issues/45
if (!defaults.editorTheme) {
    defaults.editorTheme = {};
}
if (!defaults.editorTheme.projects) {
    defaults.editorTheme.projects = {};
}
defaults.editorTheme.projects.enabled = false;

module.exports = Object.assign(
    defaults,
    settings,
    logging
);
