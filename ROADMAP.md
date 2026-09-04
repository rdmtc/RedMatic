# RedMatic Roadmap

Planned direction for RedMatic (Node-RED as Homematic CCU addon). The overall theme:
**radically slim down the addon and modernize the entire stack.**

Convention (same scheme as node-red-contrib-ccu): task numbers are stable and
never reused. This file holds only open items — when a task is completed, its
content moves to [roadmap-archive/](roadmap-archive/) (one file per task,
e.g. `task-1.md`) and its line in the contents below gets a ✅ marker linking
into the archive.

Status 2026-09-04: **RedMatic 9.0.0 is released** (Node 24, Node-RED
5.0.6, npm 11, node-red-contrib-ccu 4.0.0, zero native modules, zero
Node-RED patching, GitHub Actions CI). The wiki is overhauled and the
issue backlog closed; what remains is feedback-driven follow-up work.
**9.0.1 released 2026-09-04**: IPv6 link-local fix for Matter on the CCU3
(task 9), palette manager after OpenCCU updates (#599), process status on
the settings page (#600). Next: task 10 (release strategy).

## Contents

- 1. Strip down included Node-RED nodes ✅ [archived](roadmap-archive/task-1.md)
- 2. Remove package manager and prebuilds ✅ [archived](roadmap-archive/task-2.md)
- [3. Modernize tooling](#3-modernize-tooling)
- 4. Modernize Node.js and Node-RED ✅ [archived](roadmap-archive/task-4.md)
- 4a. Limit target platforms ✅ [archived](roadmap-archive/task-4a.md)
- 4b. Replace ain2/unix-dgram syslog logging ✅ [archived](roadmap-archive/task-4b.md)
- 5. Review Node-RED patches ✅ [archived](roadmap-archive/task-5.md)
- [5a. Fold in still-valid open issues](#5a-fold-in-still-valid-open-issues)
- 6. GitHub Actions instead of Travis ✅ [archived](roadmap-archive/task-6.md)
- [7. Documentation overhaul](#7-documentation-overhaul)
- [8. Verify and release 9.0.0](#8-verify-and-release-900)
- 9. IPv6 link-local address for Matter on the CCU3 ✅ [archived](roadmap-archive/task-9.md)
- [10. Release strategy and automatic releases](#10-release-strategy-and-automatic-releases)
- [11. Self-update from the settings page](#11-self-update-from-the-settings-page)

## 3. Modernize tooling

The build/maintenance tooling was circa 2021 and partly built on dead
services. Mostly done in `9.0.0-dev.x`:

- ✅ All deprecated/dead devDependencies are gone (`request`, `sync-request`,
  `npm-check-updates`, `got`, `showdown`, `latest-semver`, `prompts`,
  `github-markdown-css`): the `update_*` scripts were rewritten on global
  `fetch`, `update_licenses.js`/`update_dependencies.js`/`update.sh` were
  deleted. Dependency tracking = `npm run outdated` + GitHub security
  alerts. **No Dependabot/Renovate PRs — the maintainer finds them too
  noisy.**
- ✅ `.editorconfig` and a `scripts` block in `package.json`
  (build/outdated/update:*).
- ✅ `.gitattributes` with `* text=auto eol=lf`, repo renormalized.
- ✅ SBOM instead of generated license files: `npm sbom` (CycloneDX) per
  dependency layer at build time, shipped in `www/` (linked from a new
  lightweight `licenses.html`), attached to releases as
  `redmatic-<version>-sbom-*.json`; `LICENSES.md`, the giant
  `licenses.html` and `update_licenses.js` are deleted; Node's LICENSE
  ships as `www/LICENSE.node.txt`.
- ✅ On-device and build-script `jq`/`jo` gone; david-dm badge removed.

Still open:

- ESLint (or Biome) for the remaining JS (addon lib scripts, update/build
  scripts), wired into ci.yml.
- README logo is not suitable for GitHub dark mode (the dark "Matic"
  letters become unreadable). Add a dark-mode variant of the logo to
  `assets/` and embed it via
  `<picture><source media="(prefers-color-scheme: dark)" …>` in
  `docs/README.header*.md` (remember: `README.md` / `README.en.md` are
  generated).

## 5a. Fold in still-valid open issues

Triage of the issue backlog (2026-09: 178 open issues, 2019–2024, no open
PRs). The vast majority concern components that are now removed (bundled
extra nodes, the package manager, binary packages, palette-install failures
rooted in the EOL Node 14 / npm ≤8 stack, armv6l) or are support questions
and example-flow requests for the old stack — **mass-close those with a
pointer to the 9.0.0 release notes / this roadmap once 9.0.0 ships.**
Several validated the plan directly: #351 asked for exactly the "Lite" build
(task 1), #319 was task 6, #534/#556/#592 were task 4, #404/#440 are the
documented native-module limitation.

Fixes implemented in `9.0.0-dev.5`:

- ✅ **#521** — uninstall now removes the dangling `monit-redmatic.cfg`
  symlink (`-L` test; the old `-f` test always missed it).
- ✅ **#452** — `checkContext` rewritten in Node, quarantines corrupted
  context-store files as `.corrupt` and runs in the start sequence.
- ✅ **#142** — `redmaticLoader` raises `oom_score_adj` to 800 so the kernel
  prefers killing Node-RED over core CCU services under memory pressure.
- ✅ **#271** — monit memory alert limit computed from MemTotal (half the
  machine's RAM, min 200 MB) via `etc/monit.tmpl` at service start.
- ✅ **#46** — `NODE_EXTRA_CA_CERTS` exported when
  `etc/extra-ca-certs.pem` exists.
- ✅ **#353 / #50** — `etc/settings-user.js` (survives updates) is merged
  last into the Node-RED settings — https/TLS, `httpStatic` etc. without
  patching addon files.

All of the above issues (plus #351, #319, #510, #534, #491) were commented
and closed on 2026-09-02, signed as written by Claude on behalf of the
maintainer. 166 issues remain open.

✅ **#318** closed 2026-09-02 — all three checklist items resolved
(redmaticVersions and the release-body scan handle scopes, the package
manager no longer exists).

Done 2026-09-04 (after the 9.0.0-alpha.1 prerelease, at the maintainer's
request): the remaining 165 open issues were triaged and 151 closed with
one of five short comments (removed component / old Node 14 stack /
support question / ccu-nodes-or-HomeKit topic / done-documented), 13
concrete reports were transferred to the sibling repos (7 to
node-red-contrib-ccu, 6 device requests to RedMatic-HomeKit for the 4.0
role mapping), and all 29 open discussions were answered and closed
(RESOLVED/OUTDATED). Left open on purpose: #226 (English language for the
settings UI). Everything signed "Written by Claude Fable on behalf of
hobbyquaker."

## 7. Documentation overhaul

- **RedMatic-WebApp is deprecated** (no longer bundled since task 1, no
  replacement): ✅ the `rdmtc/RedMatic-WebApp` repo was archived on GitHub
  (2026-09-02); its mentions in the wiki still need adjusting. ✅ README
  notice done: both
  README headers now carry a prominent "RedMatic 9" block (only
  node-red-contrib-ccu bundled, palette manager for everything else,
  package manager + WebApp deprecated, native-module limitation as a known
  and accepted limitation).
- ✅ **Wiki content overhaul** (2026-09-04, external repo
  `rdmtc/RedMatic.wiki`): Installation, Update, Deinstallation,
  Node-Installation, FAQ and Probleme-Update-Installation rewritten for
  RedMatic 9 (palette manager only, firmware requirement, native-module
  limitation, CLI install path); new page **Migration auf RedMatic 9**
  linked from Home/Update/FAQ; HomeKit (palette install, 4.0.0 in
  development), ZigBee (deprecated, not installable on 9 — zigbee2mqtt on
  a separate machine as the alternative), WebApp (discontinued) and
  Dashboard (classic vs. Dashboard 2.0) pages marked; references to the
  community-patched 7.3/7.4 versions removed; RaspberryMatic → OpenCCU
  naming; settings-user.js / extra-ca-certs documented in Tipps. The
  community flow pages were left as they are (their Dashboard/extra-node
  usage is still valid via palette install).
- Update the RedMatic Homekit / LED / WebApp sibling-repo readmes if they
  reference being bundled with RedMatic (out of scope for this repo, listed
  for completeness).

## 8. Verify and release 9.0.0

The implementation is on `master`; before anything is tagged or released:

- ✅ Green CI runs of `ci.yml` on GitHub (3-arch build matrix + ESLint,
  green since 2026-09-02).
- ✅ Container smoke test of the built x86_64 tree (Debian, linux/amd64):
  node 24.20/npm 11.19 run, redmaticVersions/checkContext work, Node-RED
  5.0.6 starts with lib/settings.js and serves /addons/red (HTTP 200),
  all 15 node-red-contrib-ccu node sets register without errors. This
  caught and fixed a real bug: rega-auth.js was still written against the
  homematic-rega 1.x API (2.x has a named export and a promise-based
  exec()).
- ✅ **x86_64/OpenCCU hardware test** (2026-09-02, OpenCCU 3.89.8 ova at
  a real test system): fresh install, service start via rc.d, editor
  through lighttpd (200), **rega login end-to-end** (token on correct
  CCU credentials, 403 on wrong password), palette install of a pure-JS
  node via the editor API (shallow, no lockfile), per-severity syslog
  logging, monit limit computed from RAM, context quarantine, update
  path (palette node survives the var merge), settings-user.js
  override, **bundled git + projects feature active**, clean uninstall
  incl. the #521 monit-link fix. Findings fixed along the way:
  cp_security.cgi patch is obsolete on OpenCCU (guarded now),
  update_script's 9.x cleanup ran after the copy and deleted the
  freshly installed git (moved before the copy).
- ✅ **armv7l/CCU3 hardware test** (2026-09-03, original eQ-3 CCU3
  firmware 3.89.8 on CCU3 hardware, glibc 2.27): the musl runtime is
  self-contained as intended — `bin/node` 24.18 (Alpine), `npm` 11.19
  and the musl `git` 2.55 all run with an empty `LD_LIBRARY_PATH`
  (`ICU_DATA` from `versions`). Manual install via `update_script` (what
  the firmware does), rc.d start, editor through lighttpd (200), rega
  login end-to-end (200/403/401 incl. case-sensitive user name),
  palette install of a pure-JS node through the editor API in 4.5 s
  (shallow, no lockfile), per-severity syslog (info/warn/debug pipes,
  log-level change through the real settings CGIs with a CCU session),
  context quarantine, `oom_score_adj` 800, `.nobackup` markers, clean
  uninstall. **Real device test**: a flow deployed via the admin API
  switched an HmIPW-DRS8 output on/off through node-red-contrib-ccu
  4.0.0, confirmed by the CCU JSON-API. ~93 MB RSS on a fresh install.
  Not exercised: the WebUI upload path (Zusatzsoftware) — same script,
  plus the post-install reboot.
- ✅ **Update/migration path** verified on the CCU3 with the last
  public release (7.2.1 → 9.0.0-dev.12): lib/node_modules wiped, stale
  tools (`jq`, `jo`, glibc git, `redmatic-pkg`, `pkg.cgi`, libjq/libpigpio)
  gone, `logging.ain → syslog` migrated with the level preserved, var
  merge keeps the user's palette nodes (ccu bumped to 4.0.0), the 7.2.1
  flows (dashboard + ccu nodes) start on Node-RED 5, editor fine with
  the stale midnight-red `editorTheme.page.css`. Found and fixed in
  dev.13: `lib/pkg-repo.json` / `var/example-flows.json` survived,
  `var/do_pkg_upgrade` was still shipped, busybox `ln -sfT` refused to
  renew the www symlink on updates (`-sfn` now), the monit link used
  `ln -s` without `-f`, `build_addon.sh` did not create `dist/` when run
  standalone. Uninstall after the update restores the 7.2.1-era
  `cp_security.cgi.orig`.
- **Open question for the release notes**: in 7.x/8.x the bundled extra
  nodes lived in `var` (dashboard 2.28, email, rbe, sun-position,
  combine, redmatic-led, redmatic-webapp), so the var merge keeps them
  all after an update — they keep working (rbe just warns "already
  registered" because it is core now) but are no longer maintained by
  the addon; users have to update/remove them via the palette manager.
- ✅ **aarch64/OpenCCU hardware test** (2026-09-04, OpenCCU 3.89.8 rpi4
  on a Raspberry Pi 4, no radio module): the 9.0.0-alpha.0 package from
  the release workflow — node 24.20 / npm 11.19 / musl git 2.55 with an
  empty `LD_LIBRARY_PATH`, editor via lighttpd, rega login (200/403),
  palette install in 2.3 s, syslog, monit limit from RAM, oom_score_adj.
- ✅ **WebUI installs** (2026-09-04, alpha.0 assets): fresh install on the
  CCU3 through Zusatzsoftware (upload → reboot → `S00InstallAddon` runs
  `update_script` in a chroot → addon started by the boot sequence) and
  an update on OpenCCU x86_64 (runs `update_script` live, no reboot).
  The latter found a real bug: after an update nothing started Node-RED
  again (OpenCCU only reboots on exit code 10) — `update_script` now
  starts the service itself unless the firmware installs at boot.
- ✅ **9.0.0 released** (2026-09-04, full release, `releases/latest` now
  points at it, so the on-CCU update check offers it to 7.x installs).
  Released on the maintainer's decision without external alpha feedback;
  README and release notes state that a CCU backup before updating is the
  user's responsibility. Built by the build-release workflow, the aarch64
  asset re-verified as an update on the Pi 4.
- ✅ **9.0.0-alpha.0 and 9.0.0-alpha.1 published** as GitHub prereleases
  on 2026-09-04 (alpha.0 carries a note pointing at alpha.1 because of
  the OpenCCU update bug above). `releases/latest` still resolves to
  v7.2.1, so the on-CCU update check does not offer the alphas to 7.x
  installs. Still to do for 9.0.0: collect tester feedback, then the
  final release and the issue mass-close (task 5a).
- ✅ **CCU runtime patches dropped** (dev.14): `bin/redmatic` no longer
  edits firmware files. The lighttpd `/etc/config/lighttpd/*.conf`
  include is native on current CCU3 firmware and OpenCCU, and backups
  honor `.nobackup` natively since CCU3 firmware **3.61.5** (verified in
  `eq-3/occu`: `backup.tcl` uses `--exclude-tag` from 3.61.5 on; the
  first firmware with the lighttpd include could not be determined from
  the public sources — the occu copy of lighttpd.conf is a stale
  template). The `.orig` restores in `uninstall` went with it: older
  RedMatic versions may leave a byte-identical `cp_security.cgi.orig`
  on the read-only rootfs, which is harmless and vanishes with the next
  firmware update. **Release notes: state CCU3 firmware ≥ 3.61.5 (or
  current OpenCCU) as a requirement.** monit does not exist on the CCU3
  firmware; all monit handling is OpenCCU-only.
- Release notes must prominently state the breaking changes: unbundled
  nodes, removed package manager/WebApp, native-module limitation,
  Node-RED 2 → 5 flow compatibility.
- Then: mass-close of the obsolete issue backlog (see task 5a).

## 10. Release strategy and automatic releases

Filed 2026-09-04 by the maintainer right after 9.0.1. Questions to settle:

- Should users update Node-RED and node-red-contrib-ccu themselves (palette
  manager), with RedMatic releases only when a new Node.js is out?
- Is updating the bundled node-red-contrib-ccu through the palette manager
  possible at all, and is it a problem?
- Can Node-RED update itself, or should the RedMatic settings page get an
  "update Node-RED" mechanism?
- Fully automatic releases: a GitHub Action that runs daily, detects a new
  Node.js release and creates a RedMatic release that also carries the
  latest Node-RED and node-red-contrib-ccu?

What is known (verified 2026-09-04 on the lab boxes):

- Two layers. `lib` (Node.js, npm, Node-RED and its `lib/node_modules`) is
  the runtime: wiped and replaced by every addon update, invisible to the
  palette manager. Node-RED cannot update itself; it is not a palette
  module. `var` is Node-RED's userDir: node-red-contrib-ccu is an ordinary
  dependency in `var/package.json`, so the palette manager **can** update
  (or remove) it like any other node.
- But an addon update extracts the bundled `var/node_modules/
  node-red-contrib-ccu` over the installed one, and `update_script`'s
  package.json merge lets the addon's pinned version win. Seen today on the
  lab CCU3: a palette-installed 4.1.0 build was silently replaced by the
  bundled 4.0.0 by the 9.0.1 update, and flows using a node type that only
  exists in the newer version stopped with "Waiting for missing types".
  So palette updates of the ccu nodes work only until the next addon
  update. Either the addon must keep a newer installed version (merge by
  semver, do not overwrite when the installed version is newer), or
  RedMatic releases must follow node-red-contrib-ccu releases closely.
- "Update Node-RED" from the settings page would be an `npm install
  node-red@x` into `lib` plus a restart: no rollback, untested
  combination, little RAM on the CCU3, and the same failure modes the
  package manager had. Recommendation: no. The RedMatic package is the
  tested unit, and the CI build takes about a minute.
- Automatic releases are feasible: `build-release` already builds all
  three architectures and drafts the release with SBOMs and release body;
  `update_nodejs.js` / `npm run update:*` already do the bumps. A
  scheduled workflow could check nodejs.org (newest release of the pinned
  LTS major), npm (node-red, node-red-contrib-ccu), bump the layer files
  and the addon patch version, build, and publish.

**Decided 2026-09-04 (maintainer): automatic releases, triggered by
Node.js and Node-RED updates within the pinned majors.**

- A new Node.js release of the bundled major (`engines.node` in
  package.json) and/or a new Node-RED release of the bundled major each
  trigger an automatic RedMatic patch release. Every such release also
  picks up the latest node-red-contrib-ccu.
- A **major** switch of Node.js or Node-RED stays manual: hardware round,
  release notes, minor/major bump of the addon version.
- No in-addon "update Node-RED" mechanism (Node-RED cannot update itself,
  the palette manager only covers the userDir, an in-place npm install in
  `lib` has no rollback and is undone by the next addon update). The
  RedMatic package stays the tested unit; the update banner from
  `update_check.cgi` is the user-facing path.

**Versioning (decided 2026-09-04, maintainer):**

- Automatic releases bump the **minor** (9.1.0, 9.2.0, ...). Every
  automatic release checks for and includes the newest node-red-contrib-ccu
  as well, next to the Node.js / Node-RED update that triggered it.
- Manual bugfix releases in between bump the **patch** of the current minor
  (like 9.0.1). Manual **feature** releases bump the minor as well
  (decided 2026-09-04 for the self-update, released as 9.2.0), so "x.y.0"
  no longer means "came from the workflow" — the release body says so.
- A Node.js or Node-RED major switch bumps the RedMatic **major** (manual).

**Decided 2026-09-04 (maintainer), second round:**

- A node-red-contrib-ccu release on its own also triggers an automatic
  minor.
- The release body must say clearly that the release was made
  automatically, with one or two sentences of explanation.
- More end-to-end testing, e.g. install a node through the palette and
  check that its node types appear.

**Implemented 2026-09-04; first real run the same day: draft v9.1.0 (node-red-contrib-ccu 4.0.0 -> 4.2.0) in 154 s.**

- `update_versions.js` (replaces `update_nodejs.js`): compares Node.js,
  npm, Node-RED and node-red-contrib-ccu with the newest release of their
  pinned majors; `--apply` writes the layer files, regenerates the root
  package.json mirror and writes `RELEASE_SUMMARY.md` (the "automatic
  release" paragraph that `build_release_body.sh` puts at the top of the
  release body); `--bump` bumps the addon minor. Refuses prerelease
  versions.
- `test/e2e.sh` + `test/e2e-inner.sh`: the x86_64 package in a
  debian:bookworm-slim container with busybox as /bin/sh (like the CCU),
  installed exactly the way OpenCCU's `/bin/install_addon` does it, twice:
  fresh (exit 10) and update (exit 0, service restarted from the deleted
  temp dir - the #599 path). Checks: Node-RED answers, the process runs
  with cwd /, palette editor enabled (`/settings`), no "Palette editor
  disabled" in syslog, node-red-contrib-ccu loaded with its node types,
  palette install + uninstall of `node-red-node-random` through the admin
  API (module in `var/node_modules`, no package-lock), clean stop.
  The rega login is switched off through `etc/settings-user.js`, the
  telemetry host is blocked in /etc/hosts. Runs in `ci.yml` on every push
  (job `e2e` on the x86_64 artifact), gates `build.yml` and the
  auto-release. First finding: `bin/redmatic` used `source` and
  `redmaticLoader` bash syntax under `#!/bin/sh` - fine on busybox ash,
  fatal under dash (debmatic); both are POSIX now.
- `.github/workflows/auto-release.yml`: daily at 04:23 UTC plus manual
  dispatch (input `force`): check, bump, build, e2e, commit + push the
  bump, create the release. Repository variable `AUTO_RELEASE_PUBLISH=true`
  publishes as latest, otherwise a draft for the maintainer. A failed run
  opens an issue.

Still open: the decision
on `AUTO_RELEASE_PUBLISH` (until then every automatic release is a draft the
maintainer publishes), testing the armv7l/aarch64 packages under qemu
in the same container harness, and an e2e check of the settings page
(needs tclsh) and of a ccu-connection against hm-simulator.

Still to decide:

- Automatic **draft** (maintainer promotes after a lab check) vs. fully
  automatic publish (`AUTO_RELEASE_PUBLISH`). Note: scheduled workflows are free on public repos but
  GitHub disables them after 60 days without commit activity, and pushes
  made with GITHUB_TOKEN do not trigger other workflows, so the daily
  workflow must run the build itself. Suggested start: scheduled draft releases plus a CI
  smoke test (the container test from HANDOFF.md) and a notification;
  promote by hand for a few cycles, then automate the publish if it stays
  boring. `update_check.cgi` only offers full releases, so drafts and
  prereleases never reach users.
- How the change list is generated (the module version table is already in
  the release body) and where failures surface (a GitHub issue opened by
  the workflow).
## 11. Self-update from the settings page

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
