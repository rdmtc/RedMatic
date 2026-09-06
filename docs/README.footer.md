## openccu-lite

[openccu-lite](https://github.com/hobbyquaker/openccu-lite) ist eine Homematic-CCU-Firmware **ohne ReGaHSS**. RedMatic
läuft dort mit demselben Paket, denselben Einstellungen und denselben Flows wie auf einer CCU3, RaspberryMatic oder
OpenCCU. Um welche Art Zentrale es sich handelt, wird zur Laufzeit erkannt (`GET /api/meta/v1/version`); konfiguriert
werden muss nichts, und ein Backup lässt sich zwischen beiden hin- und herschieben.

**Was funktioniert**

* Node-RED selbst mit Palette-Manager, Projekten/git, Einstellungsseite samt Session-Prüfung, Backup, Log,
  Log-Upload und dem Ein-Klick-Selbstupdate.
* Alles, was die `node-red-contrib-ccu`-Nodes über die Schnittstellenprozesse (`rfd`, `hs485d`, `hmipserver`) machen:
  Werte, Kommandos, RPC-Events. Geräte-, Kanal-, Raum- und Gewerkenamen kommen statt aus der ReGaHSS aus der
  Metadaten-API der Zentrale und folgen einer Umbenennung binnen einer Sekunde. `msg.channelName`, `msg.rooms`,
  `msg.functions` und die Raum-/Gewerke-Filter behalten exakt die Form, die sie auf einer CCU haben.
* Für die Namen wird ein Token gebraucht: auf der Zentrale wird der nur lesende Token aus
  `/usr/local/etc/occulite/local-token` automatisch verwendet (RedMatic läuft dort als root), es ist also nichts
  einzustellen. Läuft Node-RED *woanders*, gehört ein auf der *Benutzer*-Seite der Zentrale erzeugter Token in das Feld
  **openccu-lite token** des Connection-Nodes.
* Der Admin-Login des Editors: die Authentifizierungs-Einstellung *Benutzer der Zentrale* nutzt auf einer CCU die
  ReGaHSS-Benutzer und auf openccu-lite die Benutzer der Zentrale (`POST /api/auth/v1/login`).

**Wofür es keinen Ersatz gibt** (aus der Portierungsanleitung von openccu-lite):

* **Systemvariablen** und **Programme**: es gibt kein ReGa-DOM. Die Nodes `ccu-sysvar`, `ccu-program` und `ccu-poll`
  bleiben in der Palette und in den Flows — sie werden akzeptiert, sie legen die Verbindung nie lahm, und jede
  Nachricht wird stattdessen mit einer klaren Fehlermeldung beantwortet.
* **`exec()` von HM-Script** — `dom.GetObject`, `system.GetSessionVarStr` und alles andere, was der `ccu-script`-Node
  schickt: nicht vorhanden, gleiche Behandlung wie oben.
* **ReGa-IDs** (`dom.GetObject(1234)`): gibt es nicht. Die Metadaten-API identifiziert Objekte über
  `<Schnittstelle>.<Adresse>`; diese Nodes arbeiten seit jeher mit der Adresse, für Flows ändert sich also nichts.
* **Servicemeldungen / Alarme** (Systemvariablen 40 und 41): nur Zustand auf Schnittstellenebene.
* **Die JSON-RPC-API der CCU-WebUI** (`/api/homematic.cgi`, `Session.login`, `Device.listAll`): nicht vorhanden.

**Auf den systemd-Produkten** von openccu-lite läuft das rc.d-Skript in einer generierten Unit `addon-redmatic.service`
(`Type=oneshot`, `RemainAfterExit=yes`, `KillMode=control-group`): `start` kehrt zurück, nachdem Node-RED in den
Hintergrund gestartet wurde, `stop` beendet es. Ein `/var/log/messages` gibt es dort nicht — Node-RED und das Addon
loggen ins Journal unter den Tags `node-red` und `redmatic` (`journalctl -t node-red -t redmatic`), das Log der
Einstellungsseite liest sie von dort. RedMatic schreibt keine PID-Datei (es findet seinen Prozess über den Namen),
hängt also nicht an einem beschreibbaren `/var/run`. Geschrieben wird: das eigene Verzeichnis
`/usr/local/addons/redmatic` (`etc`, `var`, `tmp`, `home`, `lib`, `www`), `/tmp/redmatic-update` (Zustand des
Selbstupdates), `/usr/local/tmp` (Backup-Archiv und heruntergeladene Pakete), `/etc/config/rdmtc.uuid` (die
Telemetrie-ID, wird übersprungen wenn das Verzeichnis nicht beschreibbar ist) und bei der Installation
`/usr/local/etc/config/rc.d`, `/usr/local/etc/config/lighttpd` und `/usr/local/etc/config/addons/www`.

## Lizenzen

* [RedMatic](https://github.com/rdmtc/RedMatic) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [Apache License 2.0](LICENSE)
* [RedMatic Documentation](https://github.com/rdmtc/RedMatic/wiki) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [CC BY-SA License 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
* Third-party components are listed in the SBOM files (CycloneDX) attached to each [release](https://github.com/rdmtc/RedMatic/releases); the full license texts ship inside the addon in each package's `node_modules` directory

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIEẞLICH DER GARANTIE ZUR 
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF 
BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR
ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER 
SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.
