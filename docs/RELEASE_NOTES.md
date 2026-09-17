### RedMatic 9.7.4

Bringt node-red-contrib-ccu 4.4.4, das eine Schnittstelle nach einem
fehlgeschlagenen `init` schnell erneut anmeldet, und lässt die feste
Startpause dort weg, wo die Firmware das Addon ohnehin erst nach den
Schnittstellenprozessen startet.

- **node-red-contrib-ccu 4.4.4: Ein fehlgeschlagenes `init` wird nach 2, 4, 8
  und 16 Sekunden und danach alle 30 Sekunden wiederholt.** Antwortete ein
  Schnittstellenprozess (z. B. HmIP-RF) beim Start von Node-RED noch nicht,
  kamen bisher minutenlang keine Ereignisse an (bei HmIP-RF bis zu 10 Minuten),
  ohne zwischengespeicherte Geräte gar keine. Während des Wartens zeigen die
  Nodes **waiting** (gelber Ring) statt getrennt, und das Log hat eine Warnung
  statt Fehlerzeilen.
- **Keine 30-Sekunden-Pause nach dem Booten, wo die Firmware das Addon nach den
  Schnittstellenprozessen startet.** Bisher wartete RedMatic in den ersten
  zwei Minuten nach einem Neustart immer 30 Sekunden, bevor Node-RED startete.
  Auf Systemen, deren Startreihenfolge das Addon erst nach rfd und hmipserver
  startet, entfällt diese Pause; das Log sagt dann „no boot delay“. Auf einer
  CCU3 und OpenCCU bleibt die Pause wie bisher.

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
