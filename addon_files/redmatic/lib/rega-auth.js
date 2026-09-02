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

async function getUserLevel(username) {
    // the username ends up inside a rega script string literal
    const name = String(username).replace(/[\\"]/g, '');
    try {
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
    } catch {
        // rega not reachable - treat as unknown user
    }
    return null;
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
    users: username => getUserLevel(username),
    authenticate: async (username, password) => {
        const user = await getUserLevel(username);
        if (!user) {
            return null;
        }
        return new Promise(resolve => {
            checkPassword(username, password, valid => resolve(valid ? user : null));
        });
    },
    default: () => Promise.resolve(null)
};
