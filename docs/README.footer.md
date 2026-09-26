## openccu-lite

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) ist eine Homematic-CCU-Firmware auf Basis von OpenCCU
**ohne ReGaHSS** (in Entwicklung, nur für Testsysteme). RedMatic läuft dort mit demselben Paket, denselben
Einstellungen und denselben Flows wie auf einer CCU3 oder OpenCCU und wird aus dem Addon-Katalog des Systems
installiert (*Zusatzsoftware → Katalog*). Ob RedMatic auf einer CCU oder auf openccu-lite läuft, wird zur Laufzeit
erkannt; einzustellen ist nichts.

* Die `node-red-contrib-ccu`-Nodes arbeiten wie gewohnt über `rfd`, `hs485d` und `hmipserver`. Geräte-, Kanal-, Raum-
  und Gewerkenamen kommen aus der Metadaten-API des Systems statt aus der ReGaHSS; `msg.channelName`, `msg.rooms`,
  `msg.functions` und die Raum-/Gewerke-Filter behalten ihre Form. Läuft Node-RED nicht auf dem System selbst, gehört
  ein API-Token des Systems in das Feld **openccu-lite token** des Connection-Nodes.
* Die Editor-Anmeldung mit *Benutzer der Zentrale* nutzt auf openccu-lite die Benutzer des Systems.
* **Systemvariablen, Programme und HM-Script gibt es nicht.** Die Nodes `ccu-sysvar`, `ccu-program`, `ccu-script` und
  `ccu-poll` bleiben in den Flows, beantworten aber jede Nachricht mit einer Fehlermeldung.
* Node-RED und das Addon loggen ins Journal (`journalctl -t node-red -t redmatic`); das Log der Einstellungsseite liest
  es von dort.

## Lizenzen

* [RedMatic](https://github.com/rdmtc/RedMatic) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [Apache License 2.0](LICENSE)
* [RedMatic Documentation](https://github.com/rdmtc/RedMatic/wiki) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [CC BY-SA License 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
* Third-party components are listed in the SBOM files (CycloneDX) attached to each [release](https://github.com/rdmtc/RedMatic/releases); the full license texts ship inside the addon in each package's `node_modules` directory

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIEẞLICH DER GARANTIE ZUR 
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF 
BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR
ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER 
SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.
