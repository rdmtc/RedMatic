# Task 9 — IPv6 link-local address for Matter on the CCU3

**✅ done 2026-09-04** (`9.0.1-dev.0`; verified on a CCU3 with the
original firmware 3.89.8)

Filed 2026-09-04 from the RedMatic-Matter roadmap (its task 13 / D-14,
decided by the maintainer 2026-09-02): the CCU3 with the original eQ-3
firmware has **no IPv6 link-local address on `eth0` after boot** (kernel
bring-up order of the USB NIC; hm2matter M-13 found it and verified the
fix on hardware 2026-08-31). Matter controllers reach a bridge over IPv6
only, so `redmatic-matter` shows a red "no IPv6 address on eth0" status on
such a box; the node deliberately only checks and reports, the platform
fixes it.

- In `bin/redmatic` (start): if `eth0` has no `fe80::` address, write
  `/proc/sys/net/ipv6/conf/eth0/disable_ipv6` 1 → 0 and wait for
  duplicate address detection to finish (a second or two) before Node-RED
  starts. Harmless when the address already exists (OpenCCU, or a CCU3
  after the fix).
- Log one line either way so a support request shows it.
- Verify on the CCU3 lab box (original firmware) with `ip -6 addr show
  dev eth0` after a reboot, and that `redmatic-matter`'s bridge node goes
  from the red status to "pairing code …".
- Mention in the wiki (Matter page, once it exists) that Matter needs IPv6
  on the LAN and a controller on the same segment.

Not a 9.0.0 blocker; needed before the first Matter hardware test on a
CCU3 with the official firmware (RedMatic-Matter task 15).

## Result

- `bin/redmatic` (`EnsureIpv6LinkLocal`, called in `Start` right before
  Node-RED is started, i.e. after the 30 s post-reboot wait): if
  `/proc/sys/net/ipv6/conf/eth0/disable_ipv6` exists, is `0` and
  `ip -6 addr show dev eth0` has no `fe80:` address, it writes `1` then
  `0` and polls once per second (max 10 s) until the address is no longer
  `tentative`. One syslog line either way (`created (DAD took Ns)` /
  `present` / skipped because no eth0 or IPv6 deliberately disabled /
  warning when still missing).
- Hardware behaviour (CCU3 firmware 3.89.8): after boot `eth0` had only
  the global SLAAC address and **no link-local**; the fix created it and
  duplicate address detection took **2 s** (log: `IPv6 link-local address
  on eth0 created (DAD took 2s)`). On a later restart: `present`. Side
  effect seen: re-enabling IPv6 re-runs DAD on the global address too
  (tentative for about two seconds), no other effect observed.
- `redmatic-matter` 1.0.0-dev.1 installed from a tarball on the same box
  (4 min, 76 MB nested by global-style): the bridge node comes up
  `online` on UDP 5540 with a pairing code, endpoints registered. Note
  that the node's pre-flight accepts any IPv6 address, so on a box with a
  global SLAAC address the red status would not show even without the fix;
  mDNS/Matter still need the link-local address.
- Wiki Intro (DE/EN) "Voraussetzungen"/"Requirements": Matter needs IPv6
  on the LAN (link-local suffices, RedMatic creates it on the CCU3) and a
  controller on the same network segment. Release notes entry in
  `docs/RELEASE_NOTES.md` (9.0.1).
