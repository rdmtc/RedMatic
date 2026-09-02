# Task 4 — Modernize Node.js and Node-RED

**✅ done 2026-09-02** (`9.0.0-dev.4`, commit 4f63dfe; x86_64 build
verified locally, armv7l/CCU3 hardware verification still pending —
see task 8 in the roadmap)

- Node.js **14.18.3 → 24.x**: `engines.node` = 24.20.0 (nodejs.org
  tarballs for aarch64/x86_64). **armv7l** runtime assembled from
  Alpine's musl `nodejs` package: node binary + musl loader +
  transitive shared-library closure + ICU data, ELF interpreter/RPATH
  rewritten with `patchelf` to point inside the addon prefix
  (approach proven in hm2mqtt.js on real CCU3 hardware, firmware
  3.87.6). `alpine-packages.mjs` resolves the apk dependency closure
  from the APKINDEX without docker/apk-tools. `ICU_DATA` is exported
  through the per-arch `versions` file, sourced by all runtime scripts
  and the update_script. Alpine's v24 may lag/lead nodejs.org's pin;
  the build guards on the major version and records the actual version.
- Node-RED **2.1.5 → 5.0.6** (requires Node ≥22.9, recommends 24).
  `red.js` and `settings.js` still exist at the package root, so
  `redmaticLoader` and `lib/settings.js` kept working; the settings
  template still exports `logging.console`.
- npm **8.3.1 → 11.19.1**, bundled via `lib/package.json` on all
  architectures (pure JS); `bin/npm`/`bin/npx` links created by the
  build (the Alpine nodejs package ships without npm); the tarball's
  dangling corepack link is removed.
- node-red-contrib-ccu **3.4.2 → 4.0.0** (declares `node-red >=4` and
  `node ^20.19 || ^22.12 || >=24`).
- `update_nodejs.js` tracks v24; `build_addon.sh` rewritten (host jq
  replaced by node, sha256sum/shasum fallback).

Musl caveat (documented in README header): palette installs of nodes
with native dependencies do not work on the CCU — no compiler
toolchain, no shipped prebuilds, and on armv7l glibc prebuilds don't
load against the musl node. Pure-JS nodes are unaffected.
