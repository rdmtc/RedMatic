# Task 11 — Self-update from the settings page

**✅ done 2026-09-05** (shipped in `9.2.0`; verified on all three lab
platforms, smoke-tested by the maintainer on the Pi 4 and the x86_64 VM)

Verification before the release (2026-09-04/05, `9.1.0-dev.4` and
`-dev.5` builds): the worker updated each box to the same dev version from
a package server on the x86_64 VM, traces collected — CCU3 (armv7l, chroot
path) 461 s end to end with the bar running 0-6-13-25-35-47-61-76-82-88-
91-93-100, monotonic, longest plateau ~30 s at 82 %; Pi 4 (aarch64) 43 s;
x86_64 VM 27-37 s. The preflight released a stale bind mount and removed
the leftover temp dir of an earlier run, the inode check reported 48k free
against the 36k required. The maintainer's browser smoke tests on the Pi 4
and the VM (dev.4) were satisfactory. Still to happen after the release:
the maintainer updates the lab boxes from the dev builds to the released
9.2.0 through the button — the first self-update against a real GitHub
release.

## Original task text

Filed 2026-09-04 by the maintainer. **One-click update in the addon
settings UI**: download and install a new release without leaving the CCU
web interface, with the download and the installation visualized as
progress bars in a modal.

Today the settings page only *notices* an update: `www/js/script.js`
compares `update_check.cgi?cmd=versions` (local, from `redmaticVersions`)
with `update_check.cgi` (the `tag_name` of `releases/latest`) and, if they
differ, shows the `#update-notify` card in `www/settings.html` with a plain
link to the GitHub release page. Everything after that is manual: pick the
right architecture asset, upload it under Zusatzsoftware, wait for the
reboot on CCU3 firmware.

Target flow: the update card gets a button. Clicking it opens a modal that
shows

- **download progress** (bytes/percent of the release asset), then
- **installation progress** (untar, `update_script`, service start),
- and finally the new version plus a link back to the editor.

**Implemented 2026-09-04 — on `master`, not released: the maintainer wants
to test it first.**

- `bin/redmatic-update` — POSIX sh worker, started detached; copies itself
  to `/tmp/redmatic-update/` first because the install replaces `bin/`.
  Resolves `releases/latest` (or takes a version argument), refuses
  versions that are not newer (`--force` overrides), **checks free space
  on `/usr/local/tmp` and `/usr/local/addons` before downloading** (550 MB
  on the CCU3 chroot path, 450 MB elsewhere), downloads the arch asset
  with `curl` and reports bytes/total from the growing file, verifies the
  released `.sha256`, runs `/bin/install_addon` (or, where that does not
  exist, extracts and runs `update_script` itself), drives the installation
  bar with the progress model below, removes the temp dir the CCU3
  installer leaves behind (never when something is still mounted below
  it), starts Node-RED if `update_script` did not, waits for port 1880.
  State in `state.json`, log in `update.log`, a per-second `trace.log`
  during the install, syslog lines tagged `redmatic: update:`.
- `www/update.cgi` — `start` (session, spawns the worker via `setsid`,
  `force=1` passes `--force`), `status` (no session, polled), `log`,
  `reset`.
- `www/settings.html` + `www/js/script.js` — button in the update card,
  modal with the backup warning, download and installation bars, status
  line, result with the log on errors; a running update is picked up
  again after a page reload.
- `test/e2e-inner.sh` — runs the worker in the container against a local
  `busybox httpd` serving the built package (`--force`, same version) and
  checks state, cleanup and that Node-RED is back.
- `build_addon.sh` accepts `VERSION_ADDON=...` for test builds.

**Progress model of the installation bar** (measured on the lab boxes,
2026-09-04; the maintainer asked for bars that run realistically from 0 to
100 on all three platforms):

The installer goes through *extract* (tar into the temp dir), *chroot*
(CCU3 firmware only: copies of `/bin /lib /sbin /etc /usr` into the temp
dir), *install* (`update_script`: stop Node-RED, wipe `lib/node_modules`,
copy the tree, relink) and *start* (service start until port 1880 answers).
Phase transitions come from real events: the `Preparing chroot` /
`Executing update_script` lines of the CCU3 installer, Node-RED
disappearing on OpenCCU (whose installer prints nothing), the installer
process exiting, port 1880 answering. Each phase owns a share of the bar
proportional to its measured duration; inside a phase two estimators run
and the bar shows whichever is further: elapsed time against the expected
duration (capped at 97, so the bar waits for the real transition) and the
bytes written to the `/usr/local` partition since the installer started
(`/proc/diskstats`, free to read) against the total the run writes — the
unpacked package twice plus the chroot copies, doubled with `data=journal`
(the CCU3 mounts `/usr/local` that way). Disk writes lag behind the work
through the page cache and never lead it, so they are an honest floor on a
slow SD card while time carries the bar through cached phases. The bar
never moves backwards. Rejected on the way: `du` of the temp dir (~20 s per
sample on the CCU3, 40k files), counting freshly copied files (busybox
`find` has no `-cnewer`, a full `find` takes 17 s there), and calibrating
the copy phase from what the extraction wrote (on the Pi 4 only 76 of 380
MB had reached the card when tar finished).

Measured durations per phase, download from the LAN excluded:

| platform | extract | chroot | install | start | installer total |
|---|---|---|---|---|---|
| CCU3 firmware, armv7l (Charly) | 112 s | 158 s | 109 s | 29 s | 6 min 48 s |
| OpenCCU aarch64 (Pi 4) | 7-8 s | - | 31 s | 1-2 s | 41 s |
| OpenCCU x86_64 (VM) | 11-14 s | - | 15-19 s | 0-2 s | 27-37 s |

A dev build with these profiles (`9.1.0-dev.4`) was measured again on all
three boxes on 2026-09-04; the traces are in `/tmp/measure-*` on the build
machine.

**Test plan for the maintainer** (lab boxes prepared 2026-09-04 with
`9.1.0-dev.4` builds of this code — a prerelease number, so the released
9.1.0 shows up as the available update):

1. Settings page → the update card offers 9.1.0 with the new button.
2. Click, read the warning, start. Watch both bars; on the CCU3 the
   installation phase takes 6-7 minutes, on OpenCCU under a minute.
3. Reload the page at some point during the install: the modal must come
   back with the current state.
4. After "done": the header shows 9.1.0, the card is gone, Node-RED runs,
   `/usr/local/tmp` holds no `tmp.*` dir and no `new_addon.tar.gz`.
5. Error path: run with the disk nearly full or with GitHub blocked in
   `/etc/hosts` — the modal must show the reason and the log.

Note that 9.1.0 does not contain this feature, so after a successful test
the box is back on a version without the button; re-install the dev
package to test again (`scp` to `/usr/local/tmp/new_addon.tar.gz`,
`/bin/install_addon`, `rc.d/redmatic start` on the CCU3).

Still open after the test: the wiki update page (mention the button, keep
the manual way), and whether `build_addon.sh` should write the `.sha256`
with a bare file name.

Notes for the implementation. **The firmware install machinery was read on
the lab boxes and both paths were measured on 2026-09-04** (see the
verification block below):

- **Reuse `/bin/install_addon`, do not reimplement the install.** It exists
  on both firmwares, takes the archive at the fixed path
  `/usr/local/tmp/new_addon.tar.gz`, unpacks it, runs `./update_script
  HM-RASPBERRYMATIC` and returns the exit code. OpenCCU additionally
  verifies any `*.sha256` files *inside* the archive, remounts / and /boot
  read-only, runs `ldconfig` and cleans up its temp dir; the CCU3 firmware
  version instead builds a chroot and **does not clean up**.
- **Exit codes**, as `cp_software.cgi` on OpenCCU interprets them: `0` =
  installed, no reboot; `10` = reboot required (the WebUI reboots with
  `-d 2`); anything else = failure, and the code is worth showing. RedMatic
  `update_script` returns 10 only on a *fresh* install (no
  `rc.d/redmatic` yet), so a self-update always sees 0.
- **A self-update must start the service itself on the CCU3 firmware.**
  `update_script` starts Node-RED only when `/etc/init.d/S00InstallAddon`
  does *not* exist, because on that firmware the install normally runs
  inside the shutdown chroot where nothing may be started. That test cannot
  tell a chroot install from a live one, so either the self-update backend
  runs `rc.d/redmatic start` afterwards (measured: 1 s, editor answers ~20 s
  later) or `update_script` learns an explicit flag (e.g.
  `REDMATIC_SELF_UPDATE=1`) for the live case.
- **Clean up after the CCU3 install.** `/bin/install_addon` there leaves
  `/usr/local/tmp/tmp.XXXXXX` behind — 434 MB in the measured run. The
  self-update has to remove it, otherwise every update eats another third of
  a gigabyte.
- **Preflight free space**: the CCU3 chroot path needs roughly **600 MB**
  free on `/usr/local` (60 MB archive + ~435 MB chroot + the unpacked
  addon); measured peak 880 MB used against a 446 MB baseline on a 2 GB
  partition. OpenCCU needs only the archive plus the tree, no chroot.
- **Preflight free inodes, too.** The CCU3's `/usr/local` has only 96,256
  inodes (the OpenCCU images have millions); the package holds ~13k
  entries (armv7l; 16k on the other archs), the chroot copies another
  ~17k, the installed addon ~45k. Seen 2026-09-04 on Charly: with one
  stale temp dir from an earlier run the partition reported 943 MB free
  and 0 inodes, the CCU3 installer failed with "No space left on device"
  half way through the chroot copy and then ran `update_script` inside
  the broken chroot (harmless there, but only by luck). The worker now
  requires 36k free inodes on the chroot path (20k elsewhere).
- **Clean up leftovers before starting.** The stale dir above came from a
  run whose `umount` of the temp dir's `/usr/local` bind mount failed
  because a `du` of the worker was traversing it at that moment; the
  worker rightly refused to delete a dir with a mount below it and the
  dir stayed. The preflight now releases such mounts and removes stale
  `tmp.*` dirs and a stale `new_addon.tar.gz` when no installer runs.
- **Progress**: the download is the one phase with an exact percentage
  (`Content-Length` of the asset). For the install phase, `install_addon`
  prints coarse markers (`Extracting addon...`, `Preparing chroot env...`,
  `Executing update_script in chroot...`) that map to steps in the modal; on
  the CCU3 the 6-minute chroot copy can be turned into a real bar by
  sampling `du` of the temp dir against the ~435 MB it ends up at.
- **Download tool**: the CCU3 firmware has GNU wget 1.19.5 (TLS and
  redirects to `objects.githubusercontent.com` work; 61.6 MB in 27 s over
  the lab LAN). The bundled `bin/node` is the nicer option for the download
  since it can report byte progress through `fetch`, and it is still running
  at that point — the install only stops Node-RED later.
- **Assets and checksums**: `redmatic-<version>.tar.gz` (armv7l, no arch
  infix), `redmatic-x86_64-<version>.tar.gz`,
  `redmatic-aarch64-<version>.tar.gz` — the arch comes *before* the version.
  Every asset has a `.sha256` sibling, so the download can be verified.
  Caveat: `build_addon.sh` writes the checksum with the build machine's
  absolute path in it (`/home/runner/work/...`), so `sha256sum -c` fails and
  only the hash field can be compared — worth fixing at the source with a
  basename-relative checksum. Putting a `.sha256` *inside* the archive would
  additionally get the integrity check for free from OpenCCU's own
  `install_addon`.
- Only full releases must be offered. `releases/latest` already excludes
  drafts and prereleases, which is what keeps the automatic-release drafts
  of task 10 away from users. The API `assets[]` is the robust source for
  URL and `size`.
- The CGIs are served by the CCU lighttpd, not by Node-RED, so the settings
  page survives the addon stopping and restarting itself during the install.
  Confirmed by both live runs; that is what makes the progress modal
  feasible at all.
- Progress needs a backend that runs detached from the request: a CGI that
  spawns download and install in the background and writes a small JSON
  state file (phase, bytes, total, exit code, message), plus a status CGI the
  modal polls. On armv7l the install phase alone runs for minutes, so the
  poll must be patient and must tolerate failing for a few seconds while the
  service restarts.
- Session check like `setconfig.cgi` (`lib/session.tcl`, `check_session
  $sid`) — this triggers a privileged install, so there must be no
  unauthenticated path.
- No rollback exists. The modal must repeat the backup warning from the
  release notes before it starts, and the wiki update page needs adjusting
  once this ships.
- Bootstrap 4.6 and jQuery are already in `www`, so the modal and the
  progress bars need no new dependency.
- Refuse when the running version is newer than the offered one.

**Verified on the lab boxes (2026-09-04)** — a self-update was performed by
hand exactly the way the planned backend would do it (download to
`/usr/local/tmp/new_addon.tar.gz`, then `/bin/install_addon`), updating
9.0.1 to 9.1.0:

- **CCU3 firmware 3.89.8, armv7l**: download 27 s, released `.sha256`
  matched, `install_addon` 6 min 25 s, exit 0, version 9.1.0. Node-RED was
  *not* running afterwards (the guard above); `rc.d/redmatic start` took 1 s
  and the editor answered 200 through lighttpd ~20 s later. The 434 MB
  chroot temp dir stayed behind and had to be removed by hand. **So the
  CCU3 firmware does not need its reboot for an update either** — the reboot
  in the WebUI path only exists because that firmware installs addons from
  the shutdown sequence.
- **OpenCCU 3.89.8, x86_64**: download 3.6 s, `install_addon` 18.6 s, exit
  0, version 9.1.0, service restarted by `update_script` itself, nothing
  left over.

**How the firmwares install addons** (read from the boxes, for reference):

- *CCU3 firmware*: `cp_software.cgi` stores the upload as
  `/usr/local/tmp/new_addon.tar.gz`, and `action_install_start` does
  `touch /usr/local/.doAddonInstall` + `/sbin/reboot`. The install then runs
  **during shutdown**: `/etc/init.d/S00InstallAddon` implements only
  `stop()`, which calls `/bin/install_addon`. That script unpacks to a temp
  dir, copies `/bin /lib /sbin /etc` and everything in `/usr` except
  `local` into it, bind-mounts `dev proc sys dev/pts` and `/usr/local`, and
  runs `chroot ... ./update_script HM-RASPBERRYMATIC`. The addon is then
  started by the normal boot sequence (`S55InitAddons` runs
  `run-parts -a init /etc/config/rc.d`, `S98StartAddons` starts them).
  Note: the comment in `addon_files/update_script` used to say this happens
  *at boot* — it happens at shutdown.
- *OpenCCU*: no marker file, no reboot. `action_install_go` in
  `cp_software.cgi` calls `/bin/install_addon` synchronously and branches on
  the exit code as described above.
