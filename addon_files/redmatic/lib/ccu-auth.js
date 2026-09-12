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

// Single sign-on with the box's own session (the maintainer, 2026-09-10: "node-red verlangt
// username/passwort obwohl ich doch schon in openccu-lite eingeloggt bin").
//
// The editor is served under /addons/red/, behind the session gate of the box - a browser that
// gets there has already logged in, and it carries the `occulite_session` cookie. Node-RED's
// `tokens` hook is handed the header named by `tokenHeader`, so with `cookie` the raw cookie
// arrives here and the box itself says whose session it is (GET /api/auth/v1/state, the same
// endpoint the box's own shell asks). The strategy chain is ['bearer','tokens','anon'], so the
// editor's own token still wins and this only fills in where there is none - which is the first
// request of a fresh editor, the one that used to produce the login form.
//
// It widens nothing: the request has already passed lighttpd's gate for /addons/, and a cookie
// that does not name a live session of the box is refused here as well.
const sessionCacheTtl = 30 * 1000;
const sessionCache = new Map(); // sid -> {user, ts}

// Every session id the Cookie header carries, in header order. Anchored at the start or at a
// separator, as the box's own gate does it: a cookie that merely *ends* in occulite_session is
// not the session cookie. openccu-lite names the cookie per scheme - occulite_session from a
// login over http, __Secure-occulite_session from one over https - and a stale cookie of one name
// can stand before a live one of the other, so every match is a candidate.
function sidsFromCookie(header) {
    if (typeof header !== 'string') {
        return [];
    }
    const sids = [];
    for (const match of header.matchAll(/(?:^|[;,\s])(?:__Secure-)?occulite_session=([\w@]+)/g)) {
        const sid = match[1].replace(/^@/, '').replace(/@$/, '');
        if (sid && !sids.includes(sid)) {
            sids.push(sid);
        }
    }
    return sids;
}

async function occuliteTokens(cookieHeader) {
    for (const sid of sidsFromCookie(cookieHeader)) {
        const user = await userForSid(sid);
        if (user) {
            return user;
        }
    }
    return null;
}

// The box's own answer for one session id: its user, or null when it names no live session.
async function userForSid(sid) {
    const cached = sessionCache.get(sid);
    if (cached && Date.now() - cached.ts < sessionCacheTtl) {
        return cached.user;
    }
    let res;
    try {
        res = await request({method: 'GET', path: '/api/auth/v1/state', headers: {Cookie: 'occulite_session=' + sid}});
    } catch {
        return null;
    }
    if (res.status !== 200) {
        return null;
    }
    let state;
    try {
        state = JSON.parse(res.body);
    } catch {
        return null;
    }
    if (!state.authenticated || !state.user) {
        return null;
    }
    // the box's roles: an administrator edits, a user reads. A box with the login switched off
    // answers as its anonymous administrator, which is what that box asked for.
    const user = {username: String(state.user), permissions: state.role === 'admin' ? '*' : 'read'};
    sessionCache.set(sid, {user, ts: Date.now()});
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
    // the whole Cookie header, not a bearer token: what the box's session lives in
    tokenHeader: 'cookie',
    tokens: async cookieHeader => {
        const kind = await detect();
        // a CCU keeps its login: ReGa has no endpoint that turns a WebUI session into a user
        return kind === 'occulite' ? occuliteTokens(cookieHeader) : null;
    },
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

// for test/ccu-auth.test.js; not enumerable, so Node-RED sees only its adminAuth keys
Object.defineProperty(module.exports, 'sidsFromCookie', {value: sidsFromCookie});
