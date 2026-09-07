### RedMatic 9.4.2

Zwei Absturzursachen aus [#601](https://github.com/rdmtc/RedMatic/issues/601).
Wer 9.3.0 oder 9.4.0 einsetzt, sollte aktualisieren.

- **Node-RED konnte kurz nach dem Start abstürzen und wurde endlos neu
  gestartet** (`Error: socket hang up`, danach `Node-RED exited with non-zero
  exit status 1` und schließlich `Maximum Node-RED restarts exceeded`).
  Ein Schreibvorgang auf eine Systemvariable, der eintrifft, bevor die
  Variablenliste bekannt ist, wird zwischengespeichert und nachgeholt, sobald
  die Liste da ist — dabei wurde ein Fehlschlag nicht behandelt, was Node.js
  als unbehandelte Promise-Ablehnung wertet und den Prozess beendet.
  Betroffen waren vor allem größere Installationen, bei denen ReGaHSS beim
  Start unter Last steht. Behoben in **node-red-contrib-ccu 4.4.1** (vorher
  4.4.0), siehe dessen
  [Changelog](https://github.com/rdmtc/node-red-contrib-ccu/blob/master/CHANGELOG.md).

  Auslöser war eine Änderung in 4.3.0 (ausgeliefert mit RedMatic 9.3.0): die
  Erkennung „läuft direkt auf der Zentrale" greift dort wieder, wodurch die
  ReGa-Anfragen direkt an ReGaHSS auf Port 8183 gehen statt über lighttpd auf
  8181. Ein ausgelastetes ReGaHSS schließt die Verbindung dann einfach,
  während lighttpd das vorher abgefangen hat.
- **Node-RED konnte zweimal gestartet werden**, wobei die zweite Instanz mit
  `Error: port in use` abbrach. Geprüft wurde nur, ob ein Prozess namens
  `node-red` läuft — den gibt es während eines laufenden Starts noch nicht,
  nach einem Neustart der Zentrale bis zu 30 Sekunden lang. Ein bereits
  laufender Start wird jetzt erkannt und ein zweiter abgewiesen.
- Jeder Startversuch protokolliert jetzt, **welcher Prozess ihn ausgelöst
  hat** (`start requested by pid …`). Einen zweiten gleichzeitigen Start soll
  es nie geben; falls er doch vorkommt, steht die Ursache damit im Log.
- Die Liste der Commits einer Version fehlte bisher in den Release-Notes
  (`### Changes` blieb leer) — behoben.

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
