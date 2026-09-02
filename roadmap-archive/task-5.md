# Task 5 — Review Node-RED patches

**✅ done 2026-09-02** (`9.0.0-dev.4`, commit 4f63dfe)

Goal reached: **zero source patching of Node-RED.**

- The `sed` patch of `@node-red/registry/lib/installer.js` (forcing
  `--no-package-lock --global-style` on palette installs) was dropped.
  Its effect now comes from `addon_files/redmatic/etc/npmrc`, which npm
  picks up as its globalconfig (`{prefix}/etc/npmrc`, prefix being the
  addon dir): `install-strategy = shallow` (the npm ≥9 successor of
  `--global-style`), `package-lock = false`, plus `audit`/`fund`/
  `update-notifier` off for faster installs on the CCU.
- `float.patch` (core-util-is in the johnny-five prebuilts)
  disappeared with tasks 1 and 2.
- The CCU runtime patches in `bin/redmatic` (lighttpd.conf include,
  cp_security.cgi backup exclude) are kept — they patch the CCU, not
  Node-RED. Re-verification against current CCU firmware / OpenCCU
  happens with the 9.0.0 hardware test (task 8).
