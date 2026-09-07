# RedMatic Bugs

Known open defects. Feature work and larger refactorings live in
[ROADMAP.md](ROADMAP.md) — this file is only for things that are broken.

Convention (same scheme as the roadmap): bug numbers are stable and never
reused. This file holds only open bugs — when a bug is fixed, its content moves
to [roadmap-archive/](roadmap-archive/) as `bug-<n>.md` and its line in the
contents below gets a ✅ marker linking into the archive.

## Contents

- [1. Node-RED crashes shortly after start on OpenCCU since 9.3.0](#1-node-red-crashes-shortly-after-start-on-openccu-since-930)
- 2. The self-update can start Node-RED twice ✅ [archived](roadmap-archive/bug-2.md)

## 1. Node-RED crashes shortly after start on OpenCCU since 9.3.0

**Fix released in `9.4.1` (2026-09-07) — awaiting confirmation from the
reporter, [#601](https://github.com/rdmtc/RedMatic/issues/601)**

Kept open on purpose: the crash was never reproduced in the lab, so the fix
rests on the code path plus the reporter's log, not on a reproduction. Archive
it to `roadmap-archive/bug-1.md` once he confirms 9.4.1 starts.

Reporter: @tollaner, OpenCCU on a Raspberry Pi 4. Since **9.3.0** the RedMatic
service does not come up any more — it "keeps crashing" (*"Der Dienst schmiert
immer wieder ab"*) shortly after start. **9.4.0 has the same problem**, and it
appears regardless of how the update was installed (the new self-update button
on the RedMatic settings page as well as the OpenCCU addon installation).
9.2.0 was fine on the same box.

No logs from the reporter yet. **Do not start on a fix before those logs
exist** — the analysis below is strong but the decisive line is still missing.

### The reporter's log (2026-09-07) — the decisive evidence

Posted in the issue. The uncaught exception is **identical on every restart**,
~4 s after `Starting Node-RED`:

```
Sep  6 20:46:34 OpenCCU daemon.err node-red: [red] Uncaught Exception:
Sep  6 20:46:34 OpenCCU daemon.err node-red[6778]: Error: socket hang up
Sep  6 20:46:34 OpenCCU daemon.err node-red[6778]:     at Socket.socketOnEnd (node:_http_client:790:25)
Sep  6 20:46:34 OpenCCU daemon.err node-red[6778]:     at Socket.emit (node:events:526:24)
Sep  6 20:46:34 OpenCCU daemon.err node-red[6778]:     at endReadableNT (node:internal/streams/readable:1757:12)
Sep  6 20:46:34 OpenCCU daemon.err node-red[6778]:     at processTicksAndRejections (node:internal/process/task_queues:90:21)
Sep  6 20:46:35 OpenCCU daemon.err node-red: Node-RED exited with non-zero exit status 1
Sep  6 20:46:35 OpenCCU daemon.warn redmatic: Restarting Node-RED (1/3)
```

repeating until `Maximum Node-RED restarts exceeded`. Box: OpenCCU on a Pi 4,
**aarch64** package, self-update 9.2.0 → 9.4.0; the reporter went back to 9.2.0
afterwards, which starts fine.

What this establishes:

- It is an **outgoing HTTP request** (`node:_http_client`) whose socket was
  closed by the peer without a response, and whose request object has **no
  `'error'` listener** → the `'error'` emit throws.
- The stack has **zero userland frames**, which is the fingerprint of an
  `http.request()` that was simply never given a handler.
- **This rules out suspects 1 and 2 below** (both BINRPC, both would show
  `binrpc/lib/*` frames). Suspect 4 — the port flip — is promoted: it is the
  HTTP side of the flip that matters (ReGa 8181 → **8183**, HmIP-RF 2010 →
  **32010**, VirtualDevices 9292 → **39292**). Up to 9.2.0 those requests went
  through **lighttpd**, which answers politely; from 9.3.0 they go straight to
  the daemons, which can just close the socket.

**Safe Mode starts fine** (reporter, 2026-09-07): *"Im Safe-Mode läuft RedMatic
hoch. Das System ist ein aarch64."* That is decisive — in Safe Mode the flows
are not executed, so the crash comes from **the flows**, i.e. from the
`ccu-connection` node actually connecting, and **not** from Node-RED's start,
the addon scripts or the palette. It also confirms the **aarch64** package.

### Debug log + `netstat` (reporter, 2026-09-07) — the moment of the crash

```
18:38:15 [ccu-connection:raspberrymatic] virtualdevices get groups
18:38:15 [ccu-connection:raspberrymatic] getRegaVariables
18:38:15 [ccu-connection:raspberrymatic] rpc client ReGaHSS binrpc 127.0.0.1:31999
18:38:15 [ccu-connection:raspberrymatic] rpc client HmIP-RF xmlrpc 127.0.0.1:32010
18:38:15 [ccu-connection:raspberrymatic] rpc client VirtualDevices xmlrpc 127.0.0.1:39292/groups
18:38:15 [ccu-connection:raspberrymatic] rpc client CUxD binrpc 127.0.0.1:8701
18:38:15 [ccu-connection:raspberrymatic] Interfaces: ReGaHSS, HmIP-RF, VirtualDevices, CUxD
...
18:38:15 [ccu-connection:raspberrymatic] setVariable PV_Mittel dom.GetObject(49780).State(311.3);
18:38:15 [ccu-connection:raspberrymatic] getRegaPrograms
18:38:15 [ccu-connection:raspberrymatic] Interface HmIP-RF http port 32010 connected
18:38:15 [redmatic-homekit-homematic-devices:...] waiting for the ccu device list (658/710 devices/names)
18:38:15 [ccu-connection:raspberrymatic] rpc < http listDevices ["nr_D24DjW_HmIP-RF"]
18:38:16 [ccu-connection:raspberrymatic]     > HmIP-RF listDevices [{...}]
18:38:16 node-red: [red] Uncaught Exception:
18:38:16 node-red[5959]: Error: socket hang up
```

What this establishes:

- **The `isLocal` flip is confirmed on his box**: `rpc client ReGaHSS binrpc
  127.0.0.1:31999`, `HmIP-RF xmlrpc 127.0.0.1:32010`, `VirtualDevices xmlrpc
  127.0.0.1:39292` — all direct ports, exactly as predicted. His `netstat`
  confirms the ownership: `8183`/`31999` → **ReGaHss**, `32010`/`39292` →
  **java** (IPv6-only listeners, `:::`), `32001` → **rfd**, while
  `8181`/`1999`/`2001`/`2010`/`9292` are **lighttpd**.
- **It is a big installation under load at that instant**: **658 devices and
  710 channel names** (the `658/710 devices/names` counter is
  redmatic-homekit's, `redmatic-homekit-homematic-devices.js:262-268` — two
  separate counts from the cached metadata, *not* 710 devices),
  interfaces ReGaHSS + HmIP-RF + VirtualDevices + **CUxD**, and
  **`redmatic-homekit` is installed** and pulling the device list. In the same
  second: `getRegaVariables`, `getRegaPrograms`, a ReGa `setVariable`,
  `virtualdevices get groups`, `getLinks`, and a 658-device `listDevices`
  answer.
- **The outstanding outgoing HTTP requests at the moment of the crash are the
  ReGa ones** (`getRegaVariables`, `getRegaPrograms`, `setVariable` — HTTP to
  ReGaHss on **8183**) — none of them logs a completion before the exception.
  ReGaHss is single-threaded; up to 9.2.0 these went through **lighttpd on
  8181**, which queues, and now hit ReGaHss directly, which can simply close
  the connection under concurrent load. **Hypothesis, not yet proven** — the
  log does not name the failing request, and the stack has no userland frames.
- **Bug 2 reproduces here too, on a plain start**: a second instance (pid
  `6148`) starts alongside `5959`, fails with `Unable to listen on
  http://127.0.0.1:1880/addons/red/` / `Error: port in use` and exits 1. So
  the double start is **not** limited to the self-update path.
- Difference to our lab boxes, any of which may matter: CUxD, redmatic-homekit,
  658 devices, and a callback address of `127.0.0.1` rather than the LAN IP.

Kept below is the analysis that still stands, with the ruled-out items marked.

### Root cause of the behaviour change (verified)

`node-red-contrib-ccu` **4.3.0** rewrote the "am I running on the CCU itself?"
check: the old `/etc/lighttpd/conf.d/proxy.conf` grep was replaced by a
`/proc/net/tcp` listener probe (`nodes/lib/localccu.js`, used at
`nodes/ccu-connection.js:416`). Per contrib-ccu's own CHANGELOG the old check
**had stopped matching on current firmware**, i.e. every RedMatic install ran
with `isLocal === false`. From 4.3.0 it is **`true` on every RedMatic box**.

That single boolean re-routes the whole connection
(`ccu-connection.js:424-473`, `:635`):

| | 9.2.0 (`isLocal=false`) | 9.3.0+ (`isLocal=true`) |
| --- | --- | --- |
| ReGa HTTP | 8181 | **8183** |
| ReGaHSS RPC | xmlrpc 1999 | **binrpc 31999** |
| BidCos-RF | xmlrpc 2001 | **binrpc 32001** |
| BidCos-Wired | xmlrpc 2000 | **binrpc 32000** |
| HmIP-RF | xmlrpc 2010 | xmlrpc 32010 |
| VirtualDevices | xmlrpc 9292 | xmlrpc 39292 |
| callback server | XML-RPC only | **XML-RPC + BINRPC** |

The interface table and the RPC server code around it are byte-identical
between v4.2.0 and v4.3.0 — the regression surface really is just this flip.
It activates a body of **BINRPC code that had never run on a RedMatic box**.

Confirmed on our own lab boxes running 9.4.0: the log line
`local connection on ccu >= v3.41 detected` appears, followed by
`rpc client ReGaHSS binrpc 127.0.0.1:31999` and
`rpc client BidCos-RF binrpc 127.0.0.1:32001`. That line is **absent in
9.2.0** — its presence alone proves the flip on any given box.

Why "keeps crashing" fits: `addon_files/redmatic/bin/redmaticLoader:45-66` is a
`while [ "$status" != 0 ]` supervisor that restarts Node-RED on a non-zero exit
and logs `Restarting Node-RED (n/limit)` then `Maximum Node-RED restarts
exceeded`. An uncaught exception (exit 1) produces exactly that. Node 24 also
exits on unhandled rejections.

### Ranked suspects (all still present in 4.4.0)

1. ~~**BINRPC callback-server errors are an uncaught exception**~~ — **ruled
   out by the log** (no `binrpc` frames), but a genuine latent bug:
   `ccu-connection.js:2184-2197` attaches the `'error'` handler to the *inner*
   `net` server, but `binrpc/lib/server.js:73-75` re-emits on the `Server`
   wrapper, which then has no listener → EventEmitter throws. The XML-RPC path
   does **not** have this bug (`homematic-xmlrpc/lib/server.js:74-75` emits on
   the object contrib-ccu listens to) — which is exactly why 9.2.0 survived.
   Verified experimentally by the research pass. Trigger: any `listen()`
   failure on `rpcBinPort` (EADDRINUSE, EADDRNOTAVAIL).
2. ~~**BINRPC response encoding throws inside a socket `data` handler**~~ —
   **ruled out by the log**, also a genuine latent bug:
   `binrpc/lib/protocol.js:66-70` throws `TypeError: argument 'obj' must be
   type number, string, boolean or object` on `null`/`undefined`, and
   `binrpc/lib/server.js:135` encodes the response synchronously in the
   socket's `'data'` handler → uncaught. The reachable payload is
   `listDevicesAnswer`'s default branch, `ccu-connection.js:2520`:
   `{ADDRESS: device.ADDRESS, VERSION: device.VERSION}` with no `undefined`
   stripping (the HmIP/VirtualDevices branch at `:2505-2514` *does* strip).
   `listDevices` is what `rfd` calls immediately after `init` — seconds after
   start. Depends on the box's cached metadata, which would explain why only
   some users are hit. Direct precedent: contrib-ccu issue **#186** was the
   same shape.
3. **Abandoned BINRPC clients with a self-multiplying reconnect chain** —
   `ccu-connection.js:3152-3153` drops the old `Client` without closing its
   socket; `binrpc/lib/client.js:56-80` reconnects from `'error'`, `'end'`
   *and* `'close'`. Grows linearly per generation → fd/timer leak ending in
   EMFILE. Not a crash in the first seconds, so ranked below 1 and 2 — but
   note that before 4.3.0 no RedMatic box had a live binrpc client at all.
4. **Wrong-port fallout — now the leading suspect, promoted by the log.** if any of the
   3xxxx ports or 8183 is closed on the reporter's box, the resulting
   init/timeout/re-init loop is what *feeds* suspects 2 and 3. Note
   `localccu.js:26` requires only **one** of 32001/31999 to listen and then
   switches everything over wholesale.

Ruled out by the research pass: the `msg.config` / dynconfig work, the ccu-mqtt
rewrite, `channelfilter`/`valuestatus`/`cast` (all `on('input')` paths), node
constructor throws (Node-RED's loader catches those). Everything new in
**4.4.0** (openccu-lite metaprovider) is try/catch'd and only active in
`metaMode`, consistent with the regression starting at 9.3.0 — though
`startMeta`'s `onGone` does `this.detectMeta().then(...)` with no `.catch`,
which is worth fixing on its own.

### Reproduction attempts — not reproduced anywhere yet

| date | box | setup | result |
| --- | --- | --- | --- |
| 2026-09-07 | `ccu-charly` — CCU3 fw 3.89.8, **armv7l**, ReGaHSS + radio, 164 cached devices | 9.4.0 upgrade, existing flows | **not reproduced** |
| 2026-09-07 | `ccu-arm64` (172.16.23.138) — OpenCCU 3.89.8.20260719 **rpi4/aarch64**, ReGaHSS, **no radio, no devices** | 9.4.0 fresh install, then flows added | **not reproduced** |

`ccu-charly`: `versions` says `VERSION_ADDON=9.4.0`, Node 24.18.1, Node-RED
5.0.6, bundled contrib-ccu **4.4.0**. The connection was really exercised —
`rpcCheckInit BidCos-RF`, BinRPC `ping`/`PONG` round trips, `getRegaVariables`,
`getRegaPrograms`, `stats rpc subscribers 57`.

`ccu-arm64` (the closest platform match to the report) was taken from 9.1.0 to
**9.4.0** over the OpenCCU live-install path. It first started with *no flows
at all* (`Creating new flow file`), so a `ccu-connection` + `ccu-sysvar` flow
was deployed and Node-RED restarted so the flow loads **at startup**. Three
rounds, none of which crashed:

1. ReGaHSS + VirtualDevices only → both connected, stable.
2. Same after a full restart → identical, stable.
3. BidCos-RF and HmIP-RF additionally enabled although `rfd`/`hmipserver` do
   **not** run on that box → `init … Error: connect ECONNREFUSED 127.0.0.1:32001`
   / `:32010`, handled cleanly, `Interface … disconnected`, process alive and
   still alive 2.5 min later.

So an unreachable interface alone does not do it. **Why the lab boxes survive
is consistent with suspect 2**: `ccu-arm64` has no devices at all, and
`ccu-charly`'s cached metadata (`var/ccu_127.0.0.1.json`, 164 devices across
HmIP-RF and BidCos-RF) has **0 devices without `VERSION`** — checked
2026-09-07 — so the throwing branch cannot be hit on either box. A box whose
cache has a BidCos-RF/Wired device without `VERSION` would behave differently.

### What to get from the reporter

Asked in the issue (comment posted 2026-09-07): debug-level log via the wiki
[Loglevel](https://github.com/rdmtc/RedMatic/wiki/Loglevel) page, whether
[Safe Mode](https://github.com/rdmtc/RedMatic/wiki/Safe-Mode) starts, the
OpenCCU version and which package (`aarch64` vs `armv7l`), and the
palette-installed nodes.

Grep targets, by suspect:

- **1**: `Error: listen EADDRINUSE`/`EADDRNOTAVAIL` with a `binrpc/lib/server.js`
  frame, often preceded by `binrpc server close timeout`.
- **2**: `TypeError: argument 'obj' must be type number, string, boolean or
  object` with `encodeData`/`encodeStruct`/`encodeResponse` frames in
  `binrpc/lib/protocol.js`, right after
  `init BidCos-RF (binrpc 127.0.0.1:32001) callback binrpc://…`.
- **3**: no crash line — `EMFILE: too many open files`, rising memory,
  repeated `rpc client BidCos-RF binrpc …` / error pairs.
- **either way**: `local connection on ccu >= v3.41 detected` proves the flip;
  `netstat -tlnp | grep -E '8183|31999|32001|32010|39292'` shows whether the
  direct ports are actually there.
- also useful: `/usr/local/addons/redmatic/var/restart_count`.

### The fix (node-red-contrib-ccu 4.4.1, bundled in RedMatic 9.4.1)

The crash is an **unhandled promise rejection**, not a missing `'error'`
listener: `homematic-rega` does attach one (`index.js:207`, `req.on('error',
reject)`), so a `socket hang up` becomes a rejected promise — and Node >= 15
turns an unhandled one into an uncaught exception. That is why the stack has
no userland frames: the Error was created inside `node:_http_client` and never
travelled through contrib-ccu's code.

The dropped promise is the **deferred `setVariable` queue flush**,
`nodes/ccu-connection.js` in `getRegaVariables`: a write that arrives before
the variable list is known is queued, and the queue is flushed with a `reduce`
chain whose result was never caught. The reporter's log shows exactly that
sequence — `getRegaVariables`, then `setVariable PV_Mittel
dom.GetObject(49780).State(311.3);`, then the exception.

Fixed in 4.4.1 by catching that chain, plus the same floating-promise pattern
for `setVariable`/`programActive`/`programExecute` in `ccu-mqtt` and
`regaPoll`'s `finally` chain. Verified deterministically: the unpatched shape
exits 1 under Node 24, the patched shape logs and survives; a patched build
runs on `ccu-arm64` with the connection up and no regression.

**Still to confirm on the reporter's box.** If 9.4.1 does not fix it, the
fallback diagnosis is unchanged: forcing `isLocal = false` should restore a
working start.

### Lab port probe (2026-09-07, `ccu-arm64`)

`netstat -tlnp` on the lab OpenCCU Pi 4 shows who owns which port, and it
matches the theory that the flip changes *who answers*:

- `8181`, `1999`, `2001`, `2010`, `9292` (and the 4xxxx TLS variants) →
  **lighttpd**
- `8183`, `31999` → **ReGaHss** directly
- `39292` → the **java** process (IPv6-only listener, `:::39292`)
- `32001` / `32010` → absent on this box (no `rfd`/`hmipserver`)

A plain `GET / HTTP/1.0` to `8183` answers `HTTP/1.1 200 OK` here, so the
direct ReGa port is not broken as such — whatever closes the socket on the
reporter's box is situational (load, readiness, or a request the daemon
rejects by closing).

Lab boxes are documented in the private lab notes (`~/repos/redmatic-lab.md`),
not in this repo.
