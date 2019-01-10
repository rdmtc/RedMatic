const path = require('path');
const dgram = require('dgram');

const Rega = require(path.join(__dirname, '..', 'var/node_modules/node-red-contrib-ccu/node_modules/homematic-rega'));

const regaHost = '127.0.0.1';
const regaAuthPort = 1998;
const regaScriptPort = 8183;

const rega = new Rega({
    host: regaHost,
    port: regaScriptPort
});

function getUserLevel(username, callback) {
    rega.exec(`
        var user = dom.GetObject(ID_USERS).Get("${username}");
        var level;
        if (user) {
            level = user.UserLevel();
        }
    `, (err, stdout, objects) => {
        if (objects.user === username) {
            let permissions;
            switch (objects.level) {
                // Todo set Node-RED permissions dependent on Rega User Level
                /*
                case 8:
                    // Admin
                    break;
                case 2:
                    // User
                    break;
                case 1:
                    // Guest
                    break;
                 */
                default:
                    permissions = '*';
            }
            callback({username, permissions})
        } else {
            callback(null)
        }
    });
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
    type: "credentials",
    users: username => {
        return new Promise(resolve => {
            getUserLevel(username, resolve);
        });
    },
    authenticate: (username, password) => {
        return new Promise(resolve => {
            getUserLevel(username, user => {
                if (user) {
                    checkPassword(username, password, valid => {
                        if (valid) {
                            resolve(user);
                        } else {
                            resolve(null);
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        });
    },
    default: () => {
        return new Promise(resolve => {
            resolve(null);
        });
    }
};
