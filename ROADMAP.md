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
  (jq-deletion of Pi-only modules for x86_64, `ain2`/`unix-dgram` special cases).
- Regenerate `LICENSES.md` / `www/licenses.html` afterwards (should shrink drastically).
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

- Node.js: **14.18.3 (EOL since 2023) → 24.x**.
  - Bump `engines.node` in `package.json` (consumed by `build_addon.sh` and
    `update_nodejs.js` — adjust the hardcoded `v14` major in `update_nodejs.js`).
  - Check availability of official nodejs.org binaries for all remaining target
    archs (x86_64, armv7l, aarch64); armv6l relied on unofficial-builds — decide
    whether to keep armv6l at all.
- Node-RED: **2.1.5 → current 4.x**.
  - Review breaking changes (settings.json format, editor, subflows, node API).
  - Verify node-red-contrib-ccu compatibility with Node-RED 4 / Node 24.
- Verify bundled `npm` version pin (currently ≤8.3.1) or drop the npm bundling
  entirely if no longer needed.

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

## 6. GitHub Actions instead of Travis

- Delete `.travis.yml` (Travis CI is effectively dead for OSS; config also has
  a stale Node 14 pin and Slack deploy).
- Fix and finish `.github/workflows/build.yml` — it exists but has presumably
  never worked:
  - update action versions (`checkout@v2`, `cache@v1`, `setup-node@v2-beta`,
    `ncipollo/release-action`, tag action)
  - re-enable/clean up the commented-out steps (version check, artifact upload)
  - trigger on tag push or release, not only `workflow_dispatch`
  - Node 24 toolchain, drop apt packages only needed for removed native
    modules (`libavahi-compat-libdnssd-dev`, `libudev-dev`)
  - add a CI job for lint/build sanity on PRs (currently CI runs no checks at all)
