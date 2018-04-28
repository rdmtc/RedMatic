# ccu-addon-node-red

[![Build Status](https://travis-ci.org/hobbyquaker/ccu-addon-node-red.svg?branch=master)](https://travis-ci.org/hobbyquaker/ccu-addon-node-red)

> Node-RED Addon für die Homematic CCU3 und RaspberryMatic

[Node-RED](https://nodered.org/about/) ist eine Nachrichtenfluß-basierte, visuelle Programmierumgebung für das Internet 
der Dinge. Node-RED wird seit 2013 von [IBM Emerging Technology](https://emerging-technology.co.uk/technologies/) 
entwickelt und steht als kostenlose Open Source Software unter dem Dach der [JS Foundation](https://js.foundation/) zur 
Verfügung. Node-RED kann durch zusätzliche [Node(-Sammlungen)](https://flows.nodered.org) erweitert werden, eine große 
und aktive Community hat Stand Heute bereits weit über 1000 Nodes entwickelt.

Mit diesem Addon ist es auf einfache und komfortable Weise möglich Regeln, Automationen, Scripte und Anbindungen von 
externen Services und Systemen für ein Homematic System zu realisieren - ohne die Notwendigkeit neben der CCU einen 
weiteren 24/7 laufenden Server zu betreiben.

Darüber hinaus beinhaltet dieses Addon auch [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard) womit
webbasierte User Interfaces erstellt werden können. Zur Anbindung an die Schnittstellenprozesse und die Logikschicht der 
CCU ist [node-red-contrib-ccu](https://github.com/hobbyquaker/node-red-contrib-ccu) im Addon enthalten. 


## Installation

#### Download

Unter [Releases](https://github.com/hobbyquaker/ccu-addon-node-red/releases) ist das Addon Paket zum Download verfügbar.


## Schnellstart

Nach der Installation des Addons über das Homematic WebUI (Systemsteuerung -> Zusatzsoftware) und dem darauf folgenden 
Reboot der CCU ist Node-RED unter `http://<ccu-addresse>/addons/red` erreichbar. Einige Beispiel-Flows sowie ein 
einfaches Dashboard sind bereits vorkonfiguriert, das Dashboard ist unter `http://<ccu-addresse>/addons/red/ui` 
erreichbar.


## Dokumentation

Die Dokumentation der CCU Nodes ist in Node-RED selbst verfügbar. Weitere Beispielflows sind im 
[node-red-contrib-ccu Wiki](https://github.com/hobbyquaker/node-red-contrib-ccu/wiki) zu finden.

Zu Node-RED im allgemeinen gibt es unzählige Tutorials, Dokumenationen und Youtube Videos, auch in Deutscher Sprache.


## Hinweise

* __Sicherheitswarnung__: Node-RED ist (noch) ohne Authentifizierung ereichbar. Wer den Webserver der CCU erreichen
kann hat vollen Zugriff auf Node-RED, es erfolgt keine Passwortabfrage.
* Nicht alle verfügbaren Node-RED Nodes können über im Node-RED UI über "Manage palette" installiert werden. Die 
Installation von Addons die Binärmodule compilieren müssen ist nicht möglich. Das betrifft u.A. Nodes die Zugriff auf 
Hardware benötigen (z.B. Bluetooth).


## Support, Mitarbeit

Dieses Software ist ein Hobby-Projekt ohne Gewinnerzielungsabsichten und wird kostenlos unter der MIT-Lizenz zur
Verfügung gestellt. Beteiligung in jeder Form ist willkommen und gewünscht, für Fragen, Vorschläge, Bug-Reports zu den
CCU Nodes bitte den [Issue Tracker](https://github.com/hobbyquaker/node-red-contrib-ccu/issues) nutzen.


## Lizenzen

* ccu-addon-node-red - MIT (c) Sebastian Raff
* [node-red-contrib-ccu]() - MIT (c) Sebastian Raff
* [Node-RED](https://github.com/node-red/node-red/blob/master/LICENSE) - Apache 2.0 Copyright JS Foundation and other 
contributors
* [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard/blob/master/LICENSE) - Apache 2.0 Copyright 
2016,2018 JS Foundation and other contributors, Copyright 2016 IBM Corp., Copyright 2015 Andrei Tatar