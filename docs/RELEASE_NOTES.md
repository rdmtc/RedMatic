### RedMatic 9.12.5

openccu-lite: RedMatic darf den USB-Stick nutzen, und ein Node-RED, das nicht
starten kann, zeigt das jetzt an.

- **openccu-lite: Zugriff auf den USB-Stick.** Auf openccu-lite läuft
  RedMatic eingeschränkt unter einem eigenen Benutzer. Lag ein Context-Store
  (oder anderes) auf dem USB-Stick unter `/media`, etwa noch von der CCU3,
  scheiterte Node-RED beim Start mit „permission denied" – die Flows liefen
  nicht. Das Manifest gibt RedMatic jetzt den Stick frei (Gruppe
  `usbstorage`, `/media` beschreibbar).
- **Ein Context-Store, den Node-RED nicht nutzen darf,** fällt für diesen
  Lauf auf `var/` zurück, mit einer deutlichen Zeile im Log. Die Einstellung
  und die Daten am alten Ort bleiben unverändert.
- **Kann Node-RED seinen Server nicht starten, beendet es sich** statt
  weiterzulaufen, ohne etwas zu tun. Auf openccu-lite zeigt die Seite
  Addons/Dienste RedMatic dann als beendet, statt dauerhaft „Node-RED
  startet". Auf einer CCU3 und OpenCCU ändert sich nichts.

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
