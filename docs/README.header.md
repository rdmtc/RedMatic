<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/redmatic5-compact-dark.png">
  <img height="112px" src="assets/redmatic5-compact.png" align="left"/>
</picture>

<br>

[![Current Release](https://img.shields.io/github/release/rdmtc/RedMatic.svg?colorB=4cc61e)](https://github.com/rdmtc/RedMatic/releases/latest)
[![Installs](https://telemetry.redmatic.de/total.svg)](https://telemetry.redmatic.de/#36500)


**[Node-RED](https://nodered.org/about/) als Addon für die 
[Homematic CCU3](https://www.homematic-ip.com/produkte/detail/smart-home-zentrale-ccu3.html) und 
[OpenCCU](https://github.com/jens-maus/OpenCCU)**
<br><br>
<sub>[Click here for 🇬🇧🇺🇸 english readme](README.en.md)</sub>
### [🚀&nbsp;Schnellstart](#voraussetzungen)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[📚&nbsp;Dokumentation](https://github.com/rdmtc/RedMatic/wiki)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[📦&nbsp;Download](https://github.com/rdmtc/RedMatic/releases/latest)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[🚑&nbsp;Support](#support-mitarbeit)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[👮&nbsp;Lizenzen](#lizenzen)
___

> **⚠️ RedMatic 9:** RedMatic wurde radikal verschlankt und modernisiert
> (Node.js 24, Node-RED 5). Ab Version 9 ist nur noch
> [node-red-contrib-ccu](https://github.com/rdmtc/node-red-contrib-ccu)
> vorinstalliert — alle weiteren Nodes (z.&nbsp;B. Dashboard, HomeKit, Matter)
> werden bei Bedarf über den Node-RED Paletten-Manager installiert.
> Der RedMatic-Paketmanager und die RedMatic-WebApp sind deprecated und
> entfallen ersatzlos.
> **Bekannte und akzeptierte Einschränkung:** npm-Pakete bzw. Nodes mit
> binären (nativen) Abhängigkeiten können auf der CCU **nicht**
> installiert werden — auf der CCU gibt es keine Compiler-Toolchain,
> und vorkompilierte Binaries werden nicht mehr mitgeliefert.
>
> RedMatic 9 ist **veröffentlicht** - siehe
> [Releases](https://github.com/rdmtc/RedMatic/releases). Voraussetzung:
> CCU3 mit Firmware ab 3.61.5 oder aktuelles OpenCCU. **Vor einem Update
> von RedMatic 7/8 unbedingt ein CCU-Backup anlegen - das Backup liegt in
> der Verantwortung des Anwenders, ein Weg zurück führt nur darüber.**
> Bitte die [Release-Hinweise](https://github.com/rdmtc/RedMatic/wiki/RedMatic-9-Migration) lesen.

