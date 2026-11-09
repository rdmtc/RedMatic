### RedMatic 9.17.0

Koppeln mit openccu-lite im Verbindungsdialog, ein Client für Namen und
Schnittstellen: node-red-contrib-ccu 4.10.0.

- **Koppeln mit einem openccu-lite-System direkt im Verbindungs-Node.** Für
  ein Node-RED, das nicht auf dem System selbst läuft, muss kein Token mehr
  von der API-Token-Seite des Systems kopiert werden: _Pair with the system_
  fragt das System unter der eingetragenen Adresse um Zugriff, der Dialog
  zeigt einen sechsstelligen Code, ein Administrator vergleicht und bestätigt
  ihn auf der Status-Seite des Systems, danach trägt der Dialog Token und
  Zertifikats-Fingerabdruck selbst ein. Das selbstsignierte Zertifikat des
  Systems funktioniert damit ohne _Ignore invalid TLS Certificates_, ein
  anderes Zertifikat wird abgelehnt, bevor das Token gesendet wird.
- **RedMatic auf openccu-lite selbst: nichts zu tun.** Die Verbindung zum
  eigenen System richtet sich wie bisher selbst ein, der Dialog zeigt dort
  kein Koppeln.
- **Namen, Räume und Gewerke kommen von occulite-client.** Die Verbindung
  folgt den Namen des Systems über die gemeinsame Client-Bibliothek von
  openccu-lite statt über einen eigenen HTTP-Client, im gewohnten Format.
  Hat der Verbindungs-Node ein eigenes Token (wie nach dem Koppeln), bedient
  ein Client Namen und Schnittstellen – eine Verbindung zum System statt
  zwei.
- **Ein System, das beim ersten Verbindungsversuch nicht antwortet, wird
  später verbunden.** Bisher wurde die Schnittstellen-Verbindung zu
  openccu-lite nach einem gescheiterten ersten Versuch aufgegeben, obwohl das
  Log weitere Versuche ankündigte; jetzt wird nach 5 s erneut verbunden,
  wachsend bis zu einer Minute.

Node.js 24.22.2, Node-RED 5.0.9 und npm 11.21.2 wie in 9.16.1.

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
