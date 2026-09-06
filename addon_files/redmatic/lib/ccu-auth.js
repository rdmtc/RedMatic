// Node-RED adminAuth against the users of the box RedMatic runs on.
//
// Two kinds of box, one configuration (`"adminAuth": {"type": "rega"}`):
//
//   CCU3 / RaspberryMatic / OpenCCU  ->  lib/rega-auth.js, unchanged: the
//                                        ReGa DOM knows the users, the
//                                        password is checked by ReGa's
//                                        authentication service on UDP 1998.
//   openccu-lite                     ->  no ReGaHSS at all (nothing listens
//                                        on 8181/8183). The box has its own
//                                        user database behind
//                                        POST /api/auth/v1/login.
//
// Which one is decided at runtime, once, by asking the box
// GET /api/meta/v1/version - the detection openccu-lite's porting guide
// prescribes: a CCU answers 404 or HTML, openccu-lite answers
// {"api":"meta","version":1}. Nothing has to be configured, and a backup
// moved from one kind of box to the other keeps working.
//
// node:http on purpose: no new dependency, and the box is on the loopback.

const http = require('http');

const regaAuth = require('/usr/local/addons/redmatic/lib/rega-auth.js');

const boxHost = '127.0.0.1';
const boxPort = 80;
const probeTimeout = 2000;
const requestTimeout = 10000;
// how long a failed probe (web server not up yet) is left alone before asking again
const probeRetryDelay = 30000;

let boxKind = null; // 'rega' | 'occulite', null while unknown
let probing = null;
let probedAt = 0;

// users the box confirmed by letting them log in
const userCache = new Map(); // username -> {username, permissions}

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(Object.assign({host: boxHost, port: boxPort}, options), res => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => {
                if (data.length < 65536) {
                    data += chunk;
                }
            });
            res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: data}));
        });
        req.on('error', reject);
        req.setTimeout(options.timeout || requestTimeout, () => {
            req.destroy(new Error('timeout'));
        });
        if (body === undefined) {
            req.end();
        } else {
            req.end(body);
        }
    });
}

// resolves to 'rega' or 'occulite'; a box that cannot be asked stays unknown
// and is retried later - until then the ReGa path is used, which is what a
// CCU needs and what openccu-lite falls back from without doing any harm.
function detect() {
    if (boxKind) {
        return Promise.resolve(boxKind);
    }
    if (probing) {
        return probing;
    }
    if (Date.now() - probedAt < probeRetryDelay) {
        return Promise.resolve('rega');
    }
    probing = request({method: 'GET', path: '/api/meta/v1/version', timeout: probeTimeout})
        .then(res => {
            let kind = 'rega';
            if (res.status === 200) {
                try {
                    kind = JSON.parse(res.body).api === 'meta' ? 'occulite' : 'rega';
                } catch {}
            }
            boxKind = kind;
            console.log(kind === 'occulite' ?
                'openccu-lite detected: Node-RED admin login uses the users of the box (/api/auth/v1), there is no ReGaHSS' :
                'CCU detected: Node-RED admin login uses the ReGaHSS users');
            return kind;
        })
        .catch(() => 'rega') // web server not up (yet): ask again later
        .finally(() => {
            probedAt = Date.now();
            probing = null;
        });
    return probing;
}

// One session per Node-RED login would pile up on the box's Sessions page,
// so the session the login created is handed back right away. Best effort.
function logout(sid) {
    return request({
        method: 'POST',
        path: '/api/auth/v1/logout',
        headers: {'Content-Type': 'application/json', 'Content-Length': 2, Authorization: 'Bearer ' + sid}
    }, '{}').catch(() => {});
}

async function occuliteAuthenticate(username, password) {
    const payload = JSON.stringify({username: String(username), password: String(password)});
    let res;
    try {
        res = await request({
            method: 'POST',
            path: '/api/auth/v1/login',
            // lighttpd answers 411 without a Content-Length
            headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload)}
        }, payload);
    } catch {
        return null;
    }

    if (res.status !== 200) {
        // 401 wrong credentials, 429 lockout after repeated failures
        return null;
    }

    let sid;
    try {
        sid = JSON.parse(res.body).sid;
    } catch {}

    if (sid) {
        logout(sid);
    }

    // Todo: set Node-RED permissions dependent on the role (admin/user), as
    // for the ReGa user level
    const user = {username: String(username), permissions: '*'};
    userCache.set(user.username, user);
    return user;
}

// Node-RED asks for a user when it resolves the token of an admin request -
// with a name it issued that token to itself (editor-api auth/strategies.js:
// Tokens.get(token) -> Users.get(token.user)). openccu-lite has no endpoint
// that confirms a user without their password (GET /api/auth/v1/users needs
// an admin credential, which the addon does not have), so a name we have not
// seen log in is accepted: the session it comes from was created by a
// successful login against the box. Sessions still expire (sessionExpiryTime).
function occuliteUser(username) {
    const cached = userCache.get(username);
    if (cached) {
        return cached;
    }
    return {username: String(username), permissions: '*'};
}

module.exports = {
    type: 'credentials',
    users: async username => {
        const kind = await detect();
        return kind === 'occulite' ? occuliteUser(username) : regaAuth.users(username);
    },
    authenticate: async (username, password) => {
        const kind = await detect();
        return kind === 'occulite' ?
            occuliteAuthenticate(username, password) :
            regaAuth.authenticate(username, password);
    },
    default: () => Promise.resolve(null)
};
