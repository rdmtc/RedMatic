### RedMatic 9.7.2

Stellt die Anmeldung am Node-RED-Editor auf **openccu-lite** auf den
Session-Header der Zentrale um und behebt ein Update auf openccu-lite, nach dem
RedMatic gestoppt blieb.

- **Auf openccu-lite nutzt der Node-RED-Editor jetzt den Session-Header der
  Zentrale.** openccu-lite reicht die geprüfte Sitzung an Addons im Header
  `X-Occulite-Session` weiter und entfernt vorher jeden Header dieses Namens,
  den ein Browser selbst mitschickt. RedMatic liest die Anmeldung für den Editor
  und für seine WebSocket-Verbindung daraus und muss die Namen des
  Session-Cookies nicht mehr kennen. Die Sitzung wird weiterhin bei openccu-lite
  selbst geprüft (`/api/auth/v1/state`).
- **Ältere openccu-lite-Images ohne diesen Header funktionieren weiter** über
  das Session-Cookie, wie mit 9.7.1. Auf einer CCU3 und OpenCCU bleibt es beim
  Login von Node-RED mit dem Benutzer der Zentrale, wie bisher.
- **Updates auf openccu-lite starten Node-RED nicht mehr als root.** Ein Update
  über die Addon-Seite von openccu-lite konnte RedMatic gestoppt zurücklassen:
  Das Installationsskript startete Node-RED als root außerhalb des Dienstes, in
  dem openccu-lite das Addon mit eigenem Benutzer ausführt, und dieser Start
  scheiterte an der Datei `/tmp/red-settings.json`, die diesem Benutzer gehörte.
  Stopp und Start gehen auf openccu-lite jetzt an den Dienst
  `addon-redmatic.service`. Das gilt auch für das Selbst-Update aus den
  RedMatic-Einstellungen, wenn Node-RED nach der Installation nicht läuft.
- **`/tmp/red-settings.json` wird nicht mehr geschrieben** und bei einem Update
  entfernt. Die Datei las niemand, sie enthielt aber das `credentialSecret`,
  lesbar für jeden lokalen Benutzer.
- **Die Prüfsummen der Release-Anhänge** (`.sha256`) nennen nur noch den
  Dateinamen, so dass `sha256sum -c` direkt neben dem heruntergeladenen Paket
  funktioniert.

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
