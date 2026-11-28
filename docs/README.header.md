<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/redmatic5-compact-dark.png">
  <img height="112px" src="assets/redmatic5-compact.png" align="left"/>
</picture>

<br>

[![Current Release](https://img.shields.io/github/release/rdmtc/RedMatic.svg?colorB=4cc61e)](https://github.com/rdmtc/RedMatic/releases/latest)
[![Installs](https://telemetry.redmatic.de/total.svg)](https://telemetry.redmatic.de/#36500)


**[Node-RED](https://nodered.org/about/) als Addon für [openccu-lite](https://github.com/hobbyquaker/openccu-lite), 
[Homematic CCU3](https://www.homematic-ip.com/produkte/detail/smart-home-zentrale-ccu3.html) und 
[OpenCCU](https://github.com/jens-maus/OpenCCU)**
<br><br>
<sub>[Click here for 🇬🇧🇺🇸 english readme](README.en.md)</sub>
### [🚀&nbsp;Schnellstart](#voraussetzungen)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[📚&nbsp;Dokumentation](https://github.com/rdmtc/RedMatic/wiki)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[📦&nbsp;Download](https://github.com/rdmtc/RedMatic/releases/latest)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[🚑&nbsp;Support](#support-mitarbeit)&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;[👮&nbsp;Lizenzen](#lizenzen)
___

> Vorinstalliert ist nur
> [node-red-contrib-ccu](https://github.com/rdmtc/node-red-contrib-ccu) —
> alle weiteren Nodes (z.&nbsp;B. Dashboard, HomeKit, Matter) werden bei
> Bedarf über den Node-RED Paletten-Manager installiert.
> **Bekannte und akzeptierte Einschränkung:** npm-Pakete bzw. Nodes mit
> binären (nativen) Abhängigkeiten können auf der CCU **nicht**
> installiert werden — auf der CCU gibt es keine Compiler-Toolchain,
> und vorkompilierte Binaries werden nicht mitgeliefert.

