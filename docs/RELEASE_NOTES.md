### RedMatic 9.7.1

Behebt die Anmeldung am Node-RED-Editor auf **openccu-lite über HTTPS**. Wer
openccu-lite über HTTPS nutzt, sollte aktualisieren.

- **Über HTTPS verlangte der Node-RED-Editor auf openccu-lite eine zweite
  Anmeldung und hatte danach keine Verbindung zum Backend** („Lost connection
  to server, reconnecting…“, im Log von lighttpd `/addons/red/comms` mit
  Status 500). openccu-lite nennt sein Session-Cookie über HTTPS
  `__Secure-occulite_session`, RedMatic kannte nur `occulite_session`. Der
  Editor erkennt die Anmeldung an openccu-lite jetzt unter beiden Namen und
  sollte ohne eigenen Login-Dialog öffnen.
- **Das Cookie wird nur noch auf openccu-lite ausgewertet.** Node-RED prüft die
  WebSocket-Verbindung des Editors allein anhand dieses Cookies, sobald RedMatic
  das so einstellt, und trennt sie, wenn die Prüfung fehlschlägt. Auf einer CCU3
  oder OpenCCU gibt es keine solche Anmeldung, dort hätte ein beliebiges Cookie
  für die Adresse der Zentrale (etwa von einem anderen Addon) den Editor vom
  Backend trennen können. Auf der CCU bleibt es beim Login von Node-RED mit dem
  Benutzer der Zentrale, wie bisher.

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
