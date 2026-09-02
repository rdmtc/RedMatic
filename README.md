<img height="112px" src="assets/redmatic5-compact.png" align="left"/>

<br>

[![Current Release](https://img.shields.io/github/release/rdmtc/RedMatic.svg?colorB=4cc61e)](https://github.com/rdmtc/RedMatic/releases/latest)
[![Installs](https://telemetry.redmatic.de/total.svg)](https://telemetry.redmatic.de/#36500)


**[Node-RED](https://nodered.org/about/) als Addon für die 
[Homematic CCU3](https://www.homematic-ip.com/produkte/detail/smart-home-zentrale-ccu3.html) und 
[OpenCCU](https://github.com/jens-maus/OpenCCU)**
<br><br>
<sub>[Click here for 🇬🇧🇺🇸 english readme](README.en.md)</sub>
### [🚀 Schnellstart](#voraussetzungen)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[📚 Dokumentation](https://github.com/rdmtc/RedMatic/wiki)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[📦 Download](https://github.com/rdmtc/RedMatic/releases/latest)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[🚑 Support](#support-mitarbeit)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[👮 Lizenzen](#lizenzen)
___

> **⚠️ RedMatic 9:** RedMatic wird radikal verschlankt und modernisiert
> (Node.js 24, Node-RED 5). Ab Version 9 ist nur noch
> [node-red-contrib-ccu](https://github.com/rdmtc/node-red-contrib-ccu)
> vorinstalliert — alle weiteren Nodes (z.&nbsp;B. Dashboard, HomeKit)
> werden bei Bedarf über den Node-RED Paletten-Manager installiert.
> Der RedMatic-Paketmanager und die RedMatic-WebApp sind deprecated und
> entfallen ersatzlos.
> **Bekannte und akzeptierte Einschränkung:** npm-Pakete bzw. Nodes mit
> binären (nativen) Abhängigkeiten können auf der CCU **nicht**
> installiert werden — auf der CCU gibt es keine Compiler-Toolchain,
> und vorkompilierte Binaries werden nicht mehr mitgeliefert.


_RedMatic_ fasst mehrere Softwarekomponenten zu einem CCU Addon zusammen, einem Softwarepaket, das auf einer Homematic CCU3 oder RaspberryMatic als Zusatzsoftware komfortabel über das WebUI installiert werden kann.

Die Grundlage bildet [Node-RED](https://nodered.org/about/) mit den [CCU Nodes für Node-RED](https://github.com/rdmtc/node-red-contrib-ccu). Hiermit ist es auf einfache und visuelle Weise möglich Regeln, Automationen, Scripte und Anbindungen von externen Services und Systemen für ein Homematic System zu realisieren - und das weitgehend auch ohne Programmierkenntnisse. Im [Wiki](https://github.com/rdmtc/RedMatic/wiki) gibt es weitere Informationen zu Node-RED und einige Anwendungsbeispiele (sogenannte _Flows_).

Die Einrichtung und der Betrieb von _RedMatic_ ist sehr benutzerfreundlich, es bedarf keiner Linux-Kenntnisse und es müssen keine Konfigurationsdateien bearbeitet werden. 

Für die Visualisierung und Steuerung sind [RedMatic WebApp](https://github.com/rdmtc/RedMatic-WebApp) und 
[Node-RED Dashboard](https://github.com/node-red/node-red-dashboard) enthalten. _RedMatic WebApp_ ist eine
Bedienoberfläche die ohne weitere Konfiguration sofort genutzt werden kann um das Homematic System mit dem PC oder Mobilgeräten zu steuern (vergleichbar mit _WebMatic_ oder _Yahui_).
_Node-RED Dashboard_ ist ein konfigurierbares User Interface, kann mehr Möglichkeiten als die _RedMatic WebApp_ bieten, ist aber mit Konfigurationsaufwand verbunden. Beispiel Screenshots: [RedMatic WebApp](https://github.com/rdmtc/RedMatic/wiki/Webapp), [Node-RED Dashboard](https://github.com/rdmtc/RedMatic/wiki/Dashboard-Screenshots).

Außerdem ist es mit der ebenfalls enthaltenen Erweiterung [RedMatic HomeKit](https://github.com/rdmtc/RedMatic/wiki/Homekit) ohne weiteren Installations- oder Einrichtungsaufwand möglich Homematic Geräte in Apple HomeKit einzubinden und über Siri und mit HomeKit-Apps anzusteuern. Darüberhinaus können auch beliebige andere an Node-RED angebundene Systeme und Kameras in HomeKit integriert werden.

Eine Anbindung der CCU an einen [MQTT](https://github.com/rdmtc/RedMatic/wiki/Flow-MQTT) Broker mit komfortabel konfigurierbarer Topic- und Payload-Struktur wird durch einen speziellen Node vereinfacht.

Eine große und aktive Community rund um Node-RED hat zudem eine 
[Bibliothek von tausenden zusätzlichen Nodes](https://flows.nodered.org/?type=node&num_pages=1) geschaffen die auf 
einfache Weise [installiert werden können](https://github.com/rdmtc/RedMatic/wiki/Node-Installation) und es 
ermöglichen spezielle Automatismen zu implementieren und diverse weitere Services und Systeme komfortabel anzubinden - wie z.B. KNX, Xiaomi/Aqara, Loxone, Somfy Tahoma, Velux KLF200, Home Connect Haushaltsgeräte, den Logitech Harmony Hub, verschiedene Smart TVs und AV-Receiver, Sonos, Netatmo, Hue/Lightify/Tradfri, Deconz, ArtNET/DMX, DALI, Modbus, Amazon Alexa, Google Home, diverse Datenbanken wie z.B. InfluxDB oder MySQL, Webservices zur Abfrage von beispielsweise Wetterdaten und vieles mehr.

_RedMatic_ kann damit - insbesondere auch für diejenigen die neben der CCU keinen weiteren Server betreiben möchten - eine Alternative zu einem "ausgewachsenen" Smart Home System wie z.B. Home Assistant oder ioBroker darstellen. Mit RedMatic-HomeKit steht des weiteren eine Alternative zum Betrieb einer Homebridge zur Verfügung die insbesondere bei der Integration von Homematic Geräten in HomeKit einige Vorteile bietet.
Auch eine Koexistenz mit vorhandener anderer Smart Home Software kann sinnvoll sein, _RedMatic_ eignet sich z.B. auch sehr gut als Schnittstelle um eine Homematic CCU an ein übergeordnetes System via MQTT anzubinden. 
Nicht zuletzt kann _RedMatic_ auch als stabile und mit wesentlich mehr Möglichkeiten aufwartende Alternative oder Ergänzung zu den WebUI-Programmen und Scripten der CCU Logikschicht "Rega" dienen.


## Voraussetzungen

_RedMatic_ ist nur für die CCU3, piVCCU3 und die RaspberryMatic Varianten _rpi2_, _rpi3_, _rpi4_, _tinkerboard_, _intelnuc_ und _ova_ geeignet. 

Auf der CCU1, CCU2 und der RaspberryMatic Variante _rpi0_ kann _RedMatic_ nicht verwendet werden. 


## Schnellstart

Unter [Releases](https://github.com/rdmtc/RedMatic/releases/latest) steht die Datei `redmatic-<version>.tar.gz` 
zum Download zur Verfügung. Nach der Installation des Addons über das Homematic WebUI (Systemsteuerung -> 
Zusatzsoftware) und dem darauf folgenden Reboot der CCU ist Node-RED unter `http://<ccu-addresse>/addons/red` 
erreichbar. Bei der Installation ist Geduld erforderlich, es kann bis zu ~10 Minuten dauern. Einige Beispiel-Flows sowie ein einfaches Dashboard sind bereits vorkonfiguriert, das Dashboard ist unter `http://<ccu-addresse>/addons/red/ui` erreichbar.


## Support, Mitarbeit

Für Feedback jeglicher Art, Fragen, Vorschläge und Wünsche bitte das [Diskussionsforum](https://github.com/rdmtc/RedMatic/discussions) nutzen. Für Bug Reports bitte den [Issue Tracker](https://github.com/rdmtc/RedMatic/issues) nutzen. 

Beteiligung in jeder Form ist willkommen und gewünscht, insbesondere sind alle Nutzer aufgefordert die [Liste erfolgreich getesteter Nodes](https://github.com/rdmtc/RedMatic/wiki/Erfolgreich-getestete-Nodes) zu ergänzen, Beispiel-Flows zu veröffentlichen und an der Verbesserung und Erweiterung der [Dokumentation](https://github.com/rdmtc/RedMatic/wiki) mitzuarbeiten.

Es werden keine Spenden angenommen, ich würde mich jedoch darüber freuen wenn der erfolgreiche Einsatz dieser Software mit einem Github Sternchen ⭐️ honoriert wird (Github Account ist schnell angelegt! ;-)

## Dokumentation

* [FAQ - Häufig gestellte Fragen](https://github.com/rdmtc/RedMatic/wiki/Faq)
* Administration
  * [Installation](https://github.com/rdmtc/RedMatic/wiki/Installation)
  * [Update](https://github.com/rdmtc/RedMatic/wiki/Update)
  * [Backup](https://github.com/rdmtc/RedMatic/wiki/Backup)
  * [Firewall](https://github.com/rdmtc/RedMatic/wiki/Firewall)
  * [Context Storage Konfigurieren](https://github.com/rdmtc/RedMatic/wiki/Context-Storage)
  * [Passwort Schutz für Node-RED einrichten](https://github.com/rdmtc/RedMatic/wiki/Passwort)
  * [Sicherheits-Hinweise](https://github.com/rdmtc/RedMatic/wiki/Sicherheit)
  * [Zusätzliche Nodes installieren](https://github.com/rdmtc/RedMatic/wiki/Node-Installation)
  * [Erfolgreich mit RedMatic getestete Nodes](https://github.com/rdmtc/RedMatic/wiki/Erfolgreich-getestete-Nodes) - bitte diese Liste ergänzen!
  * [Log-Level erhöhen für Fehleranalyse](https://github.com/rdmtc/RedMatic/wiki/Loglevel)
  * [Safe Mode](https://github.com/rdmtc/RedMatic/wiki/Safe-Mode)
  * [Deinstallation](https://github.com/rdmtc/RedMatic/wiki/Deinstallation)
* Nutzung
  * [Node-RED Grundlagen](https://github.com/rdmtc/RedMatic/wiki/Node-RED)
  * [CCU Nodes](https://github.com/rdmtc/RedMatic/wiki/CCU-Nodes)
  * [Tipps](https://github.com/rdmtc/RedMatic/wiki/Tipps)
  * [Flows exportieren](https://github.com/rdmtc/RedMatic/wiki/Flow-Export)
  * [Flows importieren](https://github.com/rdmtc/RedMatic/wiki/Flow-Import)
* Spezielle Nodes und Erweiterungen
  * [node-red-contrib-zigbee](https://github.com/rdmtc/RedMatic/wiki/ZigBee) - Einbindung von Zigbee Geräten über USB-Interface (z.B. Xiaomi Aqara, Philips Hue, IKEA Tradfri, Osram/Ledvance Lightify, Müller Licht Tint, ...)
  * [RedMatic-HomeKit](https://github.com/rdmtc/RedMatic/wiki/Homekit) - Anbindung an Apple HomeKit, Steuerung via Siri und Home.app
  * [RedMatic-WebApp](https://github.com/rdmtc/RedMatic/wiki/Webapp)
  * [Node-RED Dashboard](https://github.com/rdmtc/RedMatic/wiki/Dashboard-Screenshots)
  * [node-red-contrib-sun-position](https://github.com/rdmtc/node-red-contrib-sun-position) Zeit- und Sonnenstandabhängige Funktionen, Komfortable Beschattungssteuerung
  * [node-red-contrib-signal-client](https://github.com/rdmtc/RedMatic/wiki/node-red-contrib-signal-client)

* Beispiel Flows
  * [Kostenlose Alexa (und Google) Anbindung](https://github.com/rdmtc/RedMatic/wiki/Node-RED-Smart-Home-Control)
  * [Sprachausgabe über Alexa/Echo](https://github.com/rdmtc/RedMatic/wiki/Sprachausgabe-mit-node-red-contrib-alexa-remote2)
  * [CCU an MQTT anbinden](https://github.com/rdmtc/RedMatic/wiki/Flow-MQTT)
  * [Anzahl und Liste offener Fenster im Dashboard anzeigen](https://github.com/rdmtc/RedMatic/wiki/Flow-Windows)
  * [Hue Lampen mit langem Tastendruck dimmen](https://github.com/rdmtc/RedMatic/wiki/Flow-Hue)
  * [UNREACH Meldung unterdrücken](https://github.com/rdmtc/RedMatic/wiki/Flow-Unreach)
  * [STICKY_UNREACH Meldungen bestätigen und zählen](https://github.com/rdmtc/RedMatic/wiki/Flow-Sticky)
  * [Anzeigen und Setzen von Systemvariablen im Dashboard](https://github.com/rdmtc/RedMatic/wiki/Flow-Sysvar-Dashboard)
  * [DutyCycle Graph im Dashboard anzeigen](https://github.com/rdmtc/RedMatic/wiki/Flow-DutyCycle)
  * [JSON Daten von Webservice abfragen und in Systemvariable schreiben](https://github.com/rdmtc/RedMatic/wiki/Flow-HTTP-Client)
  * [Inhalt einer Systemvariablen über einfachen Webservice bereitstellen](https://github.com/rdmtc/RedMatic/wiki/Flow-HTTP-Server)
  * [Per Pushover benachrichtigen wenn Fenster länger als 10 Minuten offen ist](https://github.com/rdmtc/RedMatic/wiki/Flow-Window-Pushover)
  * [CPU Auslastung als Graph im Dashboard anzeigen](https://github.com/rdmtc/RedMatic/wiki/Flow-CPU-Usage)
  * [Schnelles Blinken der LED im Offline-Betrieb unterbinden](https://github.com/rdmtc/RedMatic/wiki/Flow-Offline-LED)
  * [Bidcos-Wired Dimmer mit Bidcos-RF Tasten steuern](https://github.com/rdmtc/RedMatic/wiki/Flow-Wired-Dimmer)
  * [Discovery von Geräten mit Echo Dot v3 und node-red-contrib-amazon-echo](https://github.com/rdmtc/RedMatic/wiki/Discovery-von-Geräten-mit-Echo-Dot-v3-und-node-red-contrib-amazon-echo)
* Von Usern bereitgestellte Flows
  * [Licht mittels Tastendruck aus und einschalten](https://github.com/rdmtc/RedMatic/wiki/Flow-simple-toggle-light)
  * [Licht schalten mit einem Dashboard button](https://github.com/rdmtc/RedMatic/wiki/combine-logic-node-for-toggle-state)
  * [Textausgabe mittels Chromecast oder Google Home](https://github.com/rdmtc/RedMatic/wiki/Flow-speak-text-on-Google)
  * [Berechnung von Feiertagen](https://github.com/rdmtc/RedMatic/wiki/Flow-to-calculate-german-holidays)
  * [Funktion nur innerhalb einer bestimmten Uhr-Zeit ausführen](https://github.com/rdmtc/RedMatic/wiki/Flow-within-time)
  * [Fehlerüberwachung der CCU](https://github.com/rdmtc/RedMatic/wiki/Flow-Syslog)
  * [Integration Weatherman (JSON, httpStatic, SteelSeries Gauges)](https://github.com/Sineos/node-red-contrib-weatherman/blob/master/README_DE.md)
  * [Systeminformationen der CCU Zentrale](https://github.com/Sineos/redmatic-flow-sysinfo/blob/master/README_DE.md)
  * [Werte in InfluxDB speichern](https://github.com/rdmtc/RedMatic/wiki/Flow-Influx)
  * [Diverse Flows von](https://github.com/Sineos/redmatic-flow-misc) [@Sineos](https://github.com/Sineos/)
  * [Harmony Activities mit Homekit nutzen](https://github.com/rdmtc/RedMatic/wiki/Harmony-Activities-mit-Homekit-nutzen)
  * [Homekit: Kamera einbinden](https://github.com/rdmtc/RedMatic/wiki/Homekit-Kamera-einbinden)
  * [Homekit: Öffnen einer Tür mit Keymatic HM-Sec-Key-(S)](https://github.com/rdmtc/RedMatic/wiki/Open-Workaround-für-HM-Sec-Key)
  * [Nachrichten an Telegram versenden](https://github.com/rdmtc/RedMatic/wiki/Nachrichten-an-Telegram-versenden)
  * [Dashbuttons ohne zusätzliche Nodes auswerten](https://github.com/holgerimbery/redmatic_flows/blob/master/dashbutton_auswerten/README.md)
  * [Monitoring der Batteriespannung von Aktoren (hier: HM-CC-RT-DN)](https://github.com/holgerimbery/redmatic_flows/blob/master/battery_monitoring/README.md)
  * [Datenpunktstatus von mehreren Geraeten gleichzeitig abfragen](https://github.com/rdmtc/RedMatic/wiki/flow-geraete-abfragen)
  * [Rollladen und Jalousiesteuerung](https://github.com/rdmtc/RedMatic/wiki/Rollladen-und-Jalousiesteuerung)
  * [Zwischen zwei Zeitpunkten jede halbe Stunde einen Inject generieren](https://github.com/rdmtc/RedMatic/wiki/Zwischen-zwei-Zeitpunkten-jede-halbe-Stunde-einen-Inject-generieren)
  * [Wetterdaten mittels OpenWeatherMap in ein CUxD Device übertragen](https://github.com/rdmtc/RedMatic/wiki/Openweathermap)
  * [Schalter mit Statusanzeige](https://github.com/rdmtc/RedMatic/wiki/Schalter-mit-Status-als-Badge-Ersatz)
  * [Pillenförmige-Schalter sychron mit globaler Variable](https://github.com/rdmtc/RedMatic/wiki/Pillenförmige-Schalter-synchron-mit-globalen-Variablen)
  * [Zusätzliche Wettericons für UI-Dashboard in Redmatic verfügbar machen](https://github.com/rdmtc/RedMatic/wiki/Zusätzliche-Wettericons-für-UI-Dashboard-in-Redmatic-verfügbar-machen)
  * [E3DC Anbindung per Modbus-TCP](https://github.com/rdmtc/RedMatic/wiki/E3DC-Anbindung-per-Modbus-TCP)
  * [Steuerung von Miele Geräten](https://github.com/rdmtc/RedMatic/wiki/Steuerung-Miele)
  * [Subflow für Enigma2 Receiver](https://github.com/Matten-Matten/node-red-enigma2-flow)
  * [INSTAR Kameras anbinden](https://wiki.instar.de/Erweitert/Homematic_CCU3_und_RedMatic/)
  * [Shelly Relais zu Schalten von Leuchten](https://github.com/rdmtc/RedMatic/wiki/Shelly-Relais-zum-Schalten-von-Leuchten)
  * [Waschmaschine fertig? Waschmaschine mit HmIP-PSM Messsteckdose monitoren](https://github.com/rdmtc/RedMatic/wiki/Waschmaschine-fertig%3F-Waschmaschine-mit-hmip-psm-Messsteckdose-monitoren)
  * [SMS mit SIM800 Modul: SMS senden & empfangen](https://github.com/Matten-Matten/SIM800-NodeRed)
  * [BMW Connect Status in Dashboard und Apple HomeKit](https://github.com/rdmtc/RedMatic/wiki/BMW-Connect-Status-in-Dashboard-und-als-Apple-Homekit-Objekt)
  * [EgiGeoZone Geofence Subflow: An/abmelden von Geozonen, in Redmatic empfangen](https://github.com/Matten-Matten/EgiGeoZone-Geofence-Subfow/blob/main/README.md)
  * [Xiaomi / Roborock S1-S6 in Dashboard](https://github.com/rdmtc/RedMatic/wiki/Xiaomi-Staubsauger-in-Dashboard#roborock-oder-xiaomi-staubsauger-s1-s6-im-dashboard)
  * [Anrufsperre über Fritzbox für eingehende Anrufe](https://github.com/rdmtc/RedMatic/wiki/Anrufsperre-%C3%BCber-Fritzbox)
  * [AIO NEO Popup Subflow (öffnen von AIO-NEO Popups auf Tablet oder Smartphone)](https://github.com/Matten-Matten/AIO-NEO-Pop-up-Subflow)

* Sonstiges
  * [Berichterstattung, Blogbeiträge, Videos über RedMatic](https://github.com/rdmtc/RedMatic/wiki/Berichterstattung)
  * [Node-RED Link Sammlung](https://github.com/rdmtc/RedMatic/wiki/Links)
  * [Telemetrie](https://github.com/rdmtc/RedMatic/wiki/Telemetry)
  * [Danksagungen](https://github.com/rdmtc/RedMatic/wiki/Danke)
  * [Change History](https://github.com/rdmtc/RedMatic/wiki/CHANGE_HISTORY)




## Lizenzen

* [RedMatic](https://github.com/rdmtc/RedMatic) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [Apache License 2.0](LICENSE)
* [RedMatic Documentation](https://github.com/rdmtc/RedMatic/wiki) © 2018-2026 Sebastian Raff and RedMatic Contributors, licensed under [CC BY-SA License 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
* Third-party components are listed in the SBOM files (CycloneDX) attached to each [release](https://github.com/rdmtc/RedMatic/releases); the full license texts ship inside the addon in each package's `node_modules` directory

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIEẞLICH DER GARANTIE ZUR 
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF 
BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR
ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER 
SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.
