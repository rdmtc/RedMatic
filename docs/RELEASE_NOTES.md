### RedMatic 9.18.0

Deutlich weniger Schreibzugriffe auf die SD-Karte: Kontextspeicher,
Updates, Palette-Installationen und node-red-contrib-ccu 4.11.0.

- **Der Datei-Kontextspeicher schreibt nur noch, was sich geändert hat.**
  Node-RED schrieb beim Speichern (alle 30 Sekunden) jeden Bereich des
  Kontexts komplett neu, auch wenn sich nichts geändert hatte – bei einem
  großen globalen Kontext viele Megabyte pro Stunde. Unveränderte Bereiche
  werden jetzt übersprungen. Das Intervall bleibt einstellbar; das Feld auf
  der Einstellungsseite hat jetzt eine Einheit und erklärt, was ein längeres
  Intervall bedeutet.
- **Ein Update schreibt das Paket nur noch einmal.** Bisher wurde das
  ausgepackte Paket ein zweites Mal kopiert; jetzt wird es verschoben. Ein
  Update schreibt dadurch etwa 40 % weniger.
- **Der npm-Cache für Palette-Installationen liegt im Arbeitsspeicher** und
  wird bei jedem Start geleert, statt die Pakete dauerhaft auf der SD-Karte
  zu behalten. Auf der Einstellungsseite lässt er sich wieder auf den
  Speicher legen (eine Neuinstallation derselben Version geht dann schneller).
- **node-red-contrib-ccu 4.11.0: weniger Schreibzugriffe.** Gerätetabelle und
  Namen werden nur bei Änderungen geschrieben, `paramsets.json` einmal pro
  Abrufrunde, der Wertecache beim Stoppen und sonst höchstens alle 60 Minuten
  (neue Einstellung im Verbindungs-Node, 0 = nur beim Stoppen). Ein Deploy
  schreibt etwa halb so viel.

Node.js 24.22.3, Node-RED 5.0.10 und npm 11.21.3 wie in 9.17.6.

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
- **Node.js 24 und Node-RED 5** (bisher Node.js 14 / Node-RED 1). Flows
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
