# Task 2 — Remove RedMatic package manager and package prebuilds

**✅ done 2026-09-02** (`9.0.0-dev.2`, commit feb8479 — 9630 files,
~840k lines deleted)

Removed: `bin/redmatic-pkg`, `www/pkg.cgi`, the package-manager UI
(Pakete tab in `settings.html` / `js/script.js`), `build_packages.js`
and the pkg-repo.json generation, the `do_pkg_upgrade` handling, the
entire `prebuilt/` tree, and `prebuild.sh`. `BUILD.md` updated.

Beyond the roadmap text, the prebuilt trees turned out to carry the
on-device CLI tools, which required:

- `tools/<arch>/bin/update_addon` — the only remaining per-arch binary
  (eQ-3 tool for the WebUI buttons), now checked in separately and
  copied by `build_addon.sh`.
- on-device `jq`/`jo` eliminated: `redmaticVersions` rewritten in Node
  (`lib/redmaticVersions.js`, folds in the former `deviceTypes`
  script); settings reads in `bin/redmatic` and `redmaticLoader`
  converted to node one-liners; the `update_script` package.json merge
  converted to node.
- bundled `git` dropped (served the Node-RED projects feature);
  `GIT_EXEC_PATH`/git-core handling removed. Projects feature simply
  stays off without git.
- `update_script` got a 9.x migration removing stale tools, package
  manager files and logs from existing installs; pre-8.x migration
  blocks dropped.

The old "Dashboard" button in the config UI navbar was removed together
with the package manager UI (dashboard is no longer bundled).
