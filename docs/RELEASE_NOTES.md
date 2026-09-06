### RedMatic 9.4.0

- **RedMatic läuft auf [openccu-lite](https://github.com/hobbyquaker/openccu-lite)**, einer
  CCU-Firmware ohne ReGaHSS — mit demselben Paket, denselben Einstellungen und
  denselben Flows wie auf CCU3, RaspberryMatic und OpenCCU. Um welche Zentrale
  es sich handelt, erkennt RedMatic zur Laufzeit (`GET /api/meta/v1/version`),
  konfiguriert werden muss nichts, und ein Backup lässt sich zwischen beiden
  hin- und herschieben.
  - **Namen, Räume, Gewerke** kommen dort aus der Metadaten-API der Zentrale
    statt aus der ReGaHSS (node-red-contrib-ccu 4.4.0). Auf der Zentrale wird
    der nur lesende Token aus `/usr/local/etc/occulite/local-token` automatisch
    verwendet. Umbenennungen sind binnen einer Sekunde in den Flows, ohne
    Deploy.
  - **Systemvariablen und Programme gibt es dort nicht.** `ccu-sysvar`,
    `ccu-program`, `ccu-script` und `ccu-poll` bleiben in der Palette und in
    den Flows; sie beantworten jede Nachricht mit einer klaren Fehlermeldung,
    statt die Verbindung zu stören.
  - **Login des Editors:** die Einstellung „Benutzer der Zentrale" (bisher
    „ReGaHSS (CCU WebUI User nutzen)") nutzt auf einer CCU unverändert die
    ReGaHSS-Benutzer und auf openccu-lite die Benutzer der Zentrale.
  - **Backup-Download, Log und Selbstupdate** funktionieren dort ebenfalls: das
    Log kommt aus dem Journal, wenn es kein `/var/log/messages` gibt, und der
    Backup-Download kommt ohne `X-Sendfile` aus.
  - Details stehen im Abschnitt *openccu-lite* der
    [README](https://github.com/rdmtc/RedMatic#openccu-lite).
- **node-red-contrib-ccu 4.4.0** (vorher 4.3.0) — siehe dessen
  [Changelog](https://github.com/rdmtc/node-red-contrib-ccu/blob/master/CHANGELOG.md):
  openccu-lite-Unterstützung, dynamische Node-Konfiguration über `msg.config`,
  Räume und Gewerke im Cache des Connection-Nodes.
- **Release-Pakete:** für armv7l wird das Paket zusätzlich unter dem Namen
  `redmatic-armv7l-<version>.tar.gz` veröffentlicht (Addon-Kataloge suchen
  nach `redmatic-<uname -m>-<version>.tar.gz`); der bisherige Name
  `redmatic-<version>.tar.gz` bleibt unverändert bestehen.

### RedMatic 9.2.0

- **Update mit einem Klick:** Steht eine neue Version bereit, bietet die
  RedMatic-Einstellungsseite neben dem Hinweis jetzt den Button
  „Herunterladen und installieren" an. RedMatic lädt das Paket für die
  Zentrale von GitHub, prüft die Prüfsumme und installiert es genauso wie
  die Zusatzsoftware-Seite der CCU – mit Fortschrittsbalken für Download
  und Installation und **ohne Neustart der Zentrale**, auch auf der CCU3.
  Vorher werden freier Speicher und freie Datei-Einträge (Inodes) geprüft
  und Reste abgebrochener Installationen aufgeräumt. Node-RED ist während
  der Installation gestoppt; auf einer CCU3 dauert das rund sieben Minuten,
  auf OpenCCU unter einer Minute. Der manuelle Weg über die
  Zusatzsoftware-Seite bleibt bestehen. Wie immer gilt: vorher CCU-Backup
  und Flow-Export.
- **Editor blieb zufällig bei „Lade Plugins" / „Lade Node Kataloge" hängen**
  (401 in der Browser-Konsole): Node-RED fragt bei jedem Zugriff auf die
  Admin-API den Benutzer zum Token ab, und RedMatic hat dafür jedes Mal ein
  Skript an die ReGaHSS geschickt. Beim Laden des Editors laufen Dutzende
  Anfragen parallel, die ReGa arbeitet Skripte aber nacheinander ab – ein
  Teil der Anfragen scheiterte. Der Benutzer wird jetzt 15 Minuten
  zwischengespeichert, gleichzeitige Abfragen teilen sich einen Aufruf, und
  wenn die ReGa gerade nicht antwortet, bleibt ein bekannter Benutzer
  eingeloggt. Das Passwort wird beim Login unverändert gegen die CCU
  geprüft.

### RedMatic 9.0.1

- **Paletten-Manager fehlte nach einem Update auf OpenCCU** (#599): Nach
  einer Installation über die WebUI startete Node-RED aus dem temporären
  Installationsverzeichnis, das OpenCCU anschließend löscht. Node-RED konnte
  dann kein `npm` mehr starten und blendete „Palette verwalten" aus (bis
  zum nächsten Neustart). Node-RED startet jetzt immer aus einem festen
  Verzeichnis. Betroffene Installationen: einmal RedMatic neu starten (oder
  auf 9.0.1 aktualisieren).
- **RedMatic-Einstellungsseite zeigte „stopped"** obwohl Node-RED lief
  (#600): Die Prozessanzeige erwartete noch den Prozessnamen von Node.js 14.
  Status, Speicher und Uptime werden wieder richtig angezeigt.
- **IPv6 für Matter:** Auf der CCU3 mit Original-Firmware fehlt `eth0` nach
  dem Booten die IPv6 Link-Local-Adresse (`fe80::`). Matter-Controller
  erreichen eine Bridge nur über IPv6, deshalb legt RedMatic die Adresse
  jetzt beim Start an, falls sie fehlt (dauert etwa zwei Sekunden), und
  schreibt eine Zeile ins Log. Auf OpenCCU ist die Adresse bereits vorhanden,
  dort ändert sich nichts. Voraussetzung für
  [RedMatic-Matter](https://github.com/rdmtc/RedMatic-Matter).

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
