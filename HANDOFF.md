# Handoff — RedMatic 9.0.0 (2026-09-02)

State of the 9.0.0 modernization for continuing on another machine.
Written by Claude Fable on behalf of hobbyquaker at the end of the
2026-09-02 session. Read `ROADMAP.md` first; completed tasks are in
`roadmap-archive/`.

## Where things stand

`master` is at **9.0.0-dev.11**, everything pushed. **No tags, no
releases yet** — hardware testing is the gate (roadmap task 8).

The whole stack is modernized and implemented:

- Node.js **24.20.0** (nodejs.org for aarch64/x86_64), **armv7l from
  Alpine musl** (`alpine-packages.mjs` resolves the apk closure,
  `build_addon.sh` assembles bin/node + musl loader + lib closure +
  ICU data and patchelfs interpreter/RPATH to the addon prefix;
  `ICU_DATA` is exported via the per-arch `versions` file, sourced by
  every script that runs node — without it the musl node won't start).
- Node-RED **5.0.6**, npm **11.19.1** (bundled via lib/package.json on
  all archs, bin/npm+npx links created by the build),
  node-red-contrib-ccu **4.0.0**.
- Only node-red-contrib-ccu is bundled; no example flows; package
  manager, prebuilds, WebApp, bundled git/jq/jo/ffmpeg all removed.
  Zero native modules, zero Node-RED source patching (palette-install
  behavior via `etc/npmrc`: install-strategy=shallow, package-lock off).
- Logging via persistent per-severity busybox `logger` pipes
  (`lib/logger.js`); settings key migrated `logging.ain → logging.syslog`.
- Issue-backlog fixes shipped: #521 monit symlink on uninstall, #452
  context quarantine (`lib/checkContext.js`, wired into start), #142
  oom_score_adj 800, #271 RAM-relative monit limit (`etc/monit.tmpl`),
  #46 `etc/extra-ca-certs.pem` → NODE_EXTRA_CA_CERTS, #353/#50
  update-proof `etc/settings-user.js` merged last into settings.
- CI: `ci.yml` (ESLint + shell/JS syntax + 3-arch build matrix with
  artifacts) — **green**; `build.yml` = manual release workflow
  (tags v<version>, draft prerelease, SBOMs + tarballs from dist/).
- SBOMs (CycloneDX, `npm sbom`) replace LICENSES.md/licenses.html;
  shipped in `www/`, copied to `dist/` for release attachment.
- Docs: README headers carry the "RedMatic 9" notice (incl. "still in
  development"); wiki Intro/Home rewritten for v9 + OpenCCU naming;
  dark-mode logo (`assets/redmatic5-*-dark.png` + `<picture>`).
  READMEs are generated: edit `docs/README.header*.md` /
  `docs/README.footer*.md`, then `node update_readme.js`.

## Verified so far (no hardware yet)

- CI builds all three arch packages, including the armv7l musl runtime
  (patchelf self-check passes).
- Container smoke test (Debian linux/amd64 against the built x86_64
  tree): node/npm run, `redmaticVersions` + `checkContext` work,
  **Node-RED 5.0.6 starts with `lib/settings.js`, serves
  `/addons/red` (HTTP 200), all 15 ccu node sets register error-free**.
  This caught a real bug (fixed in dev.11): `rega-auth.js` was written
  against homematic-rega 1.x; 2.x has a named `Rega` export and
  promise-based `exec()`.
- Release-body generation, README generation, ESLint: all run clean.

Container smoke test one-liner (from repo root, after
`./build_addon.sh x86_64`):

```
docker run --rm --platform linux/amd64 -v "$PWD/addon_tmp/redmatic:/src:ro" debian:bookworm-slim bash -c '
mkdir -p /usr/local/addons && cp -a /src /usr/local/addons/redmatic && cd /usr/local/addons/redmatic
export PATH=$PWD/bin:$PATH; . ./versions
cp etc/default-settings.json etc/settings.json; echo key > etc/credentials.key
bin/node lib/node_modules/node-red/red.js -s lib/settings.js'
```

## Test-day checklist (armv7l CCU3 + x86 system)

Build locally (`./build_addon.sh armv7l` — needs Linux/WSL + patchelf)
or download the artifacts from the latest green `ci` run on GitHub
Actions (14-day retention).

1. **Fresh install** via WebUI (Zusatzsoftware) on both systems; reboot.
   - Node-RED reachable at `http://<ccu>/addons/red`, login via CCU
     credentials (**rega auth was rewritten — first real test!**).
   - `bin/node` starts on the CCU3 (musl runtime; check
     `/usr/local/addons/redmatic/versions` has ICU_DATA and
     `bin/redmaticVersions` prints JSON).
   - Config UI at `http://<ccu>/addons/redmatic/settings.cgi`: no
     Pakete tab, licenses tab shows the new SBOM page, log level
     change works (settings key is now `logging.syslog`).
2. **Update from 8.x/7.x** on a system that has an old install:
   - old bundled nodes in lib are wiped, user palette nodes in var
     survive (package.json merge), `logging.ain → syslog` migration,
     stale tools (jq/jo/git/redmatic-pkg…) removed, old midnight-red
     theme config cleaned by the settings UI.
3. **Palette install** of a pure-JS node (e.g. node-red-contrib-combine
   or a dashboard) through the editor — verifies npm 11 + npmrc
   (shallow strategy, no package-lock) and, on armv7l, npm on musl.
4. **Syslog**: Node-RED log lines appear in /var/log/messages / CCU
   log viewer with correct severities (new logger.js).
5. **monit**: `/usr/local/etc/monit-redmatic.cfg` link exists, limit in
   `etc/monit.cfg` reflects machine RAM, watchdog restarts Node-RED.
6. **Context quarantine**: corrupt a var/context/*.json, restart,
   file becomes `.corrupt`, Node-RED starts.
7. **Uninstall**: removes monit link (fix #521), lighttpd/backup
   patches reverted.
8. CCU runtime patches (lighttpd include, cp_security.cgi backup
   exclude) against **current** firmware/OpenCCU — re-verify they still
   apply (roadmap archive task-5 note).

## After successful tests (release flow)

1. Set final version in `package.json` (e.g. `9.0.0-beta.0` or `9.0.0`).
2. Run the **build-release** workflow (workflow_dispatch) — it tags
   `v<version>`, creates a **draft prerelease** with tarballs + SBOMs +
   RELEASE_BODY.md and pushes the wiki change history.
3. Release notes: breaking changes are pre-listed in roadmap task 8.
4. Then the issue mass-close (task 5a) — comment + close obsolete
   backlog (~166 issues), each signed
   "Written by Claude Fable on behalf of hobbyquaker."

## Open items (see ROADMAP.md)

- Task 8: hardware verification (above), then release.
- Task 5a: issue mass-close after release.
- Task 7: wiki deep pages (Node-Installation, Homekit, ZigBee,
  package-manager mentions in FAQ/Installation etc.) still describe the
  old world; Intro/Home are done. RedMatic-WebApp repo is archived.
- Task 3 leftover: nothing blocking; ESLint is wired, dark logo done.

## Conventions in this repo (important)

- Bump `-dev.N` in package.json for every significant change; commit
  messages end with the Claude co-author line.
- Issue/wiki communication is signed
  "*Written by Claude Fable on behalf of hobbyquaker.*"
- **No Dependabot/Renovate PRs** (maintainer preference); use
  `npm run outdated`.
- READMEs and wiki: README.md/README.en.md are **generated**
  (`node update_readme.js` pulls wiki Intro/Home; raw wiki content can
  lag a few minutes after a wiki push).
- Pushing to master is fine; **no tags/releases** without the
  maintainer.

## Misc notes

- Telemetry: entries like "26.1.0" (and 7.3.x/7.4.x) on
  telemetry.redmatic.de are **not from this work** — the endpoint is
  unauthenticated and forks/custom builds report to it. Our dev builds
  never sent telemetry (only `bin/redmatic start` on a CCU does).
- Alpine edge currently ships nodejs 24.18.x for armv7 while
  nodejs.org is at 24.20.0 — the build accepts that (major must match)
  and records the actual version per arch in `versions`.
- `update_package.js` regenerates the root package.json dependency
  mirror from the three layer files after version bumps.
