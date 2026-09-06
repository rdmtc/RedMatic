# Task 12 — openccu-lite support

**✅ done 2026-09-06** (shipped in `9.4.0`)

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) is a Homematic CCU
firmware **without ReGaHSS**: the interface processes (`rfd`, `hs485d`,
`hmipserver`) are unchanged, but nothing listens on 8181/8183, HM-Script is
never interpreted and there are no ReGa ids. Names, rooms and functions come
from `occulited`'s metadata API (`/api/meta/v1`), users and sessions from its
auth API (`/api/auth/v1`), and a `tclrega.so` shim answers exactly one script:
the session check of an addon settings page.

The rule of the porting kit (openccu-lite `docs/PORTING-PROMPT.md`,
`docs/porting-from-rega.md`): **keep the ReGa path, add a provider, detect at
runtime** — `GET /api/meta/v1/version` answers `{"api":"meta","version":1}` on
openccu-lite and 404/HTML on a CCU. Nothing about a CCU install changes, and a
backup can move between the two kinds of box without editing anything.

## Where RedMatic touched the ReGa, and what happened to it

| place | what it did | now |
| --- | --- | --- |
| `www/settings.cgi` | `rega_script "Write(system.GetSessionVarStr('$sid'));"` — the session check of the settings page | **unchanged**: this is exactly the call the `tclrega.so` shim answers |
| `lib/session.tcl` | the same check for `log.cgi`, `getconfig.cgi`, `setconfig.cgi`, `getnick.cgi`, `setnick.cgi`, `safemode.cgi`, `backup.cgi`, `logupload.cgi`, `service.cgi`, `update.cgi` | **unchanged**, same reason |
| `lib/rega-auth.js` | Node-RED `adminAuth`: `dom.GetObject(ID_USERS).Get(name)` over ReGa on 8183 for the user, password against ReGa's auth service on UDP 1998 | **unchanged**, but no longer wired in directly |
| `lib/settings.js` | `adminAuth.type === "rega"` → `lib/rega-auth.js` | → new `lib/ccu-auth.js`, which probes the box once and delegates to `rega-auth.js` (CCU) or to `POST /api/auth/v1/login` (openccu-lite). The stored setting is the same on both |
| `www/settings.html` | the auth option was labelled "ReGaHSS (CCU WebUI User nutzen)" | "Benutzer der Zentrale (ReGaHSS bzw. openccu-lite)"; the stored value stays `rega` |
| `lib/log.tcl` | read `/var/log/messages(.0)` | reads them when they exist, otherwise `journalctl -t redmatic -t node-red` (the systemd products have no syslog file) |
| `www/backup.cgi` | `X-Sendfile:` — lighttpd delivers the archive | openccu-lite runs addon CGIs in `occulited` (its task 18), which knows no `X-Sendfile`: there (`SERVER_SOFTWARE=occulited`) the archive is written to stdout. The lighttpd path is byte-identical to before |
| `bin/redmatic` (rc.d) | `start-stop-daemon -S -b`, telemetry uuid in `/etc/config` | start also works without `start-stop-daemon` (`setsid`), and the telemetry uuid is skipped when `/etc/config` is not writable or `uuidgen` is missing. No pid file at all — the process is found by name, so nothing depends on a writable `/var/run` |
| everything else | — | no `dom.GetObject`, no `/api/homematic.cgi`, no `:8181`, no `hmscript` anywhere else in the addon; the settings page talks only to RedMatic's own CGIs |

Names, rooms and functions in flows are **node-red-contrib-ccu**'s business,
not the addon's: 4.4.0 (bundled here) does that port, including reading the
box's read-only token from `/usr/local/etc/occulite/local-token` by itself —
RedMatic runs as root on openccu-lite, so the file is readable and nothing has
to be configured. `ccu-sysvar`, `ccu-program`, `ccu-script` and `ccu-poll` stay
in the palette there and answer with an error per message instead of breaking
the connection.

## The systemd products

The rc.d script runs in a generated unit `addon-redmatic.service`
(`Type=oneshot`, `RemainAfterExit=yes`, `ExecStart=<script> start`,
`KillMode=control-group`). `start` returns after backgrounding
`bin/redmaticLoader`, so the unit becomes active and the cgroup keeps
Node-RED; `stop` (the ps-based `Stop()`) stops it, and so does systemd killing
the cgroup — Node-RED 5 handles `SIGTERM` like `SIGINT`. `monit` is absent
there, which the script already tests for. The paths RedMatic writes are
listed in the README's openccu-lite section.

## Verified

- `lib/ccu-auth.js` against a fake box (openccu-lite, a CCU answering 404, and
  an unreachable box): login, wrong password, the `users()` path, the session
  handed back with `POST /api/auth/v1/logout`, one single probe per process,
  and the fall back to `rega-auth.js` in both non-lite cases.
- `www/backup.cgi` and `lib/log.tcl` in a container with a real `tclsh`: the
  `X-Sendfile` output is unchanged, the `occulited` output is headers plus the
  archive byte for byte, and `log.tcl` calls `journalctl` exactly when
  `/var/log/messages` is missing.
- The three architecture packages built and `test/e2e.sh` (install, update,
  start, palette install/remove of the x86_64 package in a Debian container).
- Not verified: a running openccu-lite box. There was none in this session —
  the maintainer's lab has CCU3, OpenCCU x86_64 and OpenCCU aarch64.

## Release assets

openccu-lite's addon catalogue resolves `redmatic-{arch}-{version}.tar.gz`
first (`{arch}` = `uname -m`) and falls back to `redmatic-{version}.tar.gz`.
The build therefore publishes the armv7l package under both names: the
historic one (wiki, `bin/redmatic-update` of installed versions, the release
body) and `redmatic-armv7l-<version>.tar.gz`.
