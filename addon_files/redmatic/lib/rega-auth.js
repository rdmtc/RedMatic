const path = require('path');
const dgram = require('dgram');

// homematic-rega ships nested inside node-red-contrib-ccu (shallow install strategy)
const { Rega } = require(path.join(__dirname, '..', 'var/node_modules/node-red-contrib-ccu/node_modules/homematic-rega'));

const regaHost = '127.0.0.1';
const regaAuthPort = 1998;
const regaScriptPort = 8183;

const rega = new Rega({
    host: regaHost,
    port: regaScriptPort,
    translate: false
});

// Node-RED resolves the token of every admin API request to a user by
// calling users(username) - with dozens of parallel requests while the
// editor loads. ReGaHSS runs scripts one at a time, so asking it every
// time made a share of those requests fail and the editor stop at "Lade
// Plugins" with random 401s. Users are therefore cached for a while,
// parallel lookups of the same user share one script, and while ReGa is
// busy or down a user we already know stays logged in.
const userCacheTtl = 15 * 60 * 1000;
const userCache = new Map(); // username -> { user, ts }
const pending = new Map();   // username -> Promise

// resolves to the user object, null if the CCU does not know the user;
// rejects when ReGa could not be asked
async function lookupUser(username) {
    // the username ends up inside a rega script string literal
    const name = String(username).replace(/[\\"]/g, '');
    const { objects } = await rega.exec(`
        var user = dom.GetObject(ID_USERS).Get("${name}");
        var level;
        if (user) {
            level = user.UserLevel();
        }
    `);
    if (objects.user === name) {
        // Todo: set Node-RED permissions dependent on the rega user level
        // (objects.level: 8 = admin, 2 = user, 1 = guest)
        return { username: name, permissions: '*' };
    }
    return null;
}

function getUser(username) {
    const cached = userCache.get(username);
    if (cached && Date.now() - cached.ts < userCacheTtl) {
        return Promise.resolve(cached.user);
    }
    if (pending.has(username)) {
        return pending.get(username);
    }
    const lookup = lookupUser(username)
        .then(user => {
            if (user) {
                userCache.set(username, { user, ts: Date.now() });
            } else {
                userCache.delete(username);
            }
            return user;
        })
        .catch(() => (cached ? cached.user : null))
        .finally(() => pending.delete(username));
    pending.set(username, lookup);
    return lookup;
}

function escapeColon(str) {
    return str.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
}

function checkPassword(username, password, callback) {
    const message = Buffer.from(escapeColon(username) + ':' + escapeColon(password));
    const client = dgram.createSocket('udp4');
    client.on('message', (msg, rinfo) => {
        client.close();
        callback(rinfo.size === 1 && msg.toString() === '1');
    });
    client.send(message, regaAuthPort, regaHost);
}

module.exports = {
    type: 'credentials',
    users: username => getUser(username),
    authenticate: async (username, password) => {
        const user = await getUser(username);
        if (!user) {
            return null;
        }
        return new Promise(resolve => {
            checkPassword(username, password, valid => resolve(valid ? user : null));
        });
    },
    default: () => Promise.resolve(null)
};
