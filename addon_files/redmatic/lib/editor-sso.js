// Loaded into the Node-RED editor page (editorTheme.page.scripts) where the editor signs in with the
// session of the system it runs on (openccu-lite, lib/ccu-auth.js). It runs before the editor starts.
//
// There every request and the comms WebSocket upgrade are authenticated from the system's session, so
// the editor needs no token of its own. A token the browser still keeps from an earlier login in
// Node-RED's own form, one that expired or went with var/.sessions.json, is not harmless though: the
// editor sends it over the comms socket as an auth packet, Node-RED answers "auth fail", and its login
// dialog comes up over the loaded workspace (bug 14). The HTTP requests never show it, as Node-RED
// falls back from an unknown bearer token to the session. So the stored token is dropped here, under
// the key the editor itself uses (red.js: "auth-tokens" plus the page path with - for /).
(function () {
    try {
        var suffix = window.location.pathname.slice(0, -1).replace(/\//g, '-');
        window.localStorage.removeItem('auth-tokens' + suffix);
    } catch {
        // no storage (a private window): then there is no stale token either
    }
})();
