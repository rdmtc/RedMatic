<img height="112px" src="assets/redmatic5-compact.png" align="left"/>

<br>

[![Current Release](https://img.shields.io/github/release/rdmtc/RedMatic.svg?colorB=4cc61e)](https://github.com/rdmtc/RedMatic/releases/latest)
[![Installs](https://telemetry.redmatic.de/total.svg)](https://telemetry.redmatic.de/#36500)


**[Node-RED](https://nodered.org/about/) as Addon for the
[Homematic CCU3](https://www.homematic-ip.com/en/products/detail/smart-home-central-control-unit-ccu3.html) and
[OpenCCU](https://github.com/jens-maus/OpenCCU)**

> **⚠️ RedMatic 9:** RedMatic is being radically slimmed down and
> modernized (Node.js 24, Node-RED 5). As of version 9 only
> [node-red-contrib-ccu](https://github.com/rdmtc/node-red-contrib-ccu)
> comes preinstalled — any additional nodes (dashboard, HomeKit,
> Zigbee, …) are installed on demand via the Node-RED palette manager.
> The RedMatic package manager and the RedMatic-WebApp are deprecated
> and removed without replacement.
> **Known and accepted limitation:** npm packages / nodes with binary
> (native) dependencies can **not** be installed on the CCU — there is
> no compiler toolchain on the CCU, and precompiled binaries are no
> longer shipped.

