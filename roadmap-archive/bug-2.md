# Bug 2 — Node-RED could be started twice

**✅ fixed 2026-09-07** (shipped in `9.4.1`)

In the reporter's log the complete `redmatic start` sequence runs **twice**,
four seconds apart:

```
20:46:26 redmatic: RedMatic v9.4.0 (c) Sebastian Raff ...
20:46:26 redmatic: Waiting 45 seconds before activating monit services
20:46:26 redmatic: Starting Node-RED
20:46:29 redmatic: update: install finished after 12 s ...
20:46:30 redmatic: RedMatic v9.4.0 (c) Sebastian Raff ...
20:46:30 redmatic: Waiting 45 seconds before activating monit services
20:46:30 redmatic: Starting Node-RED
```

and the restart counter afterwards comes in **pairs** — `(1/3)`, `(1/3)`,
`(2/3)`, `(2/3)`, `(3/3)`, `(3/3)`, then `Maximum Node-RED restarts exceeded`
twice — i.e. **two `redmaticLoader` supervisors were running at once**.

Mechanism: on OpenCCU `/bin/install_addon`'s `update_script` starts the service
itself (20:46:26). `bin/redmatic-update:524` then guards its own start with
`if ! node_red_running` (`:161-163`, which matches a process *named*
`node-red`), but four seconds after launch that process is not named `node-red`
yet, so the guard misses and the updater starts a second instance
(`:525-529`).

Consequences: two Node-REDs competing for port 1880, for the RPC callback
ports and for the CCU connection, and two independent restart supervisors.

**Confirmed on a plain start too** (reporter's debug log, 2026-09-07): pid
`6148` comes up next to the running `5959`, fails with `Error: port in use` on
1880 and exits 1 — so this is not limited to the self-update path. Still **not
established** whether it is what makes bug 1 fatal. Fix it on its own merits: the readiness check should not
depend on the process name (check the port, or the loader's own pid/lock).

## The fix

`bin/redmatic` no longer decides on the process name alone:

- `RedmaticPid` (the old check) finds a running Node-RED, `RedmaticStarting`
  additionally finds a `redmaticLoader` that has not reached its Node-RED yet —
  the state the old check was blind to. busybox `ps` prints
  `{redmaticLoader} /bin/sh /path/redmaticLoader`, other `ps` only the latter,
  so both fields are matched; the `$4` match is anchored to a path so a shell
  that merely mentions the name cannot block a start.
- An atomic `mkdir` lock (`var/start.lock`, holding the owner's pid) is taken
  **before** the 30 s post-boot delay and released only once the loader is
  visible to the next caller. That closes the two windows the old check left:
  the 30 s sleep, and the gap between spawning the loader and its process
  appearing. A lock whose owner is gone (killed, or a reboot in between) is
  detected as stale, logged and removed, so a start can never be blocked
  permanently.
- `bin/redmatic-update`'s `node_red_running` uses the same loader-aware check.

Verified on `ccu-arm64` (OpenCCU on a Pi 4, aarch64): two starts one second
apart leave exactly one Node-RED and one loader, the second exits 1 with
`Node-RED is already starting`, the lock is released afterwards, a start while
running still says `Node-RED already running`, and a planted stale lock
(pid 99999) is removed with `removing stale start lock of pid 99999` in the
log and the start proceeds.
