### RedMatic 9.16.0

Weniger Speicher: node-red-contrib-ccu 4.8.0.

- **node-red-contrib-ccu 4.8.0 – die Verbindung braucht deutlich weniger
  Arbeitsspeicher.** Bisher merkte sich die Verbindung für jeden Datenpunkt,
  welche Subscriptions zu ihm passen und welche nicht – zwei Mengen je
  Datenpunkt, die mit Datenpunkten × Subscriptions wuchsen (auf einer CCU3 mit
  3.500 Datenpunkten und gut 500 Subscriptions aus Value-Nodes, RedMatic-HomeKit
  und RedMatic-Matter etwa 70 MB), bei jedem Deploy weiter wuchsen und nie
  wieder freigegeben wurden. Jetzt werden die Subscriptions über einen Index
  nach ihrem genauesten Filtermerkmal zugestellt: ein Ereignis wird nur gegen
  die Subscriptions geprüft, die zu ihm passen können, der Speicher wächst nur
  mit der Zahl der Subscriptions, ein Deploy ist in Millisekunden statt
  Sekunden erledigt. Was eine Subscription bekommt, und in welcher
  Reihenfolge, ist unverändert.
- **Parametersatz-Beschreibungen nur noch für die vorhandenen Gerätetypen im
  Speicher.** Die `paramsets.json` (14 MB mitgeliefert plus das, was das System
  selbst abgefragt hat) wurde bisher komplett geladen – rund 2.800 Typen,
  16–20 MB Heap, wovon ein System die paar Dutzend Typen braucht, die es hat.
  Die Datei auf der Platte bleibt vollständig; im Speicher liegen die
  Beschreibungen der Geräte aus der Gerätetabelle, neue Geräte werden zuerst
  in der Datei nachgeschlagen, erst dann an der Schnittstelle. Eine veraltete
  `ccu_paramsets_v2.json` im Verzeichnis wird beim Start entfernt.
- Das ist eine Verringerung, nicht die ganze Erklärung für ein großes Node-RED:
  Flows und andere Nodes behalten, was sie belegen. Auf einem großen System
  sind es in der Größenordnung 100 MB weniger belegter Heap.

Node.js 24.22.2 und Node-RED 5.0.9 wie in 9.15.4.

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
