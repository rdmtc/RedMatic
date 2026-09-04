# Agent instructions for RedMatic

RedMatic packages Node-RED as an addon for the Homematic CCU3 / OpenCCU (formerly RaspberryMatic)
smart-home central. The build output is per-architecture `.tar.gz` addon
packages (installed on the CCU under `/usr/local/addons/redmatic`).

**Read `ROADMAP.md` before making changes** — the project is being radically
slimmed down and modernized; don't invest effort in components that are
scheduled for removal (bundled extra nodes, the package manager, prebuilds,
Travis config).

## Layout

- `build.sh` → `build_addon.sh` (per arch: x86_64, armv7l, aarch64) — downloads
  the official Node.js binary tarball, npm-installs the dependency layers,
  copies `addon_files/` and prebuilts, patches Node-RED's installer via sed,
  tars the result into `dist/`.
- `addon_files/redmatic/` — the addon skeleton that ends up on the CCU:
  - `bin/redmatic` — start/stop/runtime script (also patches CCU lighttpd/backup config)
  - `bin/redmatic-pkg`, `www/pkg.cgi` — custom on-CCU package manager (scheduled for removal)
  - `lib/package.json`, `var/package.json`, `www/package.json` — the **three
    dependency layers** (core+native, pure-JS nodes, web UI assets). The root
    `package.json` is only a merged mirror of these plus build devDependencies —
    keep all four in sync when touching dependencies.
  - `etc/` — npmrc, lighttpd, monit, default Node-RED settings
- `prebuilt/<arch>/` — checked-in precompiled native `.node` binaries,
  copied over the tree at build time (scheduled for removal)
- `build_packages.js` — carves optional nodes into separate tarballs + `pkg-repo.json`
- `update_*.js`, `update.sh` — maintenance scripts (dependency bumps, README
  generation from the GitHub wiki, license generation)
- `update_versions.js` — bumps Node.js / npm / Node-RED / node-red-contrib-ccu
  within their pinned majors (used by the auto-release workflow).
- `test/e2e.sh` — end-to-end test of the built x86_64 package in a Debian
  container (OpenCCU install path, palette install); needs docker.
- CI: `.github/workflows/ci.yml` (lint, syntax, 3-arch build, e2e),
  `build.yml` (manual release build), `auto-release.yml` (daily automatic
  releases on upstream updates, ROADMAP task 10).

## Conventions & caveats

- **ALWAYS use WSL instead of PowerShell** for shell commands (npm, node, git,
  build scripts). PowerShell introduces problems with npm binaries, line
  breaks (CRLF vs LF), etc. Run commands via `wsl` / a bash shell.

- Versions: addon version lives in root `package.json`; Node.js version in its
  `engines.node` (read by `build_addon.sh` via `jq`); Node-RED version in
  `addon_files/redmatic/lib/package.json`. The build writes them into a
  `versions` file inside the addon.
- Shell scripts are bash and run on Linux CI — execute/validate them in WSL
  (`bash -n` / shellcheck), never in PowerShell.
- `README.md` / `README.en.md` and `LICENSES.md` / `www/licenses.html` are
  **generated** (by `update_readme.js` / `update_licenses.js`) — don't edit
  them by hand; edit `docs/README.header*.md` / `docs/README.footer*.md`.
- Target runtime is an embedded Linux box (CCU3: ARM, little RAM, no compiler
  toolchain). Anything installed there must work without building native code —
  that is the historical reason for the prebuilds and the sed patch forcing
  `--no-package-lock --global-style` on palette installs.
- Tests: ESLint plus the container e2e test (`npm run test:e2e`, needs docker).
- User-facing docs live in the GitHub wiki (rdmtc/RedMatic/wiki), primarily in
  German.
