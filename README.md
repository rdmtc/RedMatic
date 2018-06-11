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
realisieren - und das weitgehend auch ohne Programmierkenntnisse. Im 
[Wiki](https://github.com/hobbyquaker/RedMatic/wiki) gibt es weitere Informationen zu Node-RED und einige Beispiel-Flows
mit Screenshots.    
Die Node-RED Erweiterung [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard) ermöglicht es zudem 
ansprechende User Interfaces für Mobilgeräte und den Browser zu erstellen 
([Beispiel Screenshots](https://github.com/hobbyquaker/RedMatic/wiki/Dashboard-Screenshots)).

_RedMatic_ fasst diese Softwarekomponenten und das zur Ausführung benötigte Node.js zu einem CCU Addon zusammen, einem 
Softwarepaket, dass auf einer Homematic CCU3 oder RaspberryMatic als Zusatzsoftware komfortabel über das WebUI 
installiert werden kann. Dadurch bieten sich dann oben genannte Möglichkeiten - ohne die Notwendigkeit neben der CCU 
einen weiteren 24/7 laufenden Server zu betreiben.

_RedMatic_ ist __nur für die CCU3 und RaspberryMatic geeignet__. Auf der CCU2 kann es nicht verwendet werden. Stand 
heute ist RedMatic mangels Verfügbarkeit der CCU3 nur auf RaspberryMatic getestet, es ist nicht auszuschließen dass
noch Anpassungen für die CCU3 vorgenommen werden müssen.


## Schnellstart

Unter [Releases](https://github.com/hobbyquaker/RedMatic/releases) steht die `redmatic-<version>.tar.gz` Datei zum 
Download zur Verfügung. Nach der Installation des Addons über das Homematic WebUI (Systemsteuerung -> Zusatzsoftware) 
und dem darauf folgenden Reboot der CCU ist Node-RED unter `http://<ccu-addresse>/addons/red` erreichbar. Einige 
Beispiel-Flows sowie ein einfaches Dashboard sind bereits vorkonfiguriert, das Dashboard ist unter `http://<ccu-addresse>/addons/red/ui` 
erreichbar.


## Dokumentation

Die Dokumentation ist im [Wiki](https://github.com/hobbyquaker/RedMatic/wiki) zu finden.


## Mitarbeit

Beteiligung in jeder Form ist willkommen und gewünscht, für Feedback, Fragen, Vorschläge und 
Fehlerberichte bitte den [Issue Tracker](https://github.com/hobbyquaker/RedMatic/issues) nutzen. 


## Lizenz

[Apache 2.0 - Copyright (c) 2018 Sebastian Raff](LICENSE)

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
