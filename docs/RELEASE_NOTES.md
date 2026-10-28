### RedMatic 9.15.1

openccu-lite: die CCU-Nodes nutzen jetzt die RPC-Schnittstelle des Systems.

- **openccu-lite: lite-rpc als Standard.** node-red-contrib-ccu 4.7.0
  (seit RedMatic 9.15.0 enthalten) erreicht die Schnittstellenprozesse auf
  openccu-lite über die RPC-Schnittstelle des Systems, ohne eigene
  Callback-Server. Dafür braucht es ein Token: das Manifest fordert jetzt
  den Bereich `rpc:admin` an, das System stellt RedMatic bei jedem Start
  ein eigenes Token aus. Eine bestehende Verbindung wird beim ersten Start
  einmalig umgestellt, das Log sagt es in einer Zeile. Wer die direkte
  Verbindung behalten will, stellt *openccu-lite interfaces* im
  Connection-Node auf *CCU*. Auf einer CCU3 und OpenCCU ändert sich nichts.
- **HomeKit:** redmatic-homekit 4.1.4 (nicht vorinstalliert, über den
  Paletten-Manager zu aktualisieren) behebt den Absturz von Node-RED nach
  einem Deploy, während der Node `homematic-devices` noch auf die CCU
  wartet („This callback function has already been called"), und stellt
  beim zweiten und dritten Empfängerkanal eines HmIP-Rollladen- oder
  Jalousieaktors den richtigen Kanal.

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
