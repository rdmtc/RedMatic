# Task 1 — Strip down included Node-RED nodes

**✅ done 2026-09-02** (`9.0.0-dev.1`, commit b1b4693)

Only **node-red-contrib-ccu** remains bundled. All other nodes/packages
(dashboard, redmatic-homekit, chatbot, zigbee, modbus, serialport,
sqlite, johnny-five, tfjs, signal, midnight-red theme, redmatic-led,
redmatic-webapp, …) were removed from
`addon_files/redmatic/lib/package.json`,
`addon_files/redmatic/var/package.json` and the root `package.json`
mirror. The lib layer keeps only npm and node-red (ain2 went with task
4b). The x86_64-specific jq dependency juggling in `build_addon.sh` is
gone. The midnight-red theme option was removed from the settings UI
with a config migration.

**No example/starter flows anymore** (decision 2026-09-02): 
`example-flows.json` deleted, the first-install step removed from
`update_script` — new installs start with an empty flow. The old
example flows depended on dashboard/combine nodes anyway.

Existing installs keep their palette-installed nodes: the update_script
merge preserves the user's `var/package.json` entries and
`var/node_modules`; only the addon-owned lib layer is wiped on update.

The "regenerate LICENSES.md / licenses.html" sub-item was superseded by
the SBOM decision (see task 3 in the roadmap).
