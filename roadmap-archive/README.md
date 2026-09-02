# Roadmap archive

Completed and closed roadmap items — one file per item, named after its
task number (e.g. `task-1.md`). Open items live in
[../ROADMAP.md](../ROADMAP.md); task numbers are stable and never
reused, so an archived item stays findable from the roadmap's contents
index (marked ✅ there, linking here).

## Contents

- [task-1.md](task-1.md) — Strip down included Node-RED nodes ✅
  2026-09-02 (`9.0.0-dev.1`, only node-red-contrib-ccu remains, no
  example flows anymore).
- [task-2.md](task-2.md) — Remove package manager and prebuilds ✅
  2026-09-02 (`9.0.0-dev.2`, ~840k lines deleted, on-device jq/jo/git
  eliminated).
- [task-4.md](task-4.md) — Modernize Node.js and Node-RED ✅ 2026-09-02
  (`9.0.0-dev.4`, Node 24 / Node-RED 5.0.6 / npm 11 /
  node-red-contrib-ccu 4.0.0, armv7l musl runtime).
- [task-4a.md](task-4a.md) — Limit target platforms ✅ 2026-09-02
  (`9.0.0-dev.4`, armv7l/aarch64/x86_64 only).
- [task-4b.md](task-4b.md) — Replace ain2/unix-dgram syslog logging ✅
  2026-09-02 (`9.0.0-dev.3`, busybox logger pipes, zero native modules).
- [task-5.md](task-5.md) — Review Node-RED patches ✅ 2026-09-02
  (`9.0.0-dev.4`, zero source patching, npmrc instead).
- [task-6.md](task-6.md) — GitHub Actions instead of Travis ✅
  2026-09-02 (`9.0.0-dev.6`, ci.yml + build.yml, Travis deleted).
