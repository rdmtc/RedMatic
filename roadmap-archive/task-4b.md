# Task 4b — Replace ain2 / unix-dgram syslog logging (last native dep)

**✅ done 2026-09-02** (`9.0.0-dev.3`, commit 5bb268f)

`lib/logger.js` rewritten: Node-RED log output is piped into
**persistent per-severity busybox `logger` child processes**
(`logger -t 'node-red[pid]' -p daemon.<severity>`), lazily spawned and
respawned on exit. This turned out better than the roadmap's accepted
trade-off (one priority per pipe): exact syslog severities are
preserved. ain2/unix-dgram are gone; the addon contains **zero native
node modules**, which is what made tasks 2 and 4a possible without
cross-compilation infrastructure.

The settings key `logging.ain` was renamed to `logging.syslog`, with a
migration chain in `lib/settings.js` (console → ain → syslog, 1.x/2.x-8.x
keys) and a fallback in the config UI for not-yet-migrated settings.

Analysis and rejected alternatives (cross-compiled unix-dgram in CI,
UDP syslog to 127.0.0.1, dropping syslog entirely) are preserved in the
git history of ROADMAP.md (commit 6ba1e4c).
