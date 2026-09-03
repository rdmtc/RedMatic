# Handoff — RedMatic 9.0.0 (2026-09-03)

State of the 9.0.0 modernization for continuing on another machine.
Written by Claude Fable on behalf of hobbyquaker at the end of the
2026-09-03 session. Read `ROADMAP.md` first; completed tasks are in
`roadmap-archive/`.

## Where things stand

`master` is at **9.0.0-dev.13**. **No tags, no releases yet.**

**Hardware verification (roadmap task 8) is complete on both target
platforms**:

- x86_64 / OpenCCU 3.89.8 (2026-09-02) — full checklist, details in
  ROADMAP task 8.
- armv7l / original CCU3 firmware 3.89.8 on CCU3 hardware (2026-09-03) —
  full checklist including the musl runtime (node/npm/git with no
  `LD_LIBRARY_PATH`), rega login, palette install, syslog severities,
  settings CGIs, context quarantine, uninstall, a **real device switch
  through node-red-contrib-ccu**, and the **update path from the last
  public release 7.2.1** (lib wipe, stale-tool cleanup, `logging.ain →
  syslog`, var merge). Findings were fixed in dev.13 (see ROADMAP).
- Not exercised anywhere: installing through the CCU WebUI upload
  (Zusatzsoftware). It runs the same `update_script`, followed by the
  firmware's reboot — worth one click before the release.

Both lab systems are left with a running fresh install of the dev.13
`update_script` state (built as dev.12 before the bump; contents are
identical apart from the version string). Lab addresses and credentials
are intentionally **not** in this file.

The whole stack is modernized and implemented:

- Node.js **24.x** (nodejs.org for aarch64/x86_64), **armv7l from
  Alpine musl** (`alpine-packages.mjs` resolves the apk closure,
  `build_addon.sh` assembles bin/node + musl loader + lib closure +
  ICU data and patchelfs interpreter/RPATH to the addon prefix;
  `ICU_DATA` is exported via the per-arch `versions` file, sourced by
  every script that runs node — without it the musl node won't start).
- Node-RED **5.0.6**, npm **11.19.1** (bundled via lib/package.json on
  all archs, bin/npm+npx links created by the build),
  node-red-contrib-ccu **4.0.0**.
- git is bundled (musl build from Alpine on all three archs, patchelf'd;
  `GIT_EXEC_PATH`/`GIT_TEMPLATE_DIR` exported by redmaticLoader/.profile).
  The legacy `LD_LIBRARY_PATH=$ADDON_DIR/lib` exports are gone — musl
  libraries live in `lib/` on ALL archs and must only be found via the
  binaries' patched RPATH (LD_LIBRARY_PATH would poison glibc firmware
  binaries).
- Only node-red-contrib-ccu is bundled; no example flows; package
  manager, prebuilds, WebApp, jq/jo/ffmpeg all removed. Zero native
  modules, zero Node-RED source patching (palette-install behavior via
  `etc/npmrc`: install-strategy=shallow, package-lock off).
- Logging via persistent per-severity busybox `logger` pipes
  (`lib/logger.js`); settings key migrated `logging.ain → logging.syslog`.
- Issue-backlog fixes shipped: #521 monit symlink on uninstall, #452
  context quarantine, #142 oom_score_adj 800, #271 RAM-relative monit
  limit, #46 `etc/extra-ca-certs.pem`, #353/#50 `etc/settings-user.js`.
- CI: `ci.yml` (ESLint + shell/JS syntax + 3-arch build matrix with
  artifacts); `build.yml` = manual release workflow (tags v<version>,
  draft prerelease, SBOMs + tarballs from dist/).
- SBOMs (CycloneDX, `npm sbom`) replace LICENSES.md/licenses.html.
- Docs: README headers carry the "RedMatic 9" notice; wiki Intro/Home
  rewritten; dark-mode logo. READMEs are generated: edit
  `docs/README.header*.md` / `docs/README.footer*.md`, then
  `node update_readme.js`.

## Building and testing locally

- `./build_addon.sh <arch>` needs curl, tar, node, npm and **patchelf**
  (a static release binary from github.com/NixOS/patchelf works fine
  without root). Output goes to `dist/`.
- Manual install over ssh, exactly what the firmware does: `scp` the
  tarball to `/usr/local/tmp`, untar into a temp dir, `chmod +x
  update_script`, `./update_script` (exit 10 = fresh install, 0 =
  update), then `/usr/local/etc/config/rc.d/redmatic start`. After a
  first manual install restart lighttpd once
  (`/etc/init.d/S50lighttpd restart`).
- Useful for scripted checks on a CCU: Node-RED token via
  `POST /addons/red/auth/token`, CCU session via the JSON-API
  (`Session.login`; note the response has a space after the colon),
  `settings.cgi?sid=@<session>@` for the config UI, inject nodes via
  `POST /addons/red/inject/<id>` — send an empty body (`-d ""`) or
  lighttpd answers 411.
- Container smoke test (Debian linux/amd64 against the built x86_64
  tree):

```
docker run --rm --platform linux/amd64 -v "$PWD/addon_tmp/redmatic:/src:ro" debian:bookworm-slim bash -c '
mkdir -p /usr/local/addons && cp -a /src /usr/local/addons/redmatic && cd /usr/local/addons/redmatic
export PATH=$PWD/bin:$PATH; . ./versions
cp etc/default-settings.json etc/settings.json; echo key > etc/credentials.key
bin/node lib/node_modules/node-red/red.js -s lib/settings.js'
```

## Release flow

1. Optionally do the one WebUI-upload install mentioned above.
2. Set the final version in `package.json` (e.g. `9.0.0-beta.0` or
   `9.0.0`), run `node update_package.js`.
3. Run the **build-release** workflow (workflow_dispatch) — it tags
   `v<version>`, creates a **draft prerelease** with tarballs + SBOMs +
   RELEASE_BODY.md and pushes the wiki change history.
4. Release notes: breaking changes are pre-listed in roadmap task 8;
   also mention that formerly bundled extra nodes in `var` (dashboard,
   email, rbe, sun-position, combine, redmatic-led, redmatic-webapp)
   survive an update but are no longer maintained by the addon.
5. Then the issue mass-close (task 5a) — comment + close obsolete
   backlog (~166 issues), each signed
   "Written by Claude Fable on behalf of hobbyquaker."

## Open items (see ROADMAP.md)

- Task 8: release (hardware verification done).
- Task 5a: issue mass-close after release.
- Task 7: wiki deep pages (Node-Installation, Homekit, ZigBee,
  package-manager mentions in FAQ/Installation etc.) still describe the
  old world; Intro/Home are done. RedMatic-WebApp repo is archived.
- Possible cleanup: the lighttpd.conf / cp_security.cgi runtime patches
  in `bin/redmatic` are dead code on all supported firmware (both are
  native there now) — keep or drop, maintainer's call.

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
- Lab test systems, their addresses and credentials stay out of the
  repo, the wiki and issues.

## Misc notes

- Telemetry: entries like "26.1.0" (and 7.3.x/7.4.x) on
  telemetry.redmatic.de are **not from this work** — the endpoint is
  unauthenticated and forks/custom builds report to it. Dev builds only
  send telemetry when `bin/redmatic start` runs on a CCU.
- Alpine edge currently ships nodejs 24.18.x for armv7 while
  nodejs.org is at 24.20.0 — the build accepts that (major must match)
  and records the actual version per arch in `versions`.
- `update_package.js` regenerates the root package.json dependency
  mirror from the three layer files after version bumps.
