# ccu-addon-node-red

[![Build Status](https://travis-ci.org/hobbyquaker/ccu-addon-node-red.svg?branch=master)](https://travis-ci.org/hobbyquaker/ccu-addon-node-red)
[![Current Release](https://img.shields.io/github/release/hobbyquaker/ccu-addon-node-red.svg)](https://github.com/hobbyquaker/ccu-addon-node-red/releases/latest)
[![Total Downloads](https://img.shields.io/github/downloads/hobbyquaker/ccu-addon-node-red/total.svg)]()

> Node-RED als Addon für die Homematic CCU3 und RaspberryMatic

## Was ist Node-RED?

[Node-RED](https://nodered.org/about/) ist eine Nachrichtenflußbasierte, visuelle Programmierumgebung für das Internet 
der Dinge. Node-RED wird seit 2013 von [IBM Emerging Technology](https://emerging-technology.co.uk/technologies/) 
entwickelt und steht als kostenlose Open Source Software unter dem Dach der [JS Foundation](https://js.foundation/) zur 
Verfügung. Node-RED kann durch zusätzliche [Node(-Sammlungen)](https://flows.nodered.org) erweitert werden, eine große 
und aktive Community hat Stand Heute bereits weit über 1000 Nodes entwickelt.


## Wofür?

Mit diesem Addon ist es auf einfache und komfortable Weise möglich Regeln, Automationen, Scripte und Anbindungen von 
externen Services und Systemen für ein Homematic System zu realisieren - ohne die Notwendigkeit neben der CCU einen 
weiteren 24/7 laufenden Server zu betreiben.

Darüber hinaus beinhaltet dieses Addon auch [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard) womit
webbasierte User Interfaces erstellt werden können. Zur Anbindung an die Schnittstellenprozesse und die Logikschicht der 
CCU ist [node-red-contrib-ccu](https://github.com/hobbyquaker/node-red-contrib-ccu) im Addon enthalten. 


## Download

Unter [Releases](https://github.com/hobbyquaker/ccu-addon-node-red/releases) ist das Addon Paket zum Download verfügbar.


## Schnellstart

Nach der Installation des Addons über das Homematic WebUI (Systemsteuerung -> Zusatzsoftware) und dem darauf folgenden 
Reboot der CCU ist Node-RED unter `http://<ccu-addresse>/addons/red` erreichbar. Einige Beispiel-Flows sowie ein 
einfaches Dashboard sind bereits vorkonfiguriert, das Dashboard ist unter `http://<ccu-addresse>/addons/red/ui` 
erreichbar.


## Dokumentation

Die Dokumentation der CCU Nodes ist in Node-RED selbst verfügbar. Weitere Beispielflows sind im 
[node-red-contrib-ccu Wiki](https://github.com/hobbyquaker/node-red-contrib-ccu/wiki) zu finden.

Themen die nicht die CCU Nodes sondern speziell das ccu-addon-node-red betreffen sind 
[hier im Wiki](https://github.com/hobbyquaker/ccu-addon-node-red/wiki) zu finden.

Zu Node-RED im allgemeinen gibt es unzählige Tutorials, Dokumentationen und Youtube Videos, auch in Deutscher Sprache.


## Hinweise

* __Sicherheitswarnung__: Node-RED ist (noch) ohne Authentifizierung ereichbar. Wer den Webserver der CCU erreichen
kann hat vollen Zugriff auf Node-RED, es erfolgt keine Passwortabfrage. Bis in einer späteren Version eine 
Authentifizierung an der CCU-Logikschicht implementiert ist gibt es einen 
[möglichen Workaround](https://github.com/hobbyquaker/ccu-addon-node-red/wiki/Passwort) um manuell einen Passwortschutz
einzurichten.
* __Work in Progress!__ Dieses Addon sowie node-red-contrib-ccu sind __noch nicht wirklich fertig__, kaum getestet, 
es ist davon auszugehen dass noch __viele Bugs__ gefixt werden müssen, es sind noch nicht alle geplanten Features 
implementiert... Sobald ein Stand erreicht ist der als "feature-complete", gut getestet und anständig dokumentiert
durchgeht wird die Versionsnummer auf 1.0 erhöht.
* Dieses Addon ist __nur für die CCU3 und RaspberryMatic geeignet__. Auf einer CCU1/CCU2 kann es aufgrund der CPU und 
des verfügbaren RAM nicht verwendet werden.
* __Nicht alle verfügbaren Node-RED Nodes können__ im Node-RED Admin UI über "Manage palette" __installiert werden__. 
Die Installation von Addons die Binärmodule compilieren müssen ist nicht möglich. Das betrifft u.A. Nodes die Zugriff 
auf Hardware benötigen (z.B. Bluetooth).


## Support, Mitarbeit

Diese Software ist ein Hobby-Projekt ohne Gewinnerzielungsabsicht und wird kostenlos unter der MIT-Lizenz zur
Verfügung gestellt. Beteiligung in jeder Form ist willkommen und gewünscht, für Fragen, Vorschläge, Bug-Reports zu den
CCU Nodes bitte den [Issue Tracker](https://github.com/hobbyquaker/node-red-contrib-ccu/issues) nutzen.


## Lizenz

Copyright (c) 2018 Sebastian Raff

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

* [node-red-contrib-ccu](https://github.com/hobbyquaker/node-red-contrib-ccu) - MIT Copyright (c) Sebastian Raff
* [Node-RED](https://github.com/node-red/node-red/blob/master/LICENSE) - Apache 2.0 Copyright JS Foundation and other 
contributors
* [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard/blob/master/LICENSE) - Apache 2.0 Copyright 
2016,2018 JS Foundation and other contributors, Copyright 2016 IBM Corp., Copyright 2015 Andrei Tatar
