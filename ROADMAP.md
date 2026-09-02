# RedMatic Roadmap

Planned direction for RedMatic (Node-RED as Homematic CCU addon). The overall theme:
**radically slim down the addon and modernize the entire stack.**

Tasks are roughly ordered — the strip-down (1, 2) should happen first because it
massively reduces the surface that the modernization steps (3, 4) have to cover.

## 1. Strip down included Node-RED nodes

Only **node-red-contrib-ccu** shall be included in future. All other bundled
nodes/packages get removed from the addon. Users who need additional nodes can
install them via the Node-RED palette manager.

- Remove all other `node-red-contrib-*` / `node-red-node-*` packages and extras
  (dashboard, redmatic-homekit, chatbot, zigbee, modbus, serialport, sqlite,
  johnny-five, tfjs, signal, midnight-red theme, redmatic-led, redmatic-webapp, …)
  from:
  - `addon_files/redmatic/lib/package.json`
  - `addon_files/redmatic/var/package.json`
  - root `package.json` (merged mirror)
- Drop the arch-specific dependency juggling in `build_addon.sh`
  (jq-deletion of Pi-only modules for x86_64; the `ain2`/`unix-dgram`
  special case is handled in task 4b).
- Regenerate `LICENSES.md` / `www/licenses.html` afterwards (should shrink drastically).
- **No example/starter flows anymore**: remove
  `addon_files/redmatic/var/example-flows.json` and the "create example flows
  on first install" step in `addon_files/update_script` — new installs start
  with an empty flow. (The old example flows depended on dashboard/combine
  nodes that get unbundled anyway.)
- Side effect: virtually no native modules remain → enables task 2.

## 2. Remove RedMatic package manager and package prebuilds

The custom on-CCU package manager and the checked-in prebuilt native binaries
become obsolete once only node-red-contrib-ccu (pure JS) is bundled.

- Remove the package manager:
  - `addon_files/redmatic/bin/redmatic-pkg` (shell installer)
  - `addon_files/redmatic/www/pkg.cgi` (Tcl CGI)
  - package-manager UI parts in `addon_files/redmatic/www/` (`settings.html`, `js/script.js`)
  - `build_packages.js` and the `pkg-repo.json` generation / per-node tarball builds
  - `var/do_pkg_upgrade` handling in `addon_files/redmatic/bin/redmatic`
- Remove prebuilds:
  - the entire `prebuilt/` directory (all architectures)
  - `prebuild.sh` and the SSH-based per-arch build-host workflow
  - prebuilt-copy step in `build_addon.sh`
- Update `BUILD.md` accordingly (prebuild rationale no longer applies).

## 3. Modernize tooling

The build/maintenance tooling is circa 2021 and partly built on dead services.

- Replace deprecated/dead devDependencies: `request` (deprecated),
  `sync-request`, `npm-check-updates@3`, `got@11`, `showdown@1`.
- Remove the defunct david-dm badge/integration; use `npm outdated` /
  Dependabot / Renovate for dependency tracking instead of the interactive
  `update.sh` / `update_dependencies.js` flow.
- Add basic quality tooling: ESLint (or Biome), `.editorconfig`, and a
  `scripts` block in `package.json` (currently none exists).
- Add a `.gitattributes` normalizing line endings (`* text=auto eol=lf`):
  Windows checkouts currently get CRLF via autocrlf, which makes WSL git
  report the whole tree as modified and risks CRLF creeping into the bash
  scripts that run on Linux (CI/CCU). Normalize once, renormalize the repo
  (`git add --renormalize .`).
- Consider rewriting the bash build scripts' version/JSON handling
  (currently `jq`-based) in Node for portability.

## 4. Modernize Node.js and Node-RED

- Node.js: **14.18.3 (EOL since 2023) → 24.x LTS**.
  - **armv7l:** nodejs.org publishes no linux-armv7l binaries for v24 anymore
    (dropped after v23), and even the older ones need a newer glibc/libstdc++
    than the stock CCU3 firmware ships (glibc 2.27, Buildroot 2019). Solved in
    the **hm2mqtt.js** project (`addon/build-runtime.sh` there): take Alpine's
    musl-based `nodejs` armv7 package, copy the musl loader + transitive
    shared-library closure + ICU data into the addon, and `patchelf` the
    interpreter/RPATH to point inside the addon prefix. The runtime is fully
    self-contained, independent of the CCU's libc — verified on real CCU3
    hardware (firmware 3.87.6) with Node 24. Port that approach here.
  - aarch64 / x86_64: stock nodejs.org tarballs, as today.
  - Bump `engines.node` in `package.json` (consumed by `build_addon.sh` and
    `update_nodejs.js` — adjust the hardcoded `v14` major in `update_nodejs.js`).
- Node-RED: **2.1.5 → 5.x** (released 2026-06; requires Node ≥ 22.9,
  recommends Node 24 — matches the Node 24 target above).
  - Review breaking changes across 2 → 3 → 4 → 5 (settings.json format,
    editor, subflows, node API).
  - node-red-contrib-ccu: bump the bundled **3.4.2 → 4.0.0** (released
    2026-09-02; declares `node-red >=4.0.0` and
    `node ^20.19 || ^22.12 || >=24`, so it matches the Node-RED 5 / Node 24
    targets) in `addon_files/redmatic/var/package.json` and the root
    `package.json` mirror (currently capped at `0.0.0 - 3.4.2`).
- npm: **must stay bundled** — unlike hm2mqtt (node binary only), RedMatic
  needs npm on the CCU for Node-RED palette-manager installs, which becomes
  more important once task 1 unbundles all extra nodes. Feasible on the
  armv7l musl runtime: npm is pure JS (no native code), and Alpine ships it
  as a separate `npm` package (currently 12.x in edge/community) alongside
  `nodejs` — unpack it into the addon like the node package, or install the
  registry tarball (`npm pack npm@…`) into the prefix. Points to watch:
  - npm's bin scripts run node via `#!/usr/bin/env node` and npm re-executes
    node child processes via `process.execPath` — both fine once the addon's
    `bin` is on PATH and the ELF interpreter is patched (hm2mqtt verified
    child-process spawning works on the patched runtime).
  - Version jump from the current pin (≤8.3.1) to 11/12.x interacts with
    task 5: `--global-style` is gone in npm ≥9
    (→ `--install-strategy=shallow`), so the installer sed patch / `etc/npmrc`
    must be adapted together with the npm bump.
  - Musl caveat for palette installs on armv7l: native-addon nodes won't work —
    no compiler on the CCU (as before), and glibc armv7 prebuilds
    (prebuild-install / node-gyp-build) don't load against a musl node.
    Pure-JS nodes are unaffected.
  - **User docs:** state prominently in the README (edit
    `docs/README.header.md` / `docs/README.header.en.md` — `README.md` /
    `README.en.md` are generated — plus the wiki) that npm packages /
    Node-RED nodes with **binary (native) dependencies can NOT be
    installed**. This is a **known and accepted limitation** on all
    architectures (no compiler toolchain on the CCU; prebuilds are gone
    with task 2; on armv7l additionally the musl runtime), not a bug to
    be worked around.

## 4a. Limit target platforms to armv7l, aarch64, x86_64

- Officially supported platforms in future: **armv7l** (CCU3 stock firmware,
  default package), **aarch64** (RaspberryMatic 64-bit, ARM SBCs),
  **x86_64** (RaspberryMatic/debmatic on x86, containers).
- Deprecate **i686** and **armv6l** (Raspberry Pi 1/Zero). They are already
  commented out in `build.sh`; armv6l additionally depended on
  unofficial-builds.nodejs.org and modern Node versions aren't available
  for it anyway. Remove:
  - `prebuilt/i686/` and `prebuilt/armv6l/` (goes away with task 2 anyway)
  - the armv6l/i686 branches in `build_addon.sh` (arch case, unofficial-builds
    URL) and the i686-only `node-red-contrib-rcswitch2` handling
  - mentions in `BUILD.md` / README

## 4b. Replace ain2 / unix-dgram syslog logging (last native dep)

Analysis (2026-07): the only consumer of `ain2` is
`addon_files/redmatic/lib/logger.js` — a Node-RED log handler that writes to
the CCU syslog via the `/dev/log` unix datagram socket, so Node-RED logs show
up in `/var/log/messages` and the CCU web UI. `/dev/log` is SOCK_DGRAM, which
Node core cannot speak (`dgram` is UDP-only, `net` is stream-only) — that is
the sole reason for the native `unix-dgram` module. It is also the reason for
the special install dance in `build_addon.sh` (separate `ain2` install,
x86_64-only `unix-dgram` compile, ARM archs served from `prebuilt/`).

Status quo upstream: `ain2` is unmaintained (3.0.0, 2018);
`unix-dgram` is maintained (2.0.7, 2025) but compiles from source via
node-gyp at install time — no prebuilt binaries. After task 1 this would be
the **only remaining native module** in the addon.

**Decision: drop ain2/unix-dgram and pipe Node-RED log output through the
CCU's busybox `logger` binary** (the shell scripts in `bin/redmatic` already
use it). Rewrite `logger.js` to spawn/pipe into `logger -t node-red` instead
of using ain2. Trade-off: coarser per-message severity mapping (busybox
`logger` takes one priority per invocation/pipe). With this, the addon
contains **zero native modules**, which is what makes tasks 2 (no prebuilds)
and 4a possible without any cross-compilation infrastructure.

Considered alternatives (rejected):
- keep unix-dgram + cross-compile the single module in CI — feasible and
  cheap, but keeps native-build infrastructure alive for marginal benefit
  (exact syslog severities)
- UDP syslog to 127.0.0.1:514 in pure JS — busybox syslogd does not listen
  on UDP by default on the CCU
- drop syslog integration entirely — user-visible regression (no Node-RED
  logs in the CCU log viewer)

## 5. Review Node-RED patches — are they still necessary?

Inventory of current patching:

- `build_addon.sh` (lines ~113–115): `sed` patch of
  `@node-red/registry/lib/installer.js` forcing `--no-package-lock --global-style`
  for palette-manager installs/removals. Check whether current Node-RED/npm
  still needs this (npm ≥9 removed `--global-style` in favor of
  `--install-strategy=shallow`) or whether it can be achieved via `.npmrc`
  (`addon_files/redmatic/etc/npmrc`) instead of patching sources.
- `float.patch` (core-util-is inside johnny-five prebuilts): disappears
  automatically with tasks 1 and 2.
- CCU runtime patches in `bin/redmatic` (lighttpd.conf, cp_security.cgi):
  not Node-RED patches, keep, but re-verify against current CCU firmware /
  RaspberryMatic.

Goal: **zero source patching of Node-RED** if possible.

## 5a. Fold in still-valid open issues

Triage of the issue backlog (2026-09: 178 open issues, 2019–2024, no open
PRs). The vast majority concern components scheduled for removal (bundled
extra nodes, the package manager, binary packages, palette-install failures
rooted in the EOL Node 14 / npm ≤8 stack, armv6l) or are support questions
and example-flow requests for the old stack — **mass-close those with a
pointer to the 9.0.0 release notes / this roadmap once the strip-down
ships.** Several validate the plan directly: #351 asks for exactly the
"Lite" build (task 1), #319 is task 6, #534/#556/#592 are task 4,
#404/#440 are the documented native-module limitation.

Still-valid items to fix as part of 9.0.0, all in the addon runtime scripts:

- **#521** — uninstall leaves the `monit-redmatic.cfg` symlink in
  `/usr/local/etc/` behind, breaking monit; remove it in the uninstall path.
- **#452** — a corrupted context-store JSON file prevents Node-RED from
  starting; validate/quarantine corrupt context files in `bin/redmatic`
  before start.
- **#142** — raise the Node-RED process's OOM score
  (`/proc/<pid>/oom_score_adj`) so the kernel prefers killing Node-RED over
  core CCU services (hmipserver) under memory pressure.
- **#271** — set the monit memory limit relative to the machine's RAM
  instead of a hardcoded value.
- **#46** — custom CA certificates: support `NODE_EXTRA_CA_CERTS` pointing
  at a user-supplied PEM bundle under the addon dir.
- **#353 / #50** — support a user settings override file (e.g.
  `redmatic-settings.js` merged into `lib/settings.js`) so TLS/https,
  `httpStatic` etc. survive updates without patching addon files.
- **#318** — scoped-module palette installs: verify fixed by the modern
  npm/Node-RED stack (task 4), then close.

## 6. GitHub Actions instead of Travis

- Delete `.travis.yml` (Travis CI is effectively dead for OSS; config also has
  a stale Node 14 pin and Slack deploy).
- Fix and finish `.github/workflows/build.yml` — it exists but has presumably
  never worked:
  - update action versions (`checkout@v2`, `cache@v1`, `setup-node@v2-beta`,
    `ncipollo/release-action`, tag action)
  - re-enable/clean up the commented-out steps (version check, artifact upload)
  - trigger on tag push or release, not only `workflow_dispatch`
  - Node 24 toolchain (see task 4), drop apt packages only needed for removed
    native modules (`libavahi-compat-libdnssd-dev`, `libudev-dev`);
    armv7l runtime assembly needs `patchelf` (see task 4)
  - add a CI job for lint/build sanity on PRs (currently CI runs no checks at all)
