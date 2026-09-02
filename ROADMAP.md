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

Still open:

- **#318** — scoped-module palette installs: verify fixed by the modern
  npm/Node-RED stack, then close.
- The mass-close of the obsolete backlog (after the 9.0.0 release; comment
  + close, signed as written by Claude on behalf of the maintainer).

## 7. Documentation overhaul

- **RedMatic-WebApp is deprecated** (no longer bundled since task 1, no
  replacement): archive the `rdmtc/RedMatic-WebApp` repo on GitHub and
  remove/adjust its mentions in the wiki. ✅ README notice done: both
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

- Green CI runs of `ci.yml` on GitHub (3-arch build matrix; first workflow
  runs pending).
- **armv7l/CCU3 hardware test** of the full addon: install, update from
  8.x, Node-RED 5 editor + node-red-contrib-ccu 4 against a real CCU,
  palette install of a pure-JS node (also verifies #318), syslog logging,
  monit, uninstall. The musl runtime approach itself is hardware-verified
  in hm2mqtt.js; the RedMatic packaging of it is not yet.
- Verify the update/migration path (settings `logging.ain → syslog`,
  lib/node_modules wipe, stale-tool cleanup, var package.json merge).
- Release notes must prominently state the breaking changes: unbundled
  nodes, removed package manager/WebApp, native-module limitation,
  Node-RED 2 → 5 flow compatibility.
- Then: mass-close of the obsolete issue backlog (see task 5a).
