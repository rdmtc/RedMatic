## RedMatic-HomeKit und RedMatic-Matter nach einem RedMatic-Update

Nach einem Update von RedMatic bringt RedMatic auch die Nodes
[RedMatic-HomeKit](https://github.com/rdmtc/RedMatic-HomeKit) und
[RedMatic-Matter](https://github.com/rdmtc/RedMatic-Matter) auf ihre neueste Version – auf jedem Weg, auf dem RedMatic
aktualisiert wird (Zusatzsoftware-Seite der CCU, Update-Knopf der RedMatic-Einstellungen, Addons-Seite von
openccu-lite). Die Einstellung dazu steht auf der Einstellungsseite von RedMatic und ist **eingeschaltet**, auch auf
Systemen, die von einer älteren Version kommen.

* Beim ersten Start nach dem Update startet Node-RED wie gewohnt. Daneben fragt RedMatic die npm-Registry nach neueren
  Versionen der beiden Pakete, installiert sie in einem Durchgang ins Node-RED-Verzeichnis (so wie die Palette es tut)
  und startet Node-RED danach **einmal** neu. Gibt es nichts Neueres, passiert nichts.
* Nur diese beiden Pakete, und nur, wenn sie installiert sind. Andere Nodes bleiben, wie sie sind.
* Genommen wird die neueste Version, die zum Node.js und Node-RED dieser RedMatic-Version passt; Vorabversionen nie.
* Ein Paket, für das in `/usr/local/addons/redmatic/var/package.json` eine feste Version (`4.1.4` statt `~4.1.4`)
  oder eine andere Quelle (Datei, Git, URL) steht, wird nicht angefasst.
* Ohne Verbindung zur npm-Registry oder bei einem Fehler von npm bleibt alles, wie es ist: Node-RED läuft weiter, die
  Meldung steht im Log und auf der Einstellungsseite, und die nächsten Starts von RedMatic versuchen es erneut
  (insgesamt dreimal je RedMatic-Update).
* Ist die Einstellung beim Update ausgeschaltet, bleiben die Pakete bis zum nächsten RedMatic-Update unberührt; über
  die Palette von Node-RED lassen sie sich jederzeit von Hand aktualisieren.

## openccu-lite

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) ist eine Homematic-CCU-Firmware auf Basis von OpenCCU
**ohne ReGaHSS** (in Entwicklung, nur für Testsysteme). RedMatic läuft dort mit demselben Paket, denselben
Einstellungen und denselben Flows wie auf einer CCU3 oder OpenCCU und wird aus dem Addon-Katalog des Systems
installiert (*Zusatzsoftware → Katalog*). Ob RedMatic auf einer CCU oder auf openccu-lite läuft, wird zur Laufzeit
erkannt; einzustellen ist nichts.

* Die `node-red-contrib-ccu`-Nodes erreichen `rfd`, `hs485d` und `hmipserver` über die RPC-Schnittstelle des Systems
  (lite-rpc), ohne eigene Callback-Server. Ab RedMatic 9.15.1 ist das der Standard: das System stellt RedMatic dafür ein
  eigenes Token aus, eine bestehende Verbindung wird beim ersten Start einmalig umgestellt (eine Zeile im Log). Wer die
  direkte Verbindung behalten will, stellt *openccu-lite interfaces* im Connection-Node auf *CCU*. Geräte-, Kanal-,
  Raum- und Gewerkenamen kommen aus der Metadaten-API des Systems statt aus der ReGaHSS; `msg.channelName`,
  `msg.rooms`, `msg.functions` und die Raum-/Gewerke-Filter behalten ihre Form. Läuft Node-RED nicht auf dem System
  selbst, gehört ein API-Token des Systems in das Feld **openccu-lite token** des Connection-Nodes.
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
