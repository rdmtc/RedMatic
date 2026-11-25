### RedMatic 10.0.0

Neue Hauptversion: **Node.js 26** und node-red-contrib-ccu 4.14.1. Flows,
Einstellungen und installierte Nodes werden beim Update von 9.x
übernommen; vorher wie immer ein Backup anlegen.

- **Node.js 26** (LTS, bisher Node.js 24), Node-RED 5.0.10, npm 11.21.3.
- **CCU3 (armv7l): Node.js aus einem stabilen Alpine-Zweig.** Die
  CCU3-Variante bringt ihr Node.js als eigenständige musl-Laufzeit mit;
  sie wird jetzt aus Alpine 3.24 statt aus dem Entwicklungszweig
  zusammengestellt, ebenso das mitgelieferte git auf allen drei
  Architekturen. Für aarch64 und x86_64 kommt Node.js wie bisher von
  nodejs.org. Getestet auf der CCU3 mit der Original-Firmware 3.89.11, auf
  OpenCCU und auf openccu-lite.
- **node-red-contrib-ccu 4.14.1: Systemvariablen und Programme auf
  openccu-lite.** openccu-lite hat keine ReGaHSS; die Systemvariablen und
  Programme stellt dort das Addon *Logic* als Geräte seiner Schnittstelle
  `Logic` bereit. Die Nodes *sysvar* und *program* nutzen sie über die
  lite-rpc des Systems und finden eine Variable oder ein Programm wie auf
  der CCU über den Namen – Flows laufen nach dem Umstieg weiter, sobald
  Variablen und Programme in Logic importiert sind. Ohne das Addon zeigen
  die Nodes *Logic addon not installed*. Die Verbindung folgt außerdem
  jeder Schnittstelle, die das System anbietet, auch der eines Addons.
- **openccu-lite:** RedMatic läuft dort wie seit 9.15 ohne Einrichtung –
  die Schnittstellen über die lite-rpc des Systems mit RedMatics eigenem
  Token, die Namen, Räume und Gewerke aus den Metadaten des Systems.
- **Hinweise zum Update von 9.x:**
  - Nodes werden mit Node.js 26 ausgeführt. Ein zusätzlich installierter
    Node, der eine ältere Node.js-Version voraussetzt, kann nach dem Update
    eine Warnung oder einen Fehler im Log zeigen; dann über den
    Paletten-Manager aktualisieren.
  - Die automatischen Updates von RedMatic gehen ab jetzt mit 10.x weiter;
    9.x bekommt keine Updates mehr.
- Die Vorabversion 10.0.0-beta.0 kann direkt auf 10.0.0 aktualisiert
  werden.

### RedMatic 9

RedMatic 9 ist eine grundlegend verschlankte und modernisierte Version.
**Bitte vor der Installation lesen**, es gibt einschneidende Änderungen.

> **⚠️ Backup ist Sache des Anwenders.** Vor dem Update von RedMatic 7.x/8.x
> unbedingt ein **CCU-Backup** anlegen und die Flows exportieren. Ein Weg
> zurück gibt es nur über dieses Backup. Das Update erfolgt auf eigene
> Verantwortung.

- **Voraussetzungen:** CCU3 mit Firmware **ab 3.61.5** oder aktuelles
  OpenCCU (ehemals RaspberryMatic). Ältere Firmware wird nicht mehr
  unterstützt (RedMatic patcht keine Firmware-Dateien mehr).
- **Node.js 24 (ab RedMatic 10: Node.js 26) und Node-RED 5** (bisher Node.js 14 / Node-RED 1). Flows
  aus RedMatic 7/8 werden von Node-RED beim ersten Start übernommen.
- **Nur noch node-red-contrib-ccu ist vorinstalliert.** Dashboard,
  HomeKit, E-Mail, Sun-Position, Combine, RedMatic-LED usw. werden nicht
  mehr mitgeliefert und nicht mehr von RedMatic gepflegt. Bei einem
  Update von 7.x/8.x bleiben bereits installierte Nodes im
  Benutzerverzeichnis erhalten und können über den Node-RED
  Paletten-Manager aktualisiert oder entfernt werden.
- **Der RedMatic-Paketmanager und die RedMatic-WebApp entfallen
  ersatzlos.** Nodes werden ausschließlich über den Paletten-Manager
  installiert.
- **Keine nativen Module:** Nodes mit binären Abhängigkeiten (Compiler
  nötig) können auf der CCU nicht installiert werden — es werden keine
  vorkompilierten Binaries mehr mitgeliefert.
- `node-red-node-rbe` ist inzwischen Bestandteil von Node-RED; eine noch
  installierte Kopie erzeugt nur eine Warnung und kann entfernt werden.
- Logging: Die Einstellung `logging.ain` wird automatisch nach
  `logging.syslog` migriert.
- Es werden keine Beispiel-Flows mehr mitgeliefert.
- Die Lizenzübersicht wurde durch SBOMs (CycloneDX) ersetzt, die als
  Release-Anhang und in der RedMatic-Konfiguration verfügbar sind.

Ausführlich: [Migration auf RedMatic 9](https://github.com/rdmtc/RedMatic/wiki/RedMatic-9-Migration).
Rückmeldungen bitte als GitHub Issue.
