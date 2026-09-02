const fs = require('fs');

const defaults = require('/usr/local/addons/redmatic/lib/node_modules/node-red/settings.js');
const settings = require('/usr/local/addons/redmatic/etc/settings.json');
const logging = require('/usr/local/addons/redmatic/lib/logger.js');

// Migration: logging key was named "console" (1.x) and "ain" (2.x - 8.x)
if (!settings.logging) {
    settings.logging = {};
}
let loggingMigrated = false;
if (settings.logging.console) {
    settings.logging.syslog = settings.logging.console;
    delete settings.logging.console;
    loggingMigrated = true;
}
if (settings.logging.ain) {
    settings.logging.syslog = settings.logging.ain;
    delete settings.logging.ain;
    loggingMigrated = true;
}
if (loggingMigrated) {
    fs.writeFileSync('/usr/local/addons/redmatic/etc/settings.json', JSON.stringify(settings, null, '  '));
}

// Credentials encryption key
if (fs.existsSync('/usr/local/addons/redmatic/etc/credentials.key')) {
    settings.credentialSecret = fs.readFileSync('/usr/local/addons/redmatic/etc/credentials.key').toString();
}

// Logging
delete defaults.logging.console;
Object.assign(logging.logging.syslog, settings.logging.syslog);

// Enable Projects Feature
if (!defaults.editorTheme) {
    defaults.editorTheme = {};
}
if (!defaults.editorTheme.projects) {
    defaults.editorTheme.projects = {};
}
defaults.editorTheme.projects.enabled = defaults.editorTheme.projects.enabled || false;

// Inject sessionExpiryTime to Rega Authentication
if (settings.adminAuth && settings.adminAuth.type === 'rega') {
    const regaAuth = require('/usr/local/addons/redmatic/lib/rega-auth.js');
    if (settings.adminAuth.sessionExpiryTime) {
        regaAuth.sessionExpiryTime = settings.adminAuth.sessionExpiryTime;
    }
    settings.adminAuth = regaAuth;
}

// Context Storage
if (!settings.contextStorage) {
    settings.contextStorage = {};
}
if (!settings.contextStorage.default) {
    settings.contextStorage.default = {};
}
if (!settings.contextStorage.default.module) {
    settings.contextStorage.default.module = 'memory';
}
if (settings.contextStorage.default.module === 'localfilesystem') {
    settings.contextStorage.default.module = 'file';
}

if (settings.contextStorage.default.module !== 'file' && settings.contextStorage.default.module !== 'memory') {
    settings.contextStorage.default.module = 'memory';
}

if (!settings.contextStorage.memory) {
    settings.contextStorage.memory = {
        'module': 'memory'
    }
}
if (!settings.contextStorage.file) {
    settings.contextStorage.file = {
        'module': 'localfilesystem',
        config: {
            dir: '/usr/local/addons/redmatic/var',
            flushInterval: 30
        }
    }
}

const defaultContextStorage = Object.assign({}, settings.contextStorage[settings.contextStorage.default.module]);
delete settings.contextStorage[settings.contextStorage.default.module];
settings.contextStorage.default = defaultContextStorage;

const result = Object.assign(
    defaults,
    settings,
    logging
);

// User settings overrides (#353, #50): etc/settings-user.js is not part of
// the addon package, so it survives updates. It is merged last - anything
// Node-RED's settings know (https/TLS, httpStatic, ...) can be set there
// without patching addon files.
if (fs.existsSync('/usr/local/addons/redmatic/etc/settings-user.js')) {
    Object.assign(result, require('/usr/local/addons/redmatic/etc/settings-user.js'));
}

fs.writeFileSync('/tmp/red-settings.json', JSON.stringify(result));

module.exports = result;
