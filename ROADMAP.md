# RedMatic Roadmap

Planned direction for RedMatic (Node-RED as Homematic CCU addon). The overall theme:
**radically slim down the addon and modernize the entire stack.**

Convention (same scheme as node-red-contrib-ccu): task numbers are stable and
never reused. This file holds only open items — when a task is completed, its
content moves to [roadmap-archive/](roadmap-archive/) (one file per task,
e.g. `task-1.md`) and its line in the contents below gets a ✅ marker linking
into the archive.

Status 2026-09-02: the strip-down and modernization are implemented on
`master` as `9.0.0-dev.x` (Node 24, Node-RED 5.0.6, npm 11,
node-red-contrib-ccu 4.0.0, zero native modules, zero Node-RED patching,
GitHub Actions CI). Not yet released — hardware verification (task 8) is the
gate.

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

Still open:

- The mass-close of the obsolete backlog (after the 9.0.0 release; comment
  + close, signed as written by Claude on behalf of the maintainer).

## 7. Documentation overhaul

- **RedMatic-WebApp is deprecated** (no longer bundled since task 1, no
  replacement): ✅ the `rdmtc/RedMatic-WebApp` repo was archived on GitHub
  (2026-09-02); its mentions in the wiki still need adjusting. ✅ README
  notice done: both
  README headers now carry a prominent "RedMatic 9" block (only
  node-red-contrib-ccu bundled, palette manager for everything else,
  package manager + WebApp deprecated, native-module limitation as a known
  and accepted limitation).
- **Wiki content overhaul** (external repo `rdmtc/RedMatic.wiki`, mostly
  German): Intro still advertises WebApp/Dashboard/HomeKit as included;
  pages for the package manager, binary packages, node installation and
  armv6l need rewriting or removal; RaspberryMatic → OpenCCU naming
  throughout. The generated README pulls `Intro`/`Home` from the wiki, so
  regenerate README.md afterwards (`node update_readme.js`).
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
