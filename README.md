<img width="320px" src="assets/logo-w-400.png" align="left"/>

<br><br><br>

[![Current Release](https://img.shields.io/github/release/hobbyquaker/RedMatic.svg?colorB=4cc61e)](https://github.com/hobbyquaker/RedMatic/releases/latest)
[![Dependencies Status](https://david-dm.org/hobbyquaker/redmatic/status.svg)](https://david-dm.org/hobbyquaker/redmatic)
[![Build Status](https://travis-ci.org/hobbyquaker/RedMatic.svg?branch=master)](https://travis-ci.org/hobbyquaker/RedMatic)

[Node-RED](https://nodered.org/about/) als Addon für die 
[Homematic CCU3](https://www.eq-3.de/produkte/homematic/zentralen-und-gateways/smart-home-zentrale-ccu3.html) und 
[RaspberryMatic](https://github.com/jens-maus/RaspberryMatic)

<br>

Mit Node-RED und den 
[CCU Nodes für Node-RED](https://github.com/hobbyquaker/node-red-contrib-ccu) ist es auf einfache und visuelle Weise 
möglich Regeln, Automationen, Scripte und Anbindungen von externen Services und Systemen für ein Homematic System zu 
realisieren - und das weitgehend auch ohne Programmierkenntnisse. Die Node-RED Erweiterung 
[Node-RED Dashboard](https://github.com/node-red/node-red-dashboard) ermöglicht es zudem individuelle und ansprechende 
User Interfaces zu erstellen.

_RedMatic_ fasst diese Softwarekomponenten und das zur Ausführung benötigte Node.js zu einem CCU Addon zusammen, einem 
Softwarepaket, dass auf einer Homematic CCU3 oder RaspberryMatic als Zusatzsoftware komfortabel über das WebUI 
installiert werden kann. Dadurch bieten sich dann oben genannte Möglichkeiten - ohne die Notwendigkeit neben der CCU 
einen weiteren 24/7 laufenden Server zu betreiben.

_RedMatic_ ist __nur für die CCU3 und RaspberryMatic geeignet__. Auf der CCU2 kann es nicht verwendet werden.


## Schnellstart

Unter [Releases](https://github.com/hobbyquaker/RedMatic/releases) steht die `redmatic-<version>.tar.gz` Datei zum 
Download zur Verfügung. Nach der Installation des Addons über das Homematic WebUI (Systemsteuerung -> Zusatzsoftware) 
und dem darauf folgenden Reboot der CCU ist Node-RED unter `http://<ccu-addresse>/addons/red` erreichbar. Einige 
Beispiel-Flows sowie ein einfaches Dashboard sind bereits vorkonfiguriert, das Dashboard ist unter `http://<ccu-addresse>/addons/red/ui` 
erreichbar.

__Sicherheitswarnung__: Node-RED ist per default (noch) ohne Authentifizierung ereichbar. Wer den Webserver der CCU 
erreichen kann hat vollen Zugriff auf Node-RED, es erfolgt __keine Passwortabfrage__. Bis in einer späteren Version eine 
Authentifizierung an der CCU-Logikschicht implementiert ist gibt es einen 
[möglichen Workaround](https://github.com/hobbyquaker/RedMatic/wiki/Passwort) um manuell einen Passwortschutz
einzurichten.


## [Dokumentation](https://github.com/hobbyquaker/RedMatic/wiki)

* Administration
  * [Installation](https://github.com/hobbyquaker/RedMatic/wiki/Installation)
  * [Update](https://github.com/hobbyquaker/RedMatic/wiki/Update)
  * [Deinstallation](https://github.com/hobbyquaker/RedMatic/wiki/Deinstallation)
  * [Zusätzliche Nodes installieren](https://github.com/hobbyquaker/RedMatic/wiki/Node-Installation)
  * [Passwort Schutz für Node-RED einrichten](https://github.com/hobbyquaker/RedMatic/wiki/Passwort)
  * [Log-Level erhöhen für Fehleranalyse](https://github.com/hobbyquaker/RedMatic/wiki/Loglevel)
* Nutzung
  * [Node-RED Grundlagen](https://github.com/hobbyquaker/RedMatic/wiki/Node-RED)
  * [CCU Nodes](https://github.com/hobbyquaker/RedMatic/wiki/CCU-Nodes)
  * [Hilfreiche Nodes](https://github.com/hobbyquaker/RedMatic/wiki/Misc-Nodes)
  * [Flows exportieren und importieren](https://github.com/hobbyquaker/RedMatic/wiki/Flow-Export-Import)
* [Beispiel Flows](https://github.com/hobbyquaker/RedMatic/wiki/Flows)


## Support, Mitarbeit

Diese Software ist ein Hobby-Projekt ohne Gewinnerzielungsabsicht und wird kostenlos unter der MIT-Lizenz zur Verfügung 
gestellt.    
Beteiligung in jeder Form ist willkommen und gewünscht, für Feedback, Fragen, Vorschläge und 
Fehlerberichte bitte den [Issue Tracker](https://github.com/hobbyquaker/RedMatic/issues) nutzen.


## Lizenz

Copyright (c) 2018 RedMatic Contributors. All Rights reserved.

Hiermit wird unentgeltlich jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationen (die
"Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu nutzen, inklusive und ohne Ausnahme mit dem Recht, sie
zu verwenden, zu kopieren, zu verändern, zusammenzufügen, zu veröffentlichen, zu verbreiten, zu unterlizenzieren 
und/oder zu verkaufen, und Personen, denen diese Software überlassen wird, diese Rechte zu verschaffen, unter den 
folgenden Bedingungen:

Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIEẞLICH DER GARANTIE ZUR 
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF 
BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR
ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER 
SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.


#### Lizenzen enthaltener Softwaremodule

* [node-red-contrib-ccu](https://github.com/hobbyquaker/node-red-contrib-ccu) - MIT 
  * Copyright Sebastian Raff
* [Node.js](https://github.com/nodejs/node/blob/master/LICENSE) - MIT 
  * Copyright Node.js contributors
* [Node-RED](https://github.com/node-red/node-red/blob/master/LICENSE) - Apache 2.0 
  * Copyright JS Foundation and other contributors
* [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard/blob/master/LICENSE) - Apache 2.0 
  * Copyright 2016, 2018 JS Foundation and other contributors
  * Copyright 2016 IBM Corp.
  * Copyright 2015 Andrei Tatar
