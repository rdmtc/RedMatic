<img width="320px" src="assets/logo-w-400.png" align="left"/>

<br><br><br>

[![Current Release](https://img.shields.io/github/release/hobbyquaker/RedMatic.svg?colorB=4cc61e)](https://github.com/hobbyquaker/RedMatic/releases/latest)
[![Dependencies Status](https://david-dm.org/hobbyquaker/redmatic/status.svg)](https://david-dm.org/hobbyquaker/redmatic)
[![Build Status](https://travis-ci.org/hobbyquaker/RedMatic.svg?branch=master)](https://travis-ci.org/hobbyquaker/RedMatic)

[Node-RED](https://nodered.org/about/) als Addon für die 
[Homematic CCU3](https://www.eq-3.de/produkte/homematic/zentralen-und-gateways/smart-home-zentrale-ccu3.html) und 
[RaspberryMatic](https://github.com/jens-maus/RaspberryMatic)

<br>

_RedMatic_ fasst mehrere Softwarekomponenten zu einem CCU Addon zusammen, einem Softwarepaket, dass auf einer Homematic 
CCU3 oder RaspberryMatic als Zusatzsoftware komfortabel über das WebUI installiert werden kann.

Die Grundlage bildet [Node-RED](https://nodered.org/about/) mit den 
[CCU Nodes für Node-RED](https://github.com/hobbyquaker/node-red-contrib-ccu). Hiermit ist es auf einfache, visuelle 
Weise möglich Regeln, Automationen, Scripte und Anbindungen von externen Services und Systemen für ein Homematic System 
zu realisieren - und das weitgehend auch ohne Programmierkenntnisse. Im 
[Wiki](https://github.com/hobbyquaker/RedMatic/wiki) gibt es weitere Informationen zu Node-RED und einige 
Anwendungsbeispiele (sogenannte _Flows_).

Außerdem ist die Node-RED Erweiterung [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard) enthalten, 
mit der ansprechende User Interfaces für Mobilgeräte und den Browser erstellt werden können
([Beispiel Screenshots](https://github.com/hobbyquaker/RedMatic/wiki/Dashboard-Screenshots)).

_RedMatic_ ist __nur für die CCU3 und RaspberryMatic geeignet__. Auf der CCU2 kann es nicht verwendet werden. Bisher ist
_RedMatic_ mangels Verfügbarkeit der CCU3 Firmware nur auf RaspberryMatic getestet, es ist nicht auszuschließen, dass 
noch Anpassungen an die CCU3 Firmware vorgenommen werden müssen.


## Schnellstart

Unter [Releases](https://github.com/hobbyquaker/RedMatic/releases/latest) steht die Datei `redmatic-<version>.tar.gz` 
zum Download zur Verfügung. Nach der Installation des Addons über das Homematic WebUI (Systemsteuerung -> 
Zusatzsoftware) und dem darauf folgenden Reboot der CCU ist Node-RED unter `http://<ccu-addresse>/addons/red` 
erreichbar. Einige Beispiel-Flows sowie ein einfaches Dashboard sind bereits vorkonfiguriert, das Dashboard ist unter 
`http://<ccu-addresse>/addons/red/ui` erreichbar.


## Dokumentation

Die [Dokumentation](https://github.com/hobbyquaker/RedMatic/wiki) ist im Wiki zu finden.


## Support, Mitarbeit

Für Feedback jeglicher Art, Fragen, Vorschläge, Wünsche und Fehlerberichte bitte den 
[Issue Tracker](https://github.com/hobbyquaker/RedMatic/issues) nutzen. 

Beteiligung in jeder Form ist willkommen und gewünscht, insbesondere sind alle Nutzer aufgefordert an der Verbesserung
und Vervollständigung der [Dokumentation im Wiki](https://github.com/hobbyquaker/RedMatic/wiki) mitzuarbeiten, 
die [Liste erfolgreich getesteter Nodes](https://github.com/hobbyquaker/RedMatic/wiki/Erfolgreich-getestete-Nodes) zu 
ergänzen und Beispiel-Flows zu veröffentlichen.

Es werden keine Spenden angenommen.


## Lizenz

[Apache 2.0 - Copyright (c) 2018 Sebastian Raff](LICENSE)

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIEẞLICH DER GARANTIE ZUR 
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF 
BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR
ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER 
SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.

