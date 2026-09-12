### RedMatic 9.7.3

Stellt auch die RedMatic-Einstellungen auf **openccu-lite** auf den
Session-Header der Zentrale um und lässt einen Start, der an fehlenden Rechten
scheitert, den eigentlichen Grund nennen.

- **Auf openccu-lite nutzen die RedMatic-Einstellungen jetzt den
  Session-Header der Zentrale.** Wie der Node-RED-Editor seit 9.7.2 lesen jetzt
  auch die Einstellungsseite und ihre Aktionen (Konfiguration, Start und Stopp,
  Update, Log, Backup) die geprüfte Sitzung aus dem Header
  `X-Occulite-Session`, den openccu-lite an Addons weiterreicht. Die Sitzung
  wird bei openccu-lite selbst geprüft (`/api/auth/v1/state`). Die Seite braucht
  damit keine Sitzungsnummer (`?sid=`) mehr in ihrer Adresse.
- **Ältere openccu-lite-Images ohne diesen Header funktionieren weiter** mit
  `?sid=` in der Adresse, wie bisher. Auf einer CCU3 und OpenCCU ändert sich
  nichts: Dort prüft weiter die ReGa die Sitzung, und ein Header, den ein
  Browser selbst mitschickt, wird nicht beachtet.
- **Ein Start, der an fehlenden Rechten scheitert, nennt jetzt den Grund.**
  RedMatic legt beim Start die Sperre `var/start.lock` an, damit Node-RED nicht
  zweimal startet. Konnte dieses Verzeichnis nicht angelegt werden, etwa weil
  `var/` direkt nach einem Update auf openccu-lite noch root gehörte, meldete
  RedMatic „another start holds the lock“, als liefe schon ein anderer Start.
  Jetzt steht der eigentliche Fehler im Log, zum Beispiel
  `cannot create /usr/local/addons/redmatic/var/start.lock: permission denied
  (owner root, running as addon-redmatic)`. Eine gehaltene oder verwaiste Sperre
  wird behandelt wie bisher. Die Besitzrechte selbst werden auf der Seite von
  openccu-lite korrigiert.

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
