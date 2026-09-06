# Handoff — RedMatic 9.4.0 (2026-09-06)

State of the 9.x modernization for continuing on another machine.
Written by Claude Fable on behalf of hobbyquaker at the end of the
2026-09-03 session. Read `ROADMAP.md` first; completed tasks are in
`roadmap-archive/`.

## Where things stand

`master` is at **9.4.0** (2026-09-06): 9.0.0 and 9.0.1 were released on
2026-09-04, 9.1.0 and 9.3.0 came from the automatic release workflow
(task 10; 9.3.0 bumped node-red-contrib-ccu to 4.3.0 on 2026-09-05),
9.2.0 added the one-click self-update on the settings page (task 11:
`bin/redmatic-update`, `www/update.cgi`, progress model measured on all
three lab boxes), and 9.4.0 makes RedMatic run on **openccu-lite**
(task 12, see below) with node-red-contrib-ccu **4.4.0**.

**Hardware verification (roadmap task 8) is complete on all three target
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
- aarch64 / OpenCCU 3.89.8 on a Raspberry Pi 4 (2026-09-04) — checklist
  with the alpha.0 package (no radio module on that box, so only rega,
  no device interfaces).
- WebUI installs done on the CCU3 (fresh, boot-time chroot install) and
  OpenCCU (live update) — the latter exposed the missing service start
  after updates, fixed in `update_script`.

All three lab systems are left with a running 9.0.0-alpha.0 install
(with the fixed update_script applied). Lab addresses
and credentials are intentionally **not** in this file.

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

**Automatic (ROADMAP task 10, since 9.0.1):** `auto-release.yml` runs
daily; when Node.js, npm, Node-RED or node-red-contrib-ccu have a newer
release within their pinned majors it bumps the addon minor, builds, runs
`test/e2e.sh`, pushes the bump and creates the release (draft unless the
repository variable `AUTO_RELEASE_PUBLISH` is `true`). Major switches
and bugfix patches stay manual:

1. Set the final version in `package.json` (e.g. `9.0.0-beta.0` or
   `9.0.0`), run `node update_package.js`.
2. Run the **build-release** workflow — either by hand
   (workflow_dispatch) or by pushing the tag `v<version>`, which the
   workflow now triggers on (it refuses a tag that does not match
   `package.json`). It creates a **draft** release (prerelease only for a
   version with a `-suffix`) with tarballs + SBOMs + RELEASE_BODY.md and
   pushes the wiki change history.
3. Release notes: breaking changes are pre-listed in roadmap task 8;
   state CCU3 firmware ≥ 3.61.5 / current OpenCCU as requirement (the
   addon no longer patches lighttpd.conf or the backup CGI); also mention that formerly bundled extra nodes in `var` (dashboard,
   email, rbe, sun-position, combine, redmatic-led, redmatic-webapp)
   survive an update but are no longer maintained by the addon.
4. (done) The issue mass-close happened after the alpha, see task 5a.

## openccu-lite (task 12, 9.4.0)

RedMatic runs on [openccu-lite](https://github.com/hobbyquaker/openccu-lite),
a CCU firmware without ReGaHSS, from the same package as on a CCU. The full
audit (every ReGa touch point and what happened to it) is in
`roadmap-archive/task-12.md`; the user-facing description is the
*openccu-lite* section of the READMEs (generated from
`docs/README.footer*.md`).

The short version:

- The session check of the settings CGIs (`www/settings.cgi`,
  `lib/session.tcl`) is **unchanged** — it is exactly the one script the
  box's `tclrega.so` shim answers. Do not add other `rega_script` calls,
  the shim errors on anything else.
- Node-RED's admin login goes through the new `lib/ccu-auth.js`: one probe
  of `GET /api/meta/v1/version`, then either `lib/rega-auth.js` (CCU,
  untouched) or `POST /api/auth/v1/login` (openccu-lite). Detection is
  cached per process; a box that cannot be asked falls back to the ReGa
  path and is retried after 30 s.
- `lib/log.tcl` reads the journal when there is no `/var/log/messages`;
  `www/backup.cgi` writes the archive to stdout when the CGI runs in
  occulited (`SERVER_SOFTWARE`) instead of relying on lighttpd's
  `X-Sendfile`; `bin/redmatic` starts without `start-stop-daemon` if it has
  to and skips the telemetry uuid when `/etc/config` is read-only.
- Names, rooms and functions in flows are node-red-contrib-ccu's business
  (4.4.0), not the addon's; the box's local token is read by the connection
  node itself because Node-RED runs as root there.
- **Not verified on hardware**: there was no openccu-lite box in the lab
  during this work. Everything was verified against fake servers, a
  container with a real `tclsh`, and the usual build + e2e run.
- Friction worth knowing: openccu-lite's `GET /addons` marks an addon as
  `rega_dependent` by scanning its code for ReGa idioms, and
  `lib/rega-auth.js` contains `dom.GetObject` **because the porting kit
  requires the ReGa path to stay**. RedMatic is therefore flagged, and
  after a migration from OpenCCU its rc.d script is disabled on the first
  boot (one click to re-enable). Reported to openccu-lite.

## Open items (see ROADMAP.md)

- Task 8: done (9.0.0 released 2026-09-04).
- Task 5a: done 2026-09-04 (backlog closed/transferred, discussions
  closed; only #226 open).
- Task 9: done 2026-09-04 (9.0.1, IPv6 link-local fix for Matter,
  verified on the CCU3; see roadmap-archive/task-9.md). 9.0.1 also fixed
  #599 (palette manager gone after OpenCCU live updates: Node-RED was
  started from the installer's deleted temp dir) and #600 (settings page
  said "stopped").
- Task 10 (new): release strategy / automatic releases, see ROADMAP.
- Task 12: done 2026-09-06 (9.4.0, openccu-lite; see above and
  roadmap-archive/task-12.md).
- Task 7: wiki overhaul done 2026-09-04 (see ROADMAP); remaining are the
  sibling-repo readmes (out of scope here) and re-testing the
  "Erfolgreich getestete Nodes" list with RedMatic 9.

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
