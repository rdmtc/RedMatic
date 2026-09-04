<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/redmatic5-compact-dark.png">
  <img height="112px" src="assets/redmatic5-compact.png" align="left"/>
</picture>

<br>

[![Current Release](https://img.shields.io/github/release/rdmtc/RedMatic.svg?colorB=4cc61e)](https://github.com/rdmtc/RedMatic/releases/latest)
[![Installs](https://telemetry.redmatic.de/total.svg)](https://telemetry.redmatic.de/#36500)


**[Node-RED](https://nodered.org/about/) as Addon for the
[Homematic CCU3](https://www.homematic-ip.com/en/products/detail/smart-home-central-control-unit-ccu3.html) and
[OpenCCU](https://github.com/jens-maus/OpenCCU)**

> **⚠️ RedMatic 9:** RedMatic has been radically slimmed down and
> modernized (Node.js 24, Node-RED 5). As of version 9 only
> [node-red-contrib-ccu](https://github.com/rdmtc/node-red-contrib-ccu)
> comes preinstalled — any additional nodes (e.g. dashboard, HomeKit, Matter)
> are installed on demand via the Node-RED palette manager.
> The RedMatic package manager and the RedMatic-WebApp are deprecated
> and removed without replacement.
> **Known and accepted limitation:** npm packages / nodes with binary
> (native) dependencies can **not** be installed on the CCU — there is
> no compiler toolchain on the CCU, and precompiled binaries are no
> longer shipped.
>
> RedMatic 9 is **released** - see
> [Releases](https://github.com/rdmtc/RedMatic/releases). Requirements:
> CCU3 with firmware 3.61.5 or newer, or current OpenCCU. **Before updating
> from RedMatic 7/8, create a CCU backup - the backup is your own
> responsibility and the only way back.** Please read the
> [migration notes](https://github.com/rdmtc/RedMatic/wiki/RedMatic-9-Migration).

_RedMatic_ packages [Node-RED](https://nodered.org/about/) as a CCU Addon, a software package that can be comfortably installed on a Homematic CCU3 or [OpenCCU](https://github.com/jens-maus/OpenCCU) (formerly RaspberryMatic) via the WebUI. Homematic is a series of smart home automation products by the manufacturer [eQ-3](https://eq-3.de), popular especially in Germany.

The basis is formed by [Node-RED](https://nodered.org/about/) with the
[CCU Nodes for Node-RED](https://github.com/rdmtc/node-red-contrib-ccu). These components offer the possibility to visually and easily create rules, automations, scripts and connections to external services and systems for a Homematic System. To a large extent even without programming knowledge. In the
[Wiki](https://github.com/rdmtc/RedMatic/wiki) you can find more information about Node-RED and some
application examples (so-called _Flows_).

## RedMatic as a bridge from the CCU to MQTT, Home Assistant, Matter and HomeKit

_RedMatic_ is a good way to connect a Homematic CCU to other systems - right on
the CCU, without an additional server:

* **MQTT** - the [ccu-mqtt](https://github.com/rdmtc/node-red-contrib-ccu#mqtt) node
  publishes all datapoints with a freely configurable topic and payload structure
  and accepts commands.
* **Home Assistant** - the [ccu-homeassistant](https://github.com/rdmtc/node-red-contrib-ccu#home-assistant)
  node adds MQTT auto-discovery on top of ccu-mqtt: selected devices show up as
  entities in Home Assistant automatically. _(in preparation, node-red-contrib-ccu 4.2.0)_
* **Matter** - [RedMatic-Matter](https://github.com/rdmtc/RedMatic-Matter) exposes Homematic
  devices as a Matter bridge, usable with Apple Home, Amazon Alexa, Google Home and
  Home Assistant. _(in preparation, release coming soon)_
* **HomeKit** - [RedMatic-HomeKit](https://github.com/rdmtc/RedMatic-HomeKit) exposes Homematic
  devices as HomeKit accessories.

All bridges share a single `ccu-connection`; devices are exposed opt-in by ticking
them in the editor. Matter and HomeKit are installed via the Node-RED palette manager,
MQTT and Home Assistant ship with the preinstalled CCU nodes.

**Why on the CCU rather than with an external bridge project?** There are good
alternatives such as CCU-Jack, openccu-loom or matterbridge-homematic. The CCU's
interface processes (rfd, hs485d, HmIPServer) are, however, sensitive to many
concurrent RPC event subscribers and to network hiccups. RedMatic funnels all bridges
through a single subscriber per interface, talks the more efficient BIN-RPC instead of
XML-RPC to rfd and hs485d, and keeps all RPC traffic on the CCU's loopback interface -
network dropouts never reach the CCU processes at all.

**What can sit on the other side of the MQTT bridge** - two projects by the RedMatic
author that understand RedMatic's discovery data out of the box:

* [feezal](https://github.com/feezal/feezal) - build MQTT dashboards and apps visually
  in the browser (WYSIWYG editor, Web Components, PWA, export as a static page or
  Android/iOS app). Detects the devices RedMatic announces via auto-discovery and wires
  them up with one click - a modern replacement for the removed RedMatic-WebApp.
* [she](https://github.com/hobbyquaker/she) - smart home engine: automations as plain
  JavaScript scripts with MQTT, a built-in Matter controller, scheduler and a web IDE
  with AI assistant. For those who prefer writing logic in code rather than flows, or
  are looking for a central engine beyond the usual suspects (e.g. Home Assistant or
  ioBroker) 😉

## Automating with Node-RED

In addition, a large and active community around Node-RED created a
[library of thousands of additional nodes](https://flows.nodered.org/?type=node&num_pages=1) which
[can be installed](https://github.com/rdmtc/RedMatic/wiki/Node-Installation) easily and offer connections to various other services and systems -
such as KNX, Loxone, various Smart TVs and AV receivers, Sonos, Hue, Amazon Alexa, Google Home, various databases such as InfluxDB
or MySQL, web services to query weather data and much more.

_RedMatic_ can thus - especially for those who don't want to run another server besides the CCU - provide an alternative to a "mature" Smart Home System such as Home Assistant, ioBroker, OpenHAB or FHEM.
For the automation of a Homematic system, _RedMatic_ can also be used as an alternative or supplement to "Rega"
programs/scripts.


## Requirements

_RedMatic_ is suitable for the **CCU3** (and piVCCU3) with firmware 3.61.5 or newer and for current **OpenCCU** on the architectures armv7l (e.g. Raspberry Pi 2), aarch64 (e.g. Raspberry Pi 3/4/5) and x86_64 (e.g. _ova_, _intelnuc_, containers).

On the CCU1, CCU2 and on armv6l systems (Raspberry Pi 1/Zero) _RedMatic_ can not be used.

For **Matter** ([RedMatic-Matter](https://github.com/rdmtc/RedMatic-Matter)) IPv6 must be enabled on the LAN (a link-local address is enough; RedMatic creates it on the CCU3 at start if it is missing), and the Matter controller (Apple TV/HomePod, Echo, Nest Hub, Home Assistant) must be on the same network segment as the CCU.

A modern browser is required to use the web interfaces, Internet Explorer is not supported.


## Quick Start

On the [Releases](https://github.com/rdmtc/RedMatic/releases/latest) page the file `redmatic-<version>.tar.gz` is available for download. After the installation of the addon via the Homematic WebUI (Control Panel -> additional software) and the subsequent reboot of the CCU, Node-RED is reachable at `http://<ccu-address>/addons/red`. Patience is required during installation, it can take a few minutes.


## Support, Contributing

For feedback of any kind, questions, suggestions and wishes please use the
[discussion forum](https://github.com/rdmtc/RedMatic/discussions), for bug reports the
[Issue Tracker](https://github.com/rdmtc/RedMatic/issues).

Participation in any form is welcome and desired, especially all users are invited to extend the [list of successfully tested nodes](https://github.com/rdmtc/RedMatic/wiki/Erfolgreich-getestete-Nodes), to publish sample flows and to contribute to the improvement and extension of the [documentation](https://github.com/rdmtc/RedMatic/wiki).

No donations will be accepted, but I would be happy if the successful usage of this software is acknowledged by giving the project a Github star ⭐️

## Documentation

Sorry, the Documentation is not yet translated into English. [German Documentation](https://github.com/rdmtc/RedMatic/wiki/Home)


## Licenses

* [RedMatic](https://github.com/rdmtc/RedMatic) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [Apache License 2.0](LICENSE)
* [RedMatic Documentation](https://github.com/rdmtc/RedMatic/wiki) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [CC BY-SA License 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
* Third-party components are listed in the SBOM files (CycloneDX) attached to each [release](https://github.com/rdmtc/RedMatic/releases); the full license texts ship inside the addon in each package's `node_modules` directory

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
