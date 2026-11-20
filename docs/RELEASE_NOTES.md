### RedMatic 9.17.5

Fehlerbehebungen für openccu-lite: die Einstellungsseite nach einem Neustart,
node-red-contrib-ccu 4.10.2, und die Ports der HomeKit- und Matter-Brücken.

- **Die Einstellungsseite meldet nach Neustart, Stopp oder Start kein „Ein
  Fehler ist aufgetreten“ mehr.** Auf openccu-lite startet das System
  Node-RED als Dienst neu; die Rückmeldung „Starting Node-RED: OK“ landet
  dabei im Journal statt auf der Seite, die Seite hielt den Neustart deshalb
  für gescheitert, obwohl Node-RED wieder lief. Die Seite entscheidet jetzt
  nach dem Ergebnis des Befehls. Auf einer CCU ändert sich nur eins: das
  Stoppen eines bereits gestoppten Node-RED gilt nicht mehr als Fehler.
- **node-red-contrib-ccu 4.10.2: openccu-lite wird auch ohne Haken bei
  ReGaHSS erkannt.** War im Verbindungs-Node ReGaHSS nicht angehakt, wurden
  die Schnittstellen direkt mit Callbacks statt über das System verbunden und
  keine Namen geladen. Auf openccu-lite ist der Haken jetzt ohne Wirkung:
  Namen und Schnittstellen kommen in jedem Fall vom System.
- **node-red-contrib-ccu 4.10.2: der Home-Assistant-Node wartet nicht mehr
  bis zu fünf Minuten** („waiting for CCU“) auf Gerätebeschreibungen, die nie
  kommen (Kanäle ohne Werte, abgelehnte Beschreibungen, fehlende Geräte).
- **openccu-lite: Ports für HomeKit- und Matter-Brücken.** RedMatic meldet
  dem System TCP 51800 bis 51899 für die HomeKit-Brücken (RedMatic-HomeKit;
  jede Brücke braucht in Node-RED einen eigenen Port aus diesem Bereich) und
  UDP 5540 für die Matter-Brücke (RedMatic-Matter). Unter der Firewall von
  openccu-lite lassen sie sich auf der Seite Zusatzsoftware freigeben und
  bleiben geschlossen, bis sie geöffnet werden; ältere Versionen von
  openccu-lite zeigen vom HomeKit-Bereich nur den ersten Port. mDNS braucht
  keine Freigabe.

Seit 9.17.0 kamen automatisch node-red-contrib-ccu 4.10.1 (ein Token nur für
Namen verliert auf openccu-lite keine Ereignisse und Befehle mehr,
rdmtc/node-red-contrib-ccu#189, @reini12345), Node.js 24.22.3, Node-RED 5.0.10
und npm 11.21.3.

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
