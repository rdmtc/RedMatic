### RedMatic 9.9.0

Bringt node-red-contrib-ccu 4.4.5 und startet auf openccu-lite beim Booten
vor den Schnittstellenprozessen.

- **node-red-contrib-ccu 4.4.5: Ein fehlgeschlagenes `init` wird nach 1, 2, 4
  und 8 Sekunden und danach alle 15 Sekunden wiederholt** (bisher 2, 4, 8,
  16 Sekunden, dann alle 30). Solange ein Schnittstellenprozess noch startet
  und die Verbindung ablehnt, steht im Log eine Info-Zeile („HmIP-RF not
  listening yet … waiting for it“) statt einer Warnung; lehnt er ab, nachdem
  er schon verbunden war, bleibt es eine Warnung.
- **node-red-contrib-ccu 4.4.5: Die direkte Verbindung zu den
  Schnittstellenprozessen auch dann, wenn Node-RED vor rfd startet.** Die
  CCU-Verbindung erkannte „läuft auf der CCU selbst“ bisher nur an rfds
  offenem Port; startete Node-RED früher, lief jede Schnittstelle bis zum
  nächsten Neustart über die Proxy-Ports des Webservers. Jetzt reicht dafür
  auch die Schnittstellenliste der CCU (`/etc/config/InterfacesList.xml`).
- **openccu-lite: Frühstart.** Das Manifest (`openccu-lite.json`) erklärt
  `runtime.start: "early"`: das System startet RedMatic beim Booten vor rfd
  und hmipserver, und die CCU-Nodes verbinden sich, sobald die
  Schnittstellen antworten. Auf der Seite Zusatzsoftware lässt sich der
  Frühstart abschalten. Auf einer CCU3 und OpenCCU ändert sich nichts.
- **Zwei Zeilen weniger im Log bei jedem Start:** kein „Usage: node-red …“
  mehr für den `init`-Aufruf vor dem Start, und kein „Permission denied“,
  wenn das Addon die Telemetrie-Kennung des Systems nicht lesen darf.

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
