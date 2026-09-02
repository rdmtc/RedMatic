# Task 4a — Limit target platforms to armv7l, aarch64, x86_64

**✅ done 2026-09-02** (`9.0.0-dev.4`, commit 4f63dfe)

Officially supported platforms: **armv7l** (CCU3 stock firmware,
default package), **aarch64** (OpenCCU 64-bit, ARM SBCs), **x86_64**
(OpenCCU/debmatic on x86, containers).

**i686** and **armv6l** (Raspberry Pi 1/Zero) are dropped: the
commented-out lines in `build.sh` were removed, the armv6l/i686
branches (unofficial-builds URL, arch case) disappeared with the
`build_addon.sh` rewrite, and their prebuilt trees (incl. the
i686-only node-red-contrib-rcswitch2 handling) went with task 2.
`build_addon.sh` now rejects unknown architectures. armv6l/i686
sections were also removed from `build_release_body.sh` (task 6),
and `BUILD.md` mentions only the three supported platforms.
