# [v5.3.4](https://github.com/rdmtc/RedMatic/releases/v5.3.4) 2020-01-03T12:32:24Z

* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben beim Anlegen von HmIPW-DRI/DRS/FIO Accessories (https://github.com/rdmtc/RedMatic-HomeKit/issues/242)
  * Anlegen der Accessories/Services von HmIP(W) Rollläden umgebaut (https://github.com/rdmtc/RedMatic-HomeKit/issues/243) 




# [v5.3.3](https://github.com/rdmtc/RedMatic/releases/v5.3.3) 2020-01-02T17:11:52Z

* @hobbyquaker Update RedMatic-HomeKit
  * HomeKit-Camera: Neue Option um einen Doorbell Service zur Kamera hinzuzufügen (https://github.com/rdmtc/RedMatic-HomeKit/issues/198)
  * HmIP(W) Rollläden: Debug Ausgabe entfernt




# [v5.3.2](https://github.com/rdmtc/RedMatic/releases/v5.3.2) 2020-01-02T14:43:46Z

* @hobbyquaker Update RedMatic-HomeKit
  * Verbesserung HmIP(W) Rollläden (https://github.com/rdmtc/RedMatic-HomeKit/commit/4471cd12a29bc3a02e1858374cc6e9800ef9e2c0)
  * HmIPW-DRI16/32 Fehler behoben der dazu führte dass der erste Kanal gefehlt hat (https://github.com/rdmtc/RedMatic-HomeKit/issues/238)
  * HmIP-STH/STHD Konfigurationsmöglichkeit Thermostat oder Sensor (https://github.com/rdmtc/RedMatic-HomeKit/issues/190)
  * HmIPW-* Fehler behoben der dazu führte dass SingleAccessory Option wirkungslos war (https://github.com/rdmtc/RedMatic-HomeKit/issues/240)
  * HmIPW-SMI55 hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/237)
  * HmIPW-FIO6 hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/239)
  * HmIPW-DRD3 hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/241)
* @hobbyquaker Update node-red-contrib-theme-midnight-red




# [v5.3.1](https://github.com/rdmtc/RedMatic/releases/v5.3.1) 2019-12-29T12:57:38Z

* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben der dazu führte dass HmIP-BROLL/FROLL nicht mehr angelegt wurden (#295)
  * Fehler behoben HmIP-MOD-OC8 konnte nicht als mehrere Accessories angelegt werden (https://github.com/rdmtc/RedMatic-HomeKit/issues/192)




# [v5.3.0](https://github.com/rdmtc/RedMatic/releases/v5.3.0) 2019-12-28T18:49:00Z

* @hobbyquaker Update RedMatic-HomeKit
  * HmIPW-DRBL4 hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/216)
  * Refactoring HmIP(W) Shutter/Blinds
  * HmIP-DRBLI4 hinzugefügt
  * HmIP-DRSI4 hinzugefügt
  * Fehler behoben der beim Pairing einer Bridge mit Zigbee Devices zum Node-RED Crash geführt hat (https://github.com/rdmtc/RedMatic-HomeKit/issues/229)
* @hobbyquaker Update node-red-contrib-zigbee
  * Herdsman und Konverter aktualisiert
  * TouchlinkFactoryReset implementiert
  * Neuer Node "hue light" um eine ausgewählte Lampe zu steuern
  * Diverse Fehlerbehebungen und Verbesserungen




# [v5.2.7](https://github.com/rdmtc/RedMatic/releases/v5.2.7) 2019-12-27T11:19:20Z

* @hobbyquaker Update node-red-red-contrib-ccu
  * Fehler behoben der dazu führte dass Internationalisierungsplatzhalter von Rega Variablen, Räumen und Gewerken nicht mehr übersetzt wurden ([Forum](https://homematic-forum.de/forum/viewtopic.php?f=77&t=55444&p=551428))
* @hobbyquaker Update node-red-contrib-theme-midnight-red




# [v5.2.6](https://github.com/rdmtc/RedMatic/releases/v5.2.6) 2019-12-25T23:28:52Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim Abfragen von Rega-Variablen (#292)
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))
* @hobbyquaker Update Node.js
* @hobbyquaker Update node-red-contrib-rfxcom prebuild binaries
* @hobbyquaker Update node-red-node-sqlite prebuild binaries
* @hobbyquaker Update node-red-contrib-modbus prebuild binaries
* @hobbyquaker Update node-red-contrib-comfoair
* @hobbyquaker Update node-red-contrib-rfxcom
* @hobbyquaker Update node-red-contrib-smartmeter
* @hobbyquaker Update node-red-contrib-theme-midnight-red




# [v5.2.5](https://github.com/rdmtc/RedMatic/releases/v5.2.5) 2019-12-13T18:38:59Z

* @hobbyquaker Add node-red-contrib-comfoair (#290)
* @hobbyquaker Update node-red-dashboard  ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))
* @hobbyquaker Update npm (#291)
* @hobbyquaker Update node-red-node-email
* @hobbyquaker Update node-red-node-rbe
* @hobbyquaker Update font-awesome
* @hobbyquaker Update node-red-contrib-theme-midnight-red
* @hobbyquaker Update node-red-contrib-modbus




# [v5.2.4](https://github.com/rdmtc/RedMatic/releases/v5.2.4) 2019-12-05T17:36:04Z

* @hobbyquaker Update RedMatic-HomeKit
  * Option "openOnUnlock" für HM-Sec-Key-O hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/218)
* @hobbyquaker Update node-red-contrib-zigbee
  * Herdsman und Converter aktualisiert
  * Converter- und Hue-Node: Fehler behoben der bei Node-/Flow-Deploy auftreten konnte (https://github.com/hobbyquaker/node-red-contrib-zigbee/issues/72)
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))
* @hobbyquaker Update node-red-contrib-modbus
* @hobbyquaker Update node-red-contrib-mysensors
* @hobbyquaker Update node-red-contrib-theme-midnight-red
* @hobbyquaker Update node-red-node-serialport
* @hobbyquaker Update npm





# [v5.2.3](https://github.com/rdmtc/RedMatic/releases/v5.2.3) 2019-11-25T20:51:26Z

* @hobbyquaker Update node-red-contrib-zigbee
  * https://github.com/hobbyquaker/node-red-contrib-zigbee/commit/9b8337c50506ec8071759ded174ed960f1273a03 @hobbyquaker Event node: groupID und profileID zu ausgehenden messages hinzugefügt
  * https://github.com/hobbyquaker/node-red-contrib-zigbee/commit/30c146f630a21efc682ac8596a4c9db390f47459 @hobbyquaker Fehler behoben der zum Verlust der Gerätedatenbank führen konnte (https://github.com/hobbyquaker/node-red-contrib-zigbee/issues/74)
* @hobbyquaker Update RedMatic-HomeKit
  * https://github.com/rdmtc/RedMatic-HomeKit/commit/46f20749fae60ba149d5b05c976bcfffcaf62631 @jpawlowski Add support for ZEL STG RM FFK
  * https://github.com/rdmtc/RedMatic-HomeKit/commit/682b3527df1bd22096af94362f2009982d45395f @jpawlowski Fix config of ZEL STG RM FEP 230v 
* @hobbyquaker Update node-red-contrib-sun-position 
* @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))
* @hobbyquaker node-red-contrib-theme-midnight-red
* @hobbyquaker npm




# [v5.2.2](https://github.com/rdmtc/RedMatic/releases/v5.2.2) 2019-11-15T17:32:29Z

* @hobbyquaker Update RedMatic-HomeKit
  * HM-Sec-MDIR-3 hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/206)
  * HmIP-FDT/-PDT Fehler behoben, virtuelle Kanäle (https://github.com/rdmtc/RedMatic-HomeKit/issues/208, https://github.com/rdmtc/RedMatic-HomeKit/issues/193)
  * HmIP-MOD-HO Fehler behoben bei Garagensteuerung, Lightbulb Service hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/201)
  * HmIP-FSM/-FSM16 Fehler behoben Service Type (https://github.com/rdmtc/RedMatic-HomeKit/issues/191)
* @hobbyquaker Update node-red-contrib-zigbee
* @hobbyquaker Update node-red-node-email
* @hobbyquaker Update node-red-contrib-theme-midnight-red
* @hobbyquaker Update node-red-contrib-sun-position
* @hobbyquaker Update node-red-contrib-serialport
* @hobbyquaker Update node-red-contrib-sqlite




# [v5.2.1](https://github.com/rdmtc/RedMatic/releases/v5.2.1) 2019-11-09T09:32:09Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der beim Abfragen von ReGaHSS Variablen zu Verbindungsabbrüchen führen konnte ([Forum](https://homematic-forum.de/forum/viewtopic.php?f=77&t=54282))
  * Vereinheitlichung Property Namen eingehender Nachrichten (https://github.com/rdmtc/node-red-contrib-ccu/issues/102)
  * MQTT Node: Fehler behoben bei 0-Werten im Topic (https://github.com/rdmtc/node-red-contrib-ccu/issues/100)
* @hobbyquaker Update RedMatic-HomeKit
  * Zigbee Node: Ikea Lampen hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/197)
  * HmIP-FDT: Falsche Kanalzuordnung gefixt, Möglichkeit virtuelle Kanäle auszuwählen (https://github.com/rdmtc/RedMatic-HomeKit/issues/193)
  * HmIP-MOD-HO hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/201)
* @hobbyquaker Update node-red-contrib-zigbee
  * Diverse Verbesserungen und Fehlerbehebungen
  * Herdsman und Converter auf aktuellen Stand gebracht
* @hobbyquaker Update node-red-contrib-sun-position
* @hobbyquaker Update node-red-contrib-johnny-five prebuild
* @hobbyquaker Update node-red-contrib-smartmeter
* @hobbyquaker Update node-red-contrib-theme-midnight-red
* @hobbyquaker Update npm




# [v5.2.0](https://github.com/rdmtc/RedMatic/releases/v5.2.0) 2019-10-23T20:09:49Z

* @hobbyquaker Neue Nodes: redmatic-canbus ([node-red-contrib-canbus](https://github.com/rajeshsola/node-red-addons/tree/master/node-red-contrib-canbus) Fork)
* @hobbyquaker Update node-red-contrib-zigbee
  * Diverse Fehler behoben
  * Herdsman und Converter Update
* @hobbyquaker Update Node.js




# [v5.1.2](https://github.com/rdmtc/RedMatic/releases/v5.1.2) 2019-10-21T17:09:01Z

* @hobbyquaker Update RedMatic-HomeKit
  * ZigBee Geräte können via UI aktiviert/deaktiviert werden
  * Fehler behoben der zu falschem Status von lumi.sensor_magnet Geräten geführt hat
  * Bridge Publish verhindern falls es keine Accessories gibt



# [v5.1.1](https://github.com/rdmtc/RedMatic/releases/v5.1.1) 2019-10-20T20:31:56Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu geführt hat dass Werte im Context gefehlt haben
* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben der zum Absturz führen konnte wenn eine Bridge mit ZigBee-Geräten gepaired wird




# [v5.1.0](https://github.com/rdmtc/RedMatic/releases/v5.1.0) 2019-10-20T14:15:36Z

* @hobbyquaker Update node-red-contrib-zigbee
  * Herdsman und Konverter aktualisiert
* @hobbyquaker Update RedMatic-HomeKit
  * Neuer Node "HomeKit ZigBee" der Geräte die via node-red-contrib-zigbee angebunden sind in HomeKit bereitstellt
* @hobbyquaker Update node-red-contrib-theme-midnight-red




# [v5.0.5](https://github.com/rdmtc/RedMatic/releases/v5.0.5) 2019-10-17T16:37:03Z

* @hobbyquaker Update node-red-contrib-ccu
  * Rega Metadaten Persistenz
  * RedMatic-HomeKit: Schwerwiegenden Fehler behoben der zum Verlust der Raumzuordnungen und Benennungen in HomeKit führen konnte (https://github.com/rdmtc/RedMatic-HomeKit/issues/188) 



# [v5.0.4](https://github.com/rdmtc/RedMatic/releases/v5.0.4) 2019-10-16T17:16:36Z

* @hobbyquaker Defer Node-RED start after reboot for 30 seconds
  * RedMatic-HomeKit: Weiterer Versuch einen schwerwiegenden Fehler zu umgehen der zum Verlust der Raumzuordnungen und Benennungen in HomeKit führen kann (https://github.com/rdmtc/RedMatic-HomeKit/issues/188) 



# [v5.0.3](https://github.com/rdmtc/RedMatic/releases/v5.0.3) 2019-10-15T17:22:47Z

* @hobbyquaker Update Node-RED auf 1.0.2 ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* @hobbyquaker Update node-red-contrib-ccu
  * Debug Log setStatus
* @hobbyquaker Update node-red-contrib-zigbee
  * Im Binds Tab sind Bindings zum Coordinator nun standardmäßig ausgeblendet
* @hobbyquaker Update RedMatic-HomeKit
  * Roto Rollladenaktor `ZEL STG RM FEP 230V` integriert (https://github.com/rdmtc/RedMatic-HomeKit/issues/177)
  * Versuch einen schwerwiegenden Fehler zu beheben der zum Verlust der Raumzuordnungen und Benennungen in HomeKit führen kann (https://github.com/rdmtc/RedMatic-HomeKit/issues/188) 
* @hobbyquaker node-red-contrib-theme-midnight-red





# [v5.0.2](https://github.com/rdmtc/RedMatic/releases/v5.0.2) 2019-10-13T16:10:37Z

* @hobbyquaker Update node-red-contrib-zigbee
  * Schwerwiegenden Fehler behoben der zum Verlust der Gerätedatenbank führen konnte
  * Diverse Fehlerbehebungen und Verbesserungen
  * Converter Node unterstützt nun Befehle an Gruppen
  * Converter-Configuration und Ping per Device konfigurierbar
  * Network Map verbessert
* @hobbyquaker Update node-red-node-sqlite




# [v5.0.1](https://github.com/rdmtc/RedMatic/releases/v5.0.1) 2019-10-11T19:20:13Z

* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))
* @hobbyquaker Update node-red-contrib-zigbee
  * Fix network map
  * Hue node group support
  * Command node group support
  * Group binding
* @hobbyquaker Update node-red-contrib-theme-midnight-red
* @hobbyquaker Update npm
* @hobbyquaker Fix retrieval of installed package versions
* @hobbyquaker Update 3rd party licenses




# [v5.0.0](https://github.com/rdmtc/RedMatic/releases/v5.0.0) 2019-10-04T18:20:50Z

* @hobbyquaker Update Node-RED to version 1.0.1
  * [Blog Article, Video](https://nodered.org/blog/2019/09/30/version-1-0-released)
  * [Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md) 
* @hobbyquaker node-red-dashboard
  * [Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md)
* @hobbyquaker Update node-red-contrib-ccu
  * Neuer "Treeview" um Datenpunkte komfortabel zu selektieren (Danke @Hypnos3!)
  * Internes REST API des "ccu connection" Nodes mit Authentifizierung abgesichert
  * Viele Bugfixes und Verbesserungen
* @hobbyquaker Update node-red-contrib-zigbee
  * Vom Zigbee Shepherd zu @koenkk's Rewrite "[Zigbee Herdsman](https://github.com/koenkk/zigbee-herdsman)" migriert
  * Converter auf den neusten Stand gebracht
  * Viele Bugfixes und Verbesserung
  * UI umstrukturiert, Reporting, Gruppen und Binds können nun komfortabel via UI konfiguriert werden
  * Device Node entfernt (**⚠️**  falls dieser noch in Flows enthalten ist muss er manuell entfernt werden, idealerweise _vor_ dem Update um eventuelle Node-RED Crashs zu vermeiden. Die Gerätedatenbank und das Pairing sollten davon nicht beeinflusst werden.)
* @hobbyquaker Theme node-red-contrib-theme-midnight-red integriert
* @hobbyquaker Node-RED Theme Auswahl im RedMatic UI
* @hobbyquaker Update node-red-node-serialport
* @hobbyquaker Update node-red-contrib-johnny-five prebuild
* @hobbyquaker Update node-red-contrib-enocean
* @hobbyquaker Update fontawesome
* @hobbyquaker Update node-red-contrib-sun-position
* @hobbyquaker Update node-red-node-email
* @hobbyquaker Update npm
* @Hypnos Monit konfiguration geändert, Grenzwerte für Disk- und RAM-Nutzung erhöht (#250)
* @hobbyquaker Bei Erstinstallation auf RaspberryMatic wird Reboot erzwungen
* @hobbyquaker Update node-red-contrib-rfxcom
* @hobbyquaker Update RedMatic-HomeKit
* @hobbyquaker Update Node.js
* @hobbyquaker Fehler behoben der bei Deinstallation dazu führte dass Monit Konfiguration nicht entfernt wurde (#241)
* @hobbyquaker add node-red-contrib-doorbird (#239)
* @hobbyquaker Lizenzseite im RedMatic UI wird erst bei Bedarf nachgeladen
* @hobbyquaker Node-RED start/stop via Monit ermöglicht
* @hobbyquaker Neues Logo und neues Favicon




# [v4.7.1](https://github.com/rdmtc/RedMatic/releases/v4.7.1) 2019-05-19T10:51:51Z

* @hobbyquaker Update node-red-contrib-ccu 
  * Fehler behoben der dazu führte dass der `get value` Node falsche Werte ausgegeben hat (#212 https://github.com/rdmtc/node-red-contrib-ccu/issues/84)
* @hobbyquaker Update node-red-contrib-zigbee
  * Offline Status wird (u.A.) anhand dem Erfolg/Misserfolg des letzten Befehls gesetzt
* @hobbyquaker Update node-red-contrib-enocean
* @hobbyquaker Update node-red-contrib-johnny-five (#181)




# [v4.7.0](https://github.com/rdmtc/RedMatic/releases/v4.7.0) 2019-05-15T16:59:50Z

* @Hypnos3 Update node-red-contrib-ccu
  *  Default Benennung des Value Nodes verbessert (https://github.com/rdmtc/node-red-contrib-ccu/pull/82)
* @hobbyquaker Update node-red-contrib-enocean 
* @hobbyquaker Diverse Verbesserungen der Paketverwaltung
* @hobbyquaker Diverse Verbesserungen des RedMatic UI 
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))




# [v4.6.1](https://github.com/rdmtc/RedMatic/releases/v4.6.1) 2019-05-14T19:36:58Z

* @hobbyquaker Package Manager: Prüfung der Dateiintegrität nach Download (#210)
* @hobbyquaker Update node-red-dashboard to 2.15.1 ([Changelog](https://github.com/node-red/node-red-dashboard/blob/master/CHANGELOG.md))




# [v4.6.0](https://github.com/rdmtc/RedMatic/releases/v4.6.0) 2019-05-13T20:23:08Z

* @hobbyquaker Fehler behoben der dazu führte das Dateien im node-red-contrib-johnny-five package gefehlt haben (#181)
* @hobbyquaker Einfache Monit Konfiguration hinzugefügt (nur auf RaspberryMatic aktiv, bisher keine Alarme, nur Einträge im Syslog) (#185)




# [v4.5.1](https://github.com/rdmtc/RedMatic/releases/v4.5.1) 2019-05-13T16:01:18Z

* @hobbyquaker Update node-red-contrib-combine
  * Defer Node: Möglichkeit den Timeout via `msg`, `context` oder `env` zu setzen (https://github.com/rdmtc/node-red-contrib-combine/issues/12)
* @hobbyquaker RedMatic UI: Fehler behoben, Dropdown zur Auswahl der Backup-Methode wurde bei Verwendung von Safari/Firefox nicht richtig initalisiert (#209)
* @hobbyquaker Update node-red-node-serialport




# [v4.5.0](https://github.com/rdmtc/RedMatic/releases/v4.5.0) 2019-05-12T16:43:55Z

* @hobbyquaker _node-red-contrib-gpio_ (welches bisher nicht wirklich funktioniert hat) durch den Fork _node-red-contrib-johnny-five_ ersetzt (#181)




# [v4.4.3](https://github.com/rdmtc/RedMatic/releases/v4.4.3) 2019-05-12T11:32:03Z

* @hobbyquaker Update node-red-contrib-ccu
  * Display Node: Fehler behoben der dazu führte dass das gelbe und rote Icon beim HM-DIS-WM55 nicht funktioniert hat (https://github.com/rdmtc/node-red-contrib-ccu/commit/c79b9b4e49071ecd4b1128e0a15514d4de699845)
  * Signal Node: Einige Optionen können nun via msg/context/env überschrieben werden (https://github.com/rdmtc/node-red-contrib-ccu/issues/80)
  * Value Node: set Mode Dropdown nur anzeigen bei Geräten die RX_MODE BURST unterstützen (https://github.com/rdmtc/node-red-contrib-ccu/issues/37)
  * Get Value Node: Interface/Kanal/Datenpunkt können via msg überschrieben werden (https://github.com/rdmtc/node-red-contrib-ccu/issues/49)
  * Switch Node: Anzeige des letzten Werts und der aktiven Ausgänge im Node Status (https://github.com/rdmtc/node-red-contrib-ccu/issues/53)
* @hobbyquaker node-red-contrib-gpio: raspi-io dependency zu prebuilt hinzugefügt(#181)
* @hobbyquaker RedMatic UI: Abgelaufene Session behandeln (close #206)




# [v4.4.2](https://github.com/rdmtc/RedMatic/releases/v4.4.2) 2019-05-10T20:28:08Z

* @hobbyquaker Update node-red-contrib-ccu
  * Display Node: schwerwiegenden Fehler behoben der dazu führte dass keine Displays mehr angesteuert werden konnten (#204)
* @hobbyquaker Update RedMatic-HomeKit
  * Workaround für fehlerhaften OPERATING_VOLTAGE Datenpunkt von HmIP-Wetterstationen (https://github.com/rdmtc/RedMatic-HomeKit/issues/143)
* @hobbyquaker Update node-red-contrib-enocean





# [v4.4.1](https://github.com/rdmtc/RedMatic/releases/v4.4.1) 2019-05-05T14:11:54Z

* @hobbyquaker Update node-red-contrib-ccu
  * Display Node: Fehlende Icons für HM-Dis-WM55 ergänzt (https://github.com/rdmtc/node-red-contrib-ccu/issues/78)
* @hobbyquaker Update RedMatic-HomeKit
  * Heizungsgruppen und Wetterstationen: Batterie Status korrigiert (https://github.com/rdmtc/RedMatic-HomeKit/issues/143)
* @hobbyquaker Update node-red-contrib-enocean
* @hobbyquaker node-red-contrib-gpio: fehlende Dependencies hinzugefügt (#181)




# [v4.4.0](https://github.com/rdmtc/RedMatic/releases/v4.4.0) 2019-05-04T14:52:26Z

* @hobbyquaker Update node-red-contrib-zigbee
* @hobbyquaker RedMatic UI: Deutsche Übersetzung, Wiki Links (#194)
* @hobbyquaker RedMatic UI Update Popup: Wiki Link (#193)
* @hobbyquaker Backup-Verhalten konfigurierbar (#198)




# [v4.3.10](https://github.com/rdmtc/RedMatic/releases/v4.3.10) 2019-05-01T16:23:40Z
* @hobbyquaker Update node-red-contrib-zigbee


# [v4.3.9](https://github.com/rdmtc/RedMatic/releases/v4.3.9) 2019-04-30T11:07:34Z
* @hobbyquaker Update node-red-contrib-zigbee


# [v4.3.8](https://github.com/rdmtc/RedMatic/releases/v4.3.8) 2019-04-29T20:36:27Z
* @hobbyquaker Update node-red-contrib-zigbee


# [v4.3.7](https://github.com/rdmtc/RedMatic/releases/v4.3.7) 2019-04-29T12:39:27Z
* @hobbyquaker Update node-red-contrib-zigbee


# [v4.3.6](https://github.com/rdmtc/RedMatic/releases/v4.3.6) 2019-04-28T16:17:37Z
* @hobbyquaker Update node-red-contrib-zigbee


# [v4.3.5](https://github.com/rdmtc/RedMatic/releases/v4.3.5) 2019-04-27T21:04:17Z
* @hobbyquaker Update node-red-contrib-zigbee
* @hobbyquaker add node-red-contrib-enocean


# [v4.3.3](https://github.com/rdmtc/RedMatic/releases/v4.3.3) 2019-04-26T19:09:07Z

* @hobbyquaker Update node-red-contrib-zigbee (**Alpha Version**)
* @hobbyquaker Update node-red-node-sqlite




# [v4.3.2](https://github.com/rdmtc/RedMatic/releases/v4.3.2) 2019-04-21T21:42:45Z

* @hobbyquaker Update node-red-contrib-zigbee (**Alpha Version**)
  * Option um die LED des CC2531 USB Sticks abzuschalten (https://github.com/hobbyquaker/node-red-contrib-zigbee/issues/9)
  * Crash abgefangen (https://github.com/hobbyquaker/node-red-contrib-zigbee/issues/8)
  * Converter Node: Fehler behoben der dazu führte dass kein passender Converter gefunden wurde (https://github.com/hobbyquaker/node-red-contrib-zigbee/issues/10)
  * Converter Node: Topic konfigurierbar
  * Event Node: Topic konfigurierbar (https://github.com/hobbyquaker/node-red-contrib-zigbee/issues/7)
  * `device.overdue` Attribut hinzugefügt



# [v4.3.1](https://github.com/rdmtc/RedMatic/releases/v4.3.1) 2019-04-18T22:28:02Z

* @hobbyquaker Update RedMatic-HomeKit
  * Heizungsgruppen: diverse Fehler behoben (https://github.com/rdmtc/RedMatic-HomeKit/issues/138)
  * TV Accessory: Fehler bei InputSourceType Dropdown behoben (https://github.com/rdmtc/RedMatic-HomeKit/issues/137)



# [v4.3.0](https://github.com/rdmtc/RedMatic/releases/v4.3.0) 2019-04-18T10:21:22Z

* @hobbyquaker Update RedMatic-HomeKit
  * Neues Accessory "TV" (rdmtc/RedMatic-HomeKit#137)




# [v4.2.0](https://github.com/rdmtc/RedMatic/releases/v4.2.0) 2019-04-17T17:59:47Z

* @hobbyquaker Update RedMatic-HomeKit
  * Maximale Anzahl von Accessories je Bridge auf 150 erhöht
  * Unterstützung für Heizungsgruppen hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/131)
  * HmIP-WTH, HmIP-eTRV-* Fehler behoben bei der Anzeige der Batterie-Warnung
* @hobbyquaker RedMatic-UI: Fehler behoben Statusanzeige Node-RED Prozess falls Restart-Kommando Fehler zurückgibt.




# [v4.1.3](https://github.com/rdmtc/RedMatic/releases/v4.1.3) 2019-04-16T19:13:45Z

* @hobbyquaker Startscript verbessert, das Neustarten von Node-RED über das RedMatic UI sollte nun zuverlässig funktionieren (#189)




# [v4.1.2](https://github.com/rdmtc/RedMatic/releases/v4.1.2) 2019-04-13T16:00:43Z

* @hobbyquaker Update node-red-contrib-sun-position
* bce479e 3adbca2 731d7d1 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu führen konnte das nachfolgende Änderungen im Flow die Statusanzeige von _Value_ und _Sysvar_ Nodes geändert haben (https://github.com/rdmtc/node-red-contrib-ccu/issues/77)
  * Fehler behoben der dazu führte dass Datenpunkte des Maintenance-Kanals (:0) und `PRESS_*` Datenpunkte nicht initial angelegt wurden (https://github.com/rdmtc/node-red-contrib-ccu/issues/76)
  * Fehler behoben der dazu führte dass keine "speziellen" Werte gesetzt werden konnten (https://github.com/rdmtc/node-red-contrib-ccu/issues/74)



# [v4.1.1](https://github.com/rdmtc/RedMatic/releases/v4.1.1) 2019-04-11T17:04:38Z

* @hobbyquaker Update node-red-node-serialport
* @hobbyquaker Update node-red-node-email
* @hobbyquaker Sortierung und Filter im RedMatic Package Manager UI (#184)




# [v4.1.0](https://github.com/rdmtc/RedMatic/releases/v4.1.0) 2019-04-08T17:40:49Z

* @hobbyquaker Update node-red-contrib-ccu
  * _set value_ Node: Fehler behoben bei der Anzeige des aktuellen Werts im Flow-Editor
* @hobbyquaker (redmatic-pkg-)node-red-contrib-gpio hinzugefügt
* @hobbyquaker Update RedMatic-LED
  * An neuen Monit-Service in RaspberryMatic 3.45.5.20190330 angepasst 
* @hobbyquaker Update node-red-node-serialport
* @hobbyquaker Update node-red-contrib-sun-position
* @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))




# [v4.0.5](https://github.com/rdmtc/RedMatic/releases/v4.0.5) 2019-04-02T20:32:12Z

* 7dac950 bf01a19 @hobbyquaker Fehler behoben der u.U. die Installation von redmatic-pkg-* Paketen verhindert hat (#178)




# [v4.0.3](https://github.com/rdmtc/RedMatic/releases/v4.0.3) 2019-04-01T16:13:24Z

* @hobbyquaker Update RedMatic-HomeKit
  * Universal Accessory: Anpassungen für Television Service (automatisches Linken weiterer Services)
* @hobbyquaker RedMatic UI weist auf Updates hin (close #177)
* @hobbyquaker Update node-red-contrib-ccu
* @hobbyquaker Update node-red-contrib-smartmeter
* @hobbyquaker Telemetrie ([Wiki](https://github.com/rdmtc/RedMatic/wiki/Telemetry))




# [v4.0.2](https://github.com/rdmtc/RedMatic/releases/v4.0.2) 2019-03-24T20:46:43Z

* @hobbyquaker Improve log output of redmatic-pkg upgrade
* @hobbyquaker Fix redirection of redmatic-pkg output to logfile
* @hobbyquaker Fix automatic Update of redmatic-pkg-* packages after RedMatic Update (once more 😕)



# [v4.0.1](https://github.com/rdmtc/RedMatic/releases/v4.0.1) 2019-03-24T15:56:55Z

* @hobbyquaker Update RedMatic-HomeKit
  * Überflüssigen BatteryService bei HmIP-BWTH(24) entfernt (https://github.com/rdmtc/RedMatic-HomeKit/issues/133)
* @hobbyquaker Fehler behoben beim automatischen Update der redmatic-pkg-* Packages im Zuge von RedMatic Updates.
* @hobbyquaker node-red-contrib-zigbee hinzugefügt (**Alpha-Version!** API nicht finalisiert, keine Doku, höchstwahrscheinlich viele Bugs)
* @hobbyquaker Diverse Verbesserungen des RedMatic UI
* @hobbyquaker Diverse Verbesserungen des Log Downloads



# [v4.0.0](https://github.com/rdmtc/RedMatic/releases/v4.0.0) 2019-03-24T12:36:35Z

* @hobbyquaker Einfaches Paketmanagement für Nodes mit Binärmodulen hinzugefügt (#170)
  Zusätzliche Nodes die Aufgrund von Binärabhängigkeiten nicht über den Palette Manager installiert werden können sind nun nich mehr im RedMatic Installationspaket enthalten, sondern können unter dem neuen Menüpunkt "Packages" im RedMatic UI installiert werden. Damit konnte die Größe des Installationspakets halbiert werden, dies sollte Probleme wie #169 vermeiden und die RedMatic Installation bzw. Updates sollten schneller vonstatten gehen. Es ist empfehlenswert nicht verwendete Nodes dort zu deinstallieren um die Startzeit und Speichernutzung von Node-RED zu reduzieren.



# [v3.3.2](https://github.com/rdmtc/RedMatic/releases/v3.3.2) 2019-03-23T11:13:10Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu führte das diverse Nodes im Status "partly connected" oder "disconnected" blieben und nicht funktionierten (#172)




# [v3.3.1](https://github.com/rdmtc/RedMatic/releases/v3.3.1) 2019-03-22T18:10:26Z

* @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* @hobbyquaker Update node-red-contrib-ccu
  * Crash verhindern falls binrpc/xmlrpc Ports bereits belegt sind
* @hobbyquaker Update node-red-contrib-mysensors
* @Hypnos3  Update node-red-contrib-sun-position
* @hobbyquaker Update node-red-contrib-combine




# [v3.3.0](https://github.com/rdmtc/RedMatic/releases/v3.3.0) 2019-03-19T17:33:06Z

* @hobbyquaker Update RedMatic-HomeKit
  * Garage Accessory: Fehlerbehebung ON_TIME
  * Garage Accessory: Input/Output hinzugefügt
  * Neues Accessory: Irrigation (Bewässerung)
* @hobbyquaker Update node-red-contrib-combine
  * Neue Option für List und Statistic Node um boolean false Werte zu ignorieren
* @hobbyquaker Revert ccu3 patches on uninstall




# [v3.2.0](https://github.com/rdmtc/RedMatic/releases/v3.2.0) 2019-03-18T20:54:02Z

* @hobbyquaker Update RedMatic-HomeKit
  * Garage Accessory: Fehler behoben bei Verwendung zweier Sensoren (https://github.com/rdmtc/RedMatic-HomeKit/issues/130)
* @hobbyquaker Update node-red-contrib-modbus serialport binary
* @hobbyquaker Update node-red-contrib-mysensors
* @hobbyquaker patch ccu3 backup routine to respect nobackup tag (close #168)
* @hobbyquaker Update 3rd Party Licenses




# [v3.1.2](https://github.com/rdmtc/RedMatic/releases/v3.1.2) 2019-03-16T09:20:22Z

* @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* @hobbyquaker Update node-red-contrib-modbus




# [v3.1.1](https://github.com/rdmtc/RedMatic/releases/v3.1.1) 2019-03-14T21:19:40Z

* @hobbyquaker Update RedMatic-HomeKit 
  * Garage Accessory, Verbesserung des Verhaltens bei Richtungsumkehr (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/130)




# [v3.1.0](https://github.com/rdmtc/RedMatic/releases/v3.1.0) 2019-03-14T17:48:51Z

* @hobbyquaker Update RedMatic-WebApp 
  * Schwerwiegenden Fehler behoben der zum Node-RED Crash geführt hat (https://github.com/HM-RedMatic/RedMatic-WebApp/issues/26)
* @hobbyquaker Möglichkeit Node-RED im "Safe Mode" zu starten (#164)
* @hobbyquaker Update node-red-contrib-ccu
  * Clonen von Sysvar Messages um Flow-Übergreifende Änderungen der Message zu verhindern (https://github.com/HM-RedMatic/node-red-contrib-ccu/issues/67)




# [v3.0.1](https://github.com/rdmtc/RedMatic/releases/v3.0.1) 2019-03-13T18:51:57Z

* @hobbyquaker Update RedMatic-HomeKit
  * Garage Accessory: Konfigurierbare Pausenzeit bei Richtungsumkehr (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/130)



# [v3.0.0](https://github.com/rdmtc/RedMatic/releases/v3.0.0) 2019-03-12T21:00:25Z

* @hobbyquaker Update node-red ([Video](https://youtu.be/C6w2H3BPauc), [Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* @Hypnos3  update node-red-contrib-sun-position
* @hobbyquaker add node-red-contrib-rfxcom (#159)




# [v2.9.0](https://github.com/rdmtc/RedMatic/releases/v2.9.0) 2019-03-10T14:34:11Z

* @hobbyquaker Update RedMatic-HomeKit
  * Homematic Garage Accessory verbessert (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/130 https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/128)
  * Unterstützung für HmIPW-DRS8/16 hinzugefügt
  * Unterstützung für HmIPW-DRI16/32 hinzugefügt
  * HAP-Nodejs Update
  * TV-Fernbedienungs Services im _Universal Accessory_ hinzugefügt
* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben bei der Filterung im _Set Value_ Node
  * Möglichkeit nach Kanal-Index zu filtern im _Set Value_ und _RPC Event_ Node hinzugefügt
  * Fehler beim `lc` (Lastchange) Attribut des _Sysvar_ Node behoben
  * Testautomatisierung
* @Hypnos3 Update node-red-contrib-sun-position
* @hobbyquaker Update dependencies
  * Node.js
  * npm
  * node-red-node-serialport
* @hobbyquaker start version range at 0.0.0 to satisfy david-dm
* @hobbyquaker remove node-red-contrib-mqtt-json




# [v2.8.2](https://github.com/rdmtc/RedMatic/releases/v2.8.2) 2019-03-02T09:15:12Z

* @hobbyquaker Update Dependencies
  * Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.14.0))
  * Update node-red
  * Update node-red-node-email
  * Update Node.js




# [v2.8.1](https://github.com/rdmtc/RedMatic/releases/v2.8.1) 2019-02-21T20:22:59Z

* @hobbyquaker Update node-red-contrib-ccu
  * Workaround wegen ausbleibender Events von HmIP-RF (hmipserver) ab CCU Firmware 3.43.15 implementiert ([Forum](https://homematic-forum.de/forum/viewtopic.php?f=77&t=49224))
  * Bei JSON.parse Fehlern beim Abfragen von Rega-Variablen wird nun eine Debug Datei erzeugt um diese Fehler besser analysieren zu können (#153)



# [v2.8.0](https://github.com/rdmtc/RedMatic/releases/v2.8.0) 2019-02-19T20:26:53Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim Ansteuern der LED des HmIP-MP3P mit dem Signal Node
* @hobbyquaker node-red-contrib-mysensors hinzugefügt (#154)




# [v2.7.1](https://github.com/rdmtc/RedMatic/releases/v2.7.1) 2019-02-18T20:03:11Z

* @hobbyquaker Update RedMatic-HomeKit
  * Verbesserung beim Richtungswechsel von Rollläden (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/121)
  * Garage Accessory: Unterstützung für HMW-Sen-SC-* (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/42)
* @hobbyquaker Update node-red-contrib-sun-position




# [v2.7.0](https://github.com/rdmtc/RedMatic/releases/v2.7.0) 2019-02-17T20:15:35Z

* @hobbyquaker Update node-red-contrib-ccu
  * Signal Node: Unterstützung für HmIP-MP3P (https://github.com/HM-RedMatic/node-red-contrib-ccu/issues/59)
  * Signal Node: Unterstützung für HmIP-BSL (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/0d288f18d1586ea4396f41f84421cb415170ad1e)
  * Signal Node: Unterstützung für HmIP-ASIR (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/058814630fab8105122b71efad937d5fdd74c9b8)
* @hobbyquaker Update RedMatic-HomeKit
  * Neues Accessory: Homematic Garage (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/42)
  * Verbesserungen für Rollladenaktoren beim Richtungswechsel (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/121)
* @hobbyquaker  Update node-red-contrib-sun-position
  * @Hypnos3 Neuer Node "Time comp" zum umrechnen und vergleichen von Zeitpunkten
  * @Hypnos3 Neuer Node "Timespan" für die Berechnung und den Vergleich von Zeitspannen  
  * @Hypnos3 Diverse Verbesserungen
* @hobbyquaker Buildprozess verbessert, Automatisierung des "prebuild" von Binärmodulen 
* @hobbyquaker RedMatic-HomeKit von var/ nach lib/ verschoben
* @hobbyquaker Update node-red-node-email
* @hobbyquaker Update node-red-node-serialport
* @hobbyquaker Update npm





# [v2.6.0](https://github.com/rdmtc/RedMatic/releases/v2.6.0) 2019-02-10T17:12:26Z

* @hobbyquaker add node-red-contrib-modbus (#151)




# [v2.5.1](https://github.com/rdmtc/RedMatic/releases/v2.5.1) 2019-02-07T18:02:53Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu führte das findChannel Methode keine Channel mehr über ihren Namen finden konnte




# [v2.5.0](https://github.com/rdmtc/RedMatic/releases/v2.5.0) 2019-02-07T16:43:31Z

* @hobbyquaker Update node-red-contrib-ccu
  * setValue Calls aus den Nodes "set value" und "value" werden per Queue abgearbeitet ([cc8cbfc](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/cc8cbfc797e073c48e7c0bad3647dfaa0e8cc97e) [69d99d0](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/69d99d0d693e6362f8999d5fde88189830986997))
  * weitere Verbesserungen bei der Verarbeitung von WORKING bzw. PROCESS Datenpunkten ([4d395ba](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/4d395ba644f0edf287905e3efab403050aca46c9))
  * Performance-Optimierung für die Abarbeitung von Callbacks ([4a6feed](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/4a6feedad2b073c5c414a26a68ae46b9dbdfe4db))
  * Performance-Optimierung für das Auffinden von Channels über Namen ([c74a611](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/c74a61164abedabcfbff68bc2a587e4e70833fe0))
  * Messages werden vor der Übergabe an einen Callback gecloned um Veränderungen des Zustands durch Nachfolgende Nodes zu verhindern ([f036018](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/f036018595865fdea8bf952527f2f2502b19ab74))
* @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung für HM-Sec-Sir-WM hinzugefügt (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/118)




# [v2.4.1](https://github.com/rdmtc/RedMatic/releases/v2.4.1) 2019-02-03T14:38:26Z

* @hobbyquaker Update node-red-contrib-ccu
  * Verarbeitung von WORKING* und PROCESS Datenpunkten verbessert




# [v2.4.0](https://github.com/rdmtc/RedMatic/releases/v2.4.0) 2019-02-02T13:00:28Z

* @hobbyquaker add node-red-contrib-smartmeter (#144)
* @hobbyquaker Update node-red-contrib-ccu
  * setValueQueued Methode hinzugefügt um Werte nacheinander zu setzen (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/a391f83633f9772562a42fdf96bc56f1db9fe70b)
  * set Value Node nutzt nun setValueQueued (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/69d99d0d693e6362f8999d5fde88189830986997)
* @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung für HM-Sec-Win und HM-Sec-Key-O hinzugefügt (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/116)
  * Werte werden nun über setValueQueued gesetzt (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/115)
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases))
* @hobbyquaker Update node-red-node-email
* @hobbyquaker Update Node.js
* @hobbyquaker Update npm






# [v2.3.0](https://github.com/rdmtc/RedMatic/releases/v2.3.0) 2019-01-20T16:48:14Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler beim zuordnen von CUxD Events behoben (#138)
* @hobbyquaker Update RedMatic-HomeKit
  * HmIP-SAM hinzugefügt
  * Fensterkontakte können nun auch als GarageDoorOpener Service genutzt werden
* @hobbyquaker Update npm



# [v2.2.1](https://github.com/rdmtc/RedMatic/releases/v2.2.1) 2019-01-15T20:22:24Z

* @hobbyquaker Fehler beim setzen des Context Storage Pfad und Flushintervall behoben
* @hobbyquaker Update RedMatic-HomeKit
  * Fehler bei der Darstellung der Konfigurations-Dropdowns behoben




# [v2.2.0](https://github.com/rdmtc/RedMatic/releases/v2.2.0) 2019-01-15T17:01:17Z

* @hobbyquaker Update node-red-contrib-ccu
  * Workaround für Bug im hmipserver der dazu geführt hat dass sich sinnlose init-subscribers des VirtualDevices Interface angesammelt haben
  * WORKING_SLATS Datenpunkt des HM-LC-Ja1PBU wird ausgewertet (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/71)
* @hobbyquaker Update RedMatic-HomeKit
  * Tür/Fensterkontakte können nun als Door- oder Window-Service konfiguriert werden ([Diskussion](https://homematic-forum.de/forum/viewtopic.php?f=77&t=48406&p=485193))
  * Fehler behoben bei der Konfiguration des LightSensor von Bewegungsmeldern



# [v2.1.0](https://github.com/rdmtc/RedMatic/releases/v2.1.0) 2019-01-14T20:26:59Z

* @hobbyquaker Update RedMatic-HomeKit
  * Service-Typ für Switch-Kanäle konfigurierbar
  * Eventuellen Node-RED Crash beim Pairen der Bridge abgefangen
* @hobbyquaker Verzichtbare Verzeichnisse aus Backup ausgenommen (bisher nur für RaspberryMatic) (Siehe dazu #135)




# [v2.0.2](https://github.com/rdmtc/RedMatic/releases/v2.0.2) 2019-01-13T09:45:54Z

* a12a80d @hobbyquaker Weiteren (hoffentlich letzten) schwerwiegenden Fehler der contextStorage settings behoben (#134)




# [v2.0.1](https://github.com/rdmtc/RedMatic/releases/v2.0.1) 2019-01-13T08:50:08Z

* @hobbyquaker Schwerwiegenden Fehler behoben der u.U. zum Node-RED Absturz geführt hat weil contextStorage settings beim Update nicht vorhanden waren (#134)




# [v2.0.0](https://github.com/rdmtc/RedMatic/releases/v2.0.0) 2019-01-12T21:19:37Z

* @hobbyquaker Node.js auf Version 10 aktualisiert (#73)
* @hobbyquaker Neue Konfigurationsoptionen für Context Storage, Authentifizierung und das Node-RED Projects Feature hinzugefügt (#31 #132 #78 #45)
* @hobbyquaker Admin Auth default auf "Rega" - d.h. es wird der gleiche Username und das gleiche Passwort verwendet wie auch bei der Anmeldung am CCU WebUI
* @hobbyquaker coap-client für node-red-contrib-tradfri hinzugefügt (#131)
* @hobbyquaker Update RedMatic-HomeKit
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/75369a5f81ee822bcd3963b63ea686d6d265ea4e HmIP-SWDM-B/B1/B2 Varianten hinzugefügt
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/dc76cbe76685fe09720243ba579e762d965c2516 Propagieren des Boost von WTH auf TRV verzögert
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/fba2f7ca1aa1cf901b920213fbe8f3c6a28133bb Ventilstellungsmaximum aller mit einem WTH verknüpften TRVs wird ausgewertet
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/5dcb68e3c7706718b11beb4ab9dad9ab8757917c HM-LC-Ja1PBU-FM über `LEVEL_COMBINED` Datenpunkt steuern (sollte Probleme bei der Verwendung in HomeKit-Szenen beseitigen)



# [v1.10.12](https://github.com/rdmtc/RedMatic/releases/v1.10.12) 2019-01-03T17:38:27Z

* @hobbyquaker Update RedMatic-Homekit
   * Fix hmw-sen-sc-12
* @hobbyquaker Update RedMatic-HomeKit
  * Schwerwiegenden Fehler behoben der zum Node-RED Crash beim Pairing der Bridge führen konnte
* @hobbyquaker Fehler behoben default Settings beim automatischen Node-RED Neustart




# [v1.10.10](https://github.com/rdmtc/RedMatic/releases/v1.10.10) 2019-01-02T16:48:25Z

* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben der dazu führte das Services für eigentlich deaktivierte Kanäle angelegt wurden
  * Unterstützung für HMW-Sen-SC-12-* hinzugefügt
* @hobbyquaker Update node-red-contrib-ccu
  * Im _set value_ Node kann nun mittels regulären Ausdrücken gefiltert werden
  * Anzeige des letzten Wertes im Status der _sysvar_ und _get value_ Nodes





# [v1.10.9](https://github.com/rdmtc/RedMatic/releases/v1.10.9) 2018-12-30T18:05:33Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim Schließen der ccu-connection der dazu führen konnte das "init-Leichen" im hmipserver verblieben sind und u.U. die Funktion des hmipservers beeinträchtigt haben
* @hobbyquaker Update RedMatic-HomeKit
  * Anlegen von Homematic Geräten nun asynchron und mit kurzen Pausen um das Blockieren des Node-RED Prozesses beim Start zu vermeiden (hat u.U. zu `XmlRpc transport failed` Fehlermeldungen des rfd/hs485d beim Node-RED Start geführt)




# [v1.10.8](https://github.com/rdmtc/RedMatic/releases/v1.10.8) 2018-12-27T17:44:08Z


* @hobbyquaker Update node-red-contrib-ccu
  * Schwerwiegenden Fehler behoben der zum Node-RED Crash führt wenn ein updateDevices Event eingeht (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/773785c9bf5214c4ad5efde3798b90b172c06c33)
* @hobbyquaker Update RedMatic-HomeKit
  * Setzen des Boost-Modes an Wandthermostaten wird auch an alle direkt Verknüpften Heizungssteller gesendet (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/96)
  * Neuer Node zur Integration von Kameras in HomeKit






# [v1.10.5](https://github.com/rdmtc/RedMatic/releases/v1.10.5) 2018-12-26T14:57:37Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben - ON_TIME/RAMP_TIME wurde gespeichert obwohl nicht von Aktor unterstützt (https://github.com/HM-RedMatic/node-red-contrib-ccu/issues/40)
* @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung für hm-lc-rgbw-wm / hb-uni-rgb-led-ctrl Farbe hinzugefügt
  * Fehler behoben bei HmIP-SMI55 (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/98)
  * Setzen der On-Characteristic bei Dimmern verzögert (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/87)
  * Alle Mehrkanal Schaltaktoren können nun wahlweise als SingleAccessory konfiguriert werden



# [v1.10.4](https://github.com/rdmtc/RedMatic/releases/v1.10.4) 2018-12-23T19:34:24Z

* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben bei hm-wds-30-ot2
  * Unterstützung für diverse Homebrew Geräte hinzugefügt




# [v1.10.3](https://github.com/rdmtc/RedMatic/releases/v1.10.3) 2018-12-23T17:11:21Z

* @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung hinzugefügt für: HM-Sec-RHS-2, HM-WDS-30-OT, HM-WDS-30-OT-2, HB-UNI-Sen-Temp-IR




# [v1.10.2](https://github.com/rdmtc/RedMatic/releases/v1.10.2) 2018-12-23T12:43:44Z

* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben bei der Anzeige des Heizungsstatus des HmIP-(B)WTH
  * Unterstützung für diverse HmIP Geräte hinzugefügt
* @hobbyquaker Fehler behoben bei der Anzeige der Node-RED CPU Nutzung in Systemsteuerung



# [v1.10.1](https://github.com/rdmtc/RedMatic/releases/v1.10.1) 2018-12-22T20:04:52Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim bestimmen des Verbindungsstatus
  * Setzen von Rega-Systemvariablen wird verzögert falls Verbindung noch nicht aufgebaut ist
  * Minütliches loggen einiger Statistiken bei Loglevel debug oder trace
* @hobbyquaker RedMatic-HomeKit
  * Neues Accessory "Pseudobutton"
  * Unterstützung für diverse Homematic Geräte hinzugefügt
* @hobbyquaker node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.13.0))
* @hobbyquaker Anzeige der Node-RED CPU-Nutzung in Systemsteuerung
* @hobbyquaker node-red-contrib-sun-position hinzugefügt
* @hobbyquaker node-red-contrib-time-range-switch entfernt




# [v1.10.0](https://github.com/rdmtc/RedMatic/releases/v1.10.0) 2018-12-21T15:30:21Z

* @hobbyquaker Update node-red-contrib-ccu
  * diverse Optimierungen und Fehlerbehebungen, hauptsächlich betreffs Filterung im rpc-event Node
* @hobbyquaker Update RedMatic-HomeKit - 1.0 Release! 🎉
  * Unterstützung für diverse Geräte hinzugefügt
  * Luftfeuchte- und Helligkeitsensoren deaktivierbar
  * Keymatic Verhalten ("Open on Unlock") konfigurierbar
  * Bei Mehrkanal-Schaltaktoren können Kanäle einzeln deaktiviert werden
  * Boost Switch für Thermostate/Heizungssteller hinzugefügt (deaktivierbar)
  * Umfangreiches Refactoring, diverse Fehler behoben
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases))
* @hobbyquaker Update node-red-contrib-email
* @hobbyquaker Update node-red-node-sqlite
* @hobbyquaker Update Node.js, Update npm





# [v1.9.15](https://github.com/rdmtc/RedMatic/releases/v1.9.15) 2018-12-07T23:12:17Z

* @hobbyquaker Update RedMatic-HomeKit
  * Fix HmIP-SRH
* @hobbyquaker add jo binary




# [v1.9.14](https://github.com/rdmtc/RedMatic/releases/v1.9.14) 2018-12-07T21:53:51Z

* @hobbyquaker Update RedMatic-HomeKit
  * HmIP-SMI55 hinzugefügt
  * Fehler beim Erzeugen von Homematic Devices werden nun abgefangen und geloggt





# [v1.9.13](https://github.com/rdmtc/RedMatic/releases/v1.9.13) 2018-12-07T18:10:03Z

* @hobbyquaker fix log download
* @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.12.0))



# [v1.9.12](https://github.com/rdmtc/RedMatic/releases/v1.9.12) 2018-12-07T17:02:32Z

* @hobbyquaker Update RedMatic-HomeKit
  * Neue Geräte hinzugefügt: HmIP-SWSD, HmIP-BBL, HmIP-FBL, HmIP-BROLL, HmIP-FROLL
* @hobbyquaker Node-RED Restart-Verhalten konfigurierbar (#110)
* @hobbyquaker rfc2616 compliant linebreaks for http headers




# [v1.9.11](https://github.com/rdmtc/RedMatic/releases/v1.9.11) 2018-12-01T16:20:47Z

* @hobbyquaker Update RedMatic-HomeKit
  * add HmIP-eTRV-B1 support
* @hobbyquaker Update node.js to 8.14.0
* @hobbyquaker Komfortabler Log-Download im RedMatic UI (CCU WebUI Systemeinstellungen)
* @hobbyquaker rfc2616 compliant linebreaks for http headers
* @hobbyquaker Automatischer Neustart von Node-RED im falle eines Absturzes (#110)
* @hobbyquaker Issue Template hinzugefügt



# [v1.9.10](https://github.com/rdmtc/RedMatic/releases/v1.9.10) 2018-11-27T19:52:17Z

* @hobbyquaker Update node-red-contrib-ccu
  * Erkennung ob >=3.41.x mit reverse proxy vorhanden ist über `/etc/lighttpd/conf.d/proxy.conf` statt `/etc/config/rfd.conf` (Anpassung an RaspberryMatic 3.47.11.20181126)
  * RedMatic Absturz verhindern bei ungültigen Rega-Antworten




# [v1.9.9](https://github.com/rdmtc/RedMatic/releases/v1.9.9) 2018-11-25T20:51:35Z

* @hobbyquaker Bug Mitigation für RaspberryMatic 3.41.11.20181124 (https://github.com/jens-maus/RaspberryMatic/issues/480) - Content-Type header in cgis hinzugefügt (#108)
* @hobbyquaker Update Node.js auf 8.13.0
* @hobbyquaker Update node-red-contrib-combine
  * @Sineos Fehler im Logic Node behoben (https://github.com/HM-RedMatic/node-red-contrib-combine/issues/5)




# [v1.9.6](https://github.com/rdmtc/RedMatic/releases/v1.9.6) 2018-11-19T19:00:20Z

* @hobbyquaker update node-red-contrib-ccu
  * @psi-4ward _get value_ Node verbessert (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/34)
* @hobbyquaker update RedMatic-HomeKit
  * Versuch verlorene Raumzuordnungen beim CCU Reboot zu verhindern (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/86)




# [v1.9.5](https://github.com/rdmtc/RedMatic/releases/v1.9.5) 2018-11-18T20:11:59Z

* @hobbyquaker update node-red-contrib-ccu
  * diverse Fehler im _switch_ Node behoben
  * Neuer _get value_ Node für komfortablen Zugriff auf Datenpunkte und Systemvariablen




# [v1.9.4](https://github.com/rdmtc/RedMatic/releases/v1.9.4) 2018-11-18T14:49:40Z

* @hobbyquaker update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.11.0))
* @hobbyquaker update node-red-contrib-ccu
  * Fehlerbehandlung bei fehlgeschlagenen RPC Calls verbessert
* @hobbyquaker RedMatic-HomeKit
  * Weitere Geräte implementiert: HM-LC-Sw4-DR, HmIP-STH*, HmIP-SWO*, HM-Mod-Re-8
  * BatteryService für HmIP-PCBS ergänzt




# [v1.9.3](https://github.com/rdmtc/RedMatic/releases/v1.9.3) 2018-11-16T20:00:17Z

* @hobbyquaker update RedMatic-HomeKit
  * Service Typ WindowCovering für Rollläden (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/78)
  * Fehler behoben HM-LC-Ja1PBU (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/71)
  * Geräte hinzugefügt: HM-LC-AO-SM, HM-LC-Sw4-SM
* @hobbyquaker update node-red-contrib-ccu
  * Absturz verhindern bei ungültigen RPC params (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/31)
* @hobbyquaker update ain2 and unix-dgram prebuilt




# [v1.9.2](https://github.com/rdmtc/RedMatic/releases/v1.9.2) 2018-11-10T02:18:43Z

* @hobbyquaker update RedMatic-HomeKit
  * HM-LC-Ja1PBU-FM hinzugefügt (~~bisher ungetestet~~, leider noch Fehlerhaft, führt zum Node-RED Absturz. Falls Gerät vorhanden bitte im HomeKit Homematic Node deaktiveren) (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/71)
  * HmIP-SWDM hinzugefügt (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/73)
  * HmIP-eTRV-B hinzugefügt (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/72)




# [v1.9.1](https://github.com/rdmtc/RedMatic/releases/v1.9.1) 2018-11-06T22:42:33Z

* @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der u.U. dazu geführt hat dass Events von Dimmern und Rollläden/Jalousien ausgeblieben sind. (#83)
* @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben der dazu führte dass HmIP-Dimmer ungewollt auf 100% Helligkeit sprangen (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/61)
  * Unterstützung für HmIP-PDT hinzugefügt (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/67)
* @hobbyquaker Twitter and Feedparser Nodes aus Installationspaket entfernt. Müssen bei bedarf manuell nachinstalliert werden.
* @hobbyquaker Nicht Update-fähige Nodes (solche die Binärmodule enthalten: sqlite und serialport) im `lib` statt im `var` Verzeichnis ausliefern, verhindert dass über den Palette-Manager ein Update angestoßen wird das fehlschlägt und die Nodes lahmlegt (close #87)




# [v1.9.0](https://github.com/rdmtc/RedMatic/releases/v1.9.0) 2018-11-04T19:33:58Z

* @hobbyquaker node-red-node-serialport integriert (#85)




# [v1.8.0](https://github.com/rdmtc/RedMatic/releases/v1.8.0) 2018-11-04T12:21:23Z

* @hobbyquaker Update node-red-contrib-ccu
  * Anpassungen an neue Sicherheitsmaßnahmen in CCU Firmware 3.41
* @hobbyquaker Update RedMatic-HomeKit




# [v1.7.16](https://github.com/rdmtc/RedMatic/releases/v1.7.16) 2018-11-02T15:53:38Z

* @hobbyquaker Update node-red-contrib-ccu
  * Schwerwiegenden Fehler behoben der zum RedMatic Crash führen konnte (#80)
* @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung weiterer Geräte hinzugefügt



# [v1.7.15](https://github.com/rdmtc/RedMatic/releases/v1.7.15) 2018-10-31T21:30:17Z

* @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/releases/tag/0.19.5))
* @hobbyquaker Update node-red-contrib-ccu
  * HmIP ACTIVITY_STATE und PROCESS Datenpunkte auf msg.direction bzw. msg.working gemappt
* @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung einiger Geräte ergänzt



# [v1.7.14](https://github.com/rdmtc/RedMatic/releases/v1.7.14) 2018-10-29T17:02:14Z

* @hobbyquaker update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.10.1))
* @hobbyquaker set env `HOME` to `/usr/local/addons/redmatic/home` (close #76)




# [v1.7.13](https://github.com/rdmtc/RedMatic/releases/v1.7.13) 2018-10-28T14:42:45Z

* @hobbyquaker update node-red-contrib-ccu
  * Fehler bei Filterung nach Interface im "set value" Node behoben (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/25)
* @hobbyquaker Mitgelieferte Node-RED standard Nodes (email, feedparser, rbe und twitter) können nun mit dem Palette Manager aktualisiert werden (#74)




# [v1.7.12](https://github.com/rdmtc/RedMatic/releases/v1.7.12) 2018-10-27T14:44:55Z

* @hobbyquaker update node-red-dashboard
  * Changelog siehe https://github.com/node-red/node-red-dashboard/releases/tag/2.10.0
* @hobbyquaker update node-red-contrib-ccu
  * Fehler behoben: Cast von Boolean nach Integer bei Datenpunkten vom Typ Enum (https://github.com/hobbyquaker/RedMatic/issues/72)
  * Fehler behoben: JSON.parse schägt fehl (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/24)
  * diverse Fehler im Script Node behoben




# [v1.7.11](https://github.com/rdmtc/RedMatic/releases/v1.7.11) 2018-10-21T12:45:58Z

* @hobbyquaker update RedMatic-HomeKit (Beta)
  * diverse Fehler behoben die u.U. dazu geführt haben dass keine Antwort mehr von der Bridge erhalten wurde
* @hobbyquaker update node-red-contrib-ccu
  * MQTT Node: Fehler behoben der dazu führte dass *_NOTWORKING message ausblieb



# [v1.7.10](https://github.com/rdmtc/RedMatic/releases/v1.7.10) 2018-10-20T15:53:13Z

* @hobbyquaker update RedMatic-HomeKit (Beta)
  * Fehlerbehebung: Universal Accessory optionale Charakteristiken (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/44)




# [v1.7.9](https://github.com/rdmtc/RedMatic/releases/v1.7.9) 2018-10-20T12:55:12Z

* @hobbyquaker update node-red-contrib-ccu
  * Anzeige des Namens des Rega-Scripts in Fehlermeldung bei JSON.parse Fehlern
* @hobbyquaker update RedMatic-HomeKit
  * diverse Fehlerbehebungen und Verbesserungen



# [v1.7.8](https://github.com/rdmtc/RedMatic/releases/v1.7.8) 2018-10-19T22:32:52Z

* @hobbyquaker update RedMatic-HomeKit (beta)
  * diverse Fehlerbehebungen
  * neue Homematic Geräte unterstützt
  * neues "Universal Accessory"




# [v1.7.7](https://github.com/rdmtc/RedMatic/releases/v1.7.7) 2018-10-18T18:59:55Z

* de247d3 @hobbyquaker update RedMatic-HomeKit
  * Schwerwiegende Fehler die zum Node-RED Crash führen konnten behoben (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/54)




# [v1.7.6](https://github.com/rdmtc/RedMatic/releases/v1.7.6) 2018-10-18T16:02:45Z

* @hobbyquaker update node-red-contrib-ccu
* @hobbyquaker update RedMatic-HomeKit (Beta)
  * Unterstützung von einigen neuen Geräten
  * Geräte können deaktiviert werden
  * diverse Fehlerbehebungen und Verbesserungen




# [v1.7.5](https://github.com/rdmtc/RedMatic/releases/v1.7.5) 2018-10-14T19:38:33Z

* @hobbyquaker update RedMatic-HomeKit (still Beta)
  * diverse Fehlerbehebungen und Verbesserungen
  * HMIP-eTRV hinzugefügt (noch nicht ganz fertig, siehe https://github.com/hobbyquaker/RedMatic-HomeKit/issues/10)




# [v1.7.4](https://github.com/rdmtc/RedMatic/releases/v1.7.4) 2018-10-14T13:45:27Z

* @hobbyquaker update RedMatic-HomeKit (still Beta)
  * Fehlerbehebung (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/50)



# [v1.7.3](https://github.com/rdmtc/RedMatic/releases/v1.7.3) 2018-10-14T12:27:50Z

* @hobbyquaker update RedMatic-HomeKit (still Beta)
  * Diverse Fehlerbehebungen und Verbesserungen
  * Unterstützung von mehr Homematic Geräten
  * Neues universelles Accessory "Event"




# [v1.7.2](https://github.com/rdmtc/RedMatic/releases/v1.7.2) 2018-10-13T00:24:52Z

* @hobbyquaker update RedMatic-HomeKit (Beta)
  * diverse Fehlerbehebungen und Verbesserungen
  *  [weitere Geräte implementiert](https://github.com/hobbyquaker/RedMatic-HomeKit/tree/master/homematic-devices)



# [v1.7.1](https://github.com/rdmtc/RedMatic/releases/v1.7.1) 2018-10-12T16:27:55Z

* @hobbyquaker update node-red-contrib-ccu
  * added some randomness to rpc init identifier (prevent problems when multiple instances are connected to the same ccu)
* @hobbyquaker update RedMatic-HomeKit (still alpha/experimental, subject to change)




# [v1.7.0](https://github.com/rdmtc/RedMatic/releases/v1.7.0) 2018-10-08T16:41:10Z

* @hobbyquaker **Neu:** [RedMatic-HomeKit](https://github.com/hobbyquaker/RedMatic-HomeKit) (alpha/experimental version)
* @hobbyquaker Update RedMatic-WebApp 
  * fix https://github.com/hobbyquaker/RedMatic-WebApp/issues/24



# [v1.6.0](https://github.com/rdmtc/RedMatic/releases/v1.6.0) 2018-10-07T08:57:52Z

* @hobbyquaker update node-red-contrib-ccu
* @hobbyquaker __Neu__: [RedMatic WebApp](https://github.com/hobbyquaker/RedMatic-WebApp) (beta version)




# [v1.5.3](https://github.com/rdmtc/RedMatic/releases/v1.5.3) 2018-10-04T16:16:15Z

* @hobbyquaker update node-red-contrib-ccu
  * [add api endpoint to get room list](https://github.com/hobbyquaker/node-red-contrib-ccu/commit/9b073d0f3eac2d19934f06a06bf11766a38e6dce)
  * [setValue Node: fix functions filter](https://github.com/hobbyquaker/node-red-contrib-ccu/commit/2f3ec31936dca9a0a6236252639231ba1bbb86e6) https://github.com/hobbyquaker/node-red-contrib-ccu/issues/20
  * [include channel type blind in working detection workaround](https://github.com/hobbyquaker/node-red-contrib-ccu/commit/4454ab5b0d6556085e3cef147cc4097eb586d179)




# [v1.5.2](https://github.com/rdmtc/RedMatic/releases/v1.5.2) 2018-09-18T16:01:44Z

* @hobbyquaker Update Node-RED
* @hobbyquaker Update node-red-contrib-ccu
  * Sysvar Node: gibt alle Systemvariablen aus wenn keine Systemvariable selektiert wurde
  * Fix: Exception verhindern wenn RPC call mit leeren Params eingeht
  * Fix: Ping Calls nicht im txCounter zählen, Pong-Events nicht im rxCounter zählen
  * updateDevice, replaceDevice und readdedDevice RPC methoden implementiert




# [v1.5.1](https://github.com/rdmtc/RedMatic/releases/v1.5.1) 2018-09-15T19:07:35Z

* @hobbyquaker Update node-red-contrib-ccu
  * Value Node akzeptiert `channelName` am Input
  * Fix: re-init bei HmIP Ping Timeout #59 
* @hobbyquaker Update RedMatic-LED
  * Nutzung von `/sys/class/leds` statt `/sys/devices/platform/leds`




# [v1.5.0](https://github.com/rdmtc/RedMatic/releases/v1.5.0) 2018-09-14T18:01:35Z

* @hobbyquaker Neuer Node zum Ansteuern der CCU3/RPI-RF-MOD LED.
* @hobbyquaker Update node-red-contrib-ccu
  * MQTT Node rx/tx counter
  * Fix: MQTT Node publiziert PRESS_SHORT/PRESS_LONG beim Start




# [v1.4.0](https://github.com/rdmtc/RedMatic/releases/v1.4.0) 2018-09-13T21:01:09Z

* @hobbyquaker Fix: lighttpd_ssl.conf Patch um RedMatic auf CCU3 auch via https verfügbar zu machen
* @hobbyquaker Update node-red-contrib-ccu
  * Neuer Node "set Value" um mehrere Aktoren auf einmal zu setzen (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/20)
  * Fix: Fehler behoben bei Autovervollständigung
  * Logging von "PONG" Events
* @hobbyquaker  Update node-red-dashboard
* @hobbyquaker Update Node-RED
* @hobbyquaker Update Node.js




# [v1.3.0](https://github.com/rdmtc/RedMatic/releases/v1.3.0) 2018-08-31T09:47:01Z

* @hobbyquaker update node-red-contrib-ccu
  * new node to ease MQTT connection of the ccu
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/5
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/8
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/16
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/17
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/18



# [v1.2.1](https://github.com/rdmtc/RedMatic/releases/v1.2.1) 2018-08-25T17:29:58Z

* @hobbyquaker update node-red
* @hobbyquaker update node-red-dashboard
* @hobbyquaker update node-red-contrib-ccu
* @hobbyquaker update node-red-node-sqlite
* @hobbyquaker add custom lighttpd config for ccu3




# [v1.2.0](https://github.com/rdmtc/RedMatic/releases/v1.2.0) 2018-08-24T12:17:27Z

* @hobbyquaker update node-red-contrib-ccu (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/15), improve paramsetDescription cache handling, renew paramsetDescriptions on HmIP Device Firmware Updates




# [v1.1.1](https://github.com/rdmtc/RedMatic/releases/v1.1.1) 2018-08-19T22:31:37Z

* @hobbyquaker try to prevent unwanted module deletion on npm calls through palette manager (#56)




# [v1.1.0](https://github.com/rdmtc/RedMatic/releases/v1.1.0) 2018-08-16T17:04:37Z

* @hobbyquaker adapt settings and config ui to persistable context (#40)
* @hobbyquaker update node-red-contrib-ccu to 1.1.20 (activate ping on CUxD, available since CUxD 2.1.0)
* @hobbyquaker update node-red-contrib-ccu to 1.1.19 (#53)
* @hobbyquaker update node.js to 8.11.4
* @hobbyquaker update npm to 6.4.0
* @hobbyquaker update node-red to 0.19.1




# [v1.0.16](https://github.com/rdmtc/RedMatic/releases/v1.0.16) 2018-08-13T16:19:51Z

* @hobbyquaker update node-red-contrib-ccu (try to improve #52)
* @hobbyquaker update node-red-node-sqlite
* @hobbyquaker update node-red-contrib-time-range-switch




# [v1.0.15](https://github.com/rdmtc/RedMatic/releases/v1.0.15) 2018-08-10T18:33:58Z

* @hobbyquaker include node-red-node-sqlite (#51)
* @hobbyquaker cleanup prebuilt, adapt build.sh




# [v1.0.14](https://github.com/rdmtc/RedMatic/releases/v1.0.14) 2018-08-05T12:55:01Z

* @hobbyquaker improve service status display on stopping
* @hobbyquaker improve error 503 page (closes #38)




# [v1.0.13](https://github.com/rdmtc/RedMatic/releases/v1.0.13) 2018-08-05T09:14:31Z

* @hobbyquaker update node-red-contrib-ccu
  * fix sysvar output filter (cache and change)



# [v1.0.12](https://github.com/rdmtc/RedMatic/releases/v1.0.12) 2018-08-03T16:20:03Z

* @hobbyquaker update node-red-contrib-ccu
  * sysvar node enhancements (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/13)
* @hobbyquaker update npm




# [v1.0.11](https://github.com/rdmtc/RedMatic/releases/v1.0.11) 2018-07-29T16:31:19Z

* @hobbyquaker update node-red-contrib-ccu
  * fix display node HM-Dis-EP-WM55 line assignment https://github.com/hobbyquaker/node-red-contrib-ccu/issues/14



# [v1.0.10](https://github.com/rdmtc/RedMatic/releases/v1.0.10) 2018-07-27T15:52:05Z

* @hobbyquaker update node-red-contrib-ccu
  * prevent selection of disabled interfaces (#37)
  * various fixes and improvements
* @hobbyquaker create random encryption key for credentials stored in node-red (implements #39)
* @hobbyquaker improve init script, increase log verbosity
* @hobbyquaker log directly to syslog via unix socket
* @hobbyquaker organize prebuilt binaries




# [v1.0.9](https://github.com/rdmtc/RedMatic/releases/v1.0.9) 2018-07-24T17:17:45Z

* @hobbyquaker update node-red-contrib-ccu
  * fixes and enhancements for `display` node
  * fixes and enhancements for `signal` node
  * fix destruction of rega polling




# [v1.0.8](https://github.com/rdmtc/RedMatic/releases/v1.0.8) 2018-07-22T19:56:38Z

* @hobbyquaker update node-red-contrib-ccu (fix string sysvars)




# [v1.0.7](https://github.com/rdmtc/RedMatic/releases/v1.0.7) 2018-07-21T20:18:48Z

* @hobbyquaker update node-red-contrib-ccu (#32, https://github.com/hobbyquaker/node-red-contrib-ccu/issues/10)
* @hobbyquaker update node-red-dashboard
* @hobbyquaker update node-red-contrib-time-range-switch
* @hobbyquaker update npm
* @hobbyquaker update third party licenses




# [v1.0.6](https://github.com/rdmtc/RedMatic/releases/v1.0.6) 2018-07-12T19:41:22Z

* @hobbyquaker fix WebUI buttons (fix #29)




# [v1.0.5](https://github.com/rdmtc/RedMatic/releases/v1.0.5) 2018-07-12T19:11:58Z
* @hobbyquaker update node-red-contrib-ccu (fix #26)


# [v1.0.4](https://github.com/rdmtc/RedMatic/releases/v1.0.4) 2018-07-12T19:05:57Z

* @hobbyquaker update third party licenses
* @hobbyquaker icons
* @hobbyquaker logo link
* @hobbyquaker redmatic button
* @hobbyquaker fix restart cmd (fix #28)




# [v1.0.3](https://github.com/rdmtc/RedMatic/releases/v1.0.3) 2018-07-11T17:12:08Z

* @hobbyquaker improve config ui
* @hobbyquaker update node-red-contrib-ccu (fix #27)
* @hobbyquaker update node-red-dashboard
* @hobbyquaker show node-red process status and memory consumption
* @hobbyquaker refactor cgis, improve session validation




# [v1.0.2](https://github.com/rdmtc/RedMatic/releases/v1.0.2) 2018-07-02T17:40:29Z

* @hobbyquaker update node-red-contrib-ccu (Anzeige des Verbindungs-Status)



# [v1.0.1](https://github.com/rdmtc/RedMatic/releases/v1.0.1) 2018-06-27T19:49:21Z

* @hobbyquaker update node-red-contrib-combine




# [v1.0.0](https://github.com/rdmtc/RedMatic/releases/v1.0.0) 2018-06-25T17:14:20Z

* @hobbyquaker update node-red-contrib-combine
* @hobbyquaker remove build number from tag, show in changelog





# [v1.0.0-rc.7+120](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.7+120) 2018-06-22T19:19:29Z

* @hobbyquaker update node-red-contrib-combine




# [v1.0.0-rc.6+119](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.6+119) 2018-06-22T18:04:45Z

* @hobbyquaker show license in web ui
* @hobbyquaker fix www dir symlink




# [v1.0.0-rc.5+118](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.5+118) 2018-06-20T20:30:15Z

* @hobbyquaker adds jq to preserve extra nodes in var/package.json, remove migration steps from old beta versions





# [v1.0.0-rc.4+117](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.4+117) 2018-06-17T16:48:18Z

* @hobbyquaker fix git permissions (#18)




# [v1.0.0-rc.3+115](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.3+115) 2018-06-17T16:23:16Z

* @hobbyquaker update node-red-contrib-combine
* @hobbyquaker add git (#18)




# [v1.0.0-rc.2+114](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.2+114) 2018-06-16T11:29:16Z

* @hobbyquaker update node-red-contrib-combine
* @hobbyquaker add time-range-switch




# [v1.0.0-rc.1+113](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.1+113) 2018-06-15T21:07:30Z

* @hobbyquaker update node-red-contrib-ccu (fix #17)




# [v1.0.0-rc.0+112](https://github.com/rdmtc/RedMatic/releases/v1.0.0-rc.0+112) 2018-06-13T20:01:39Z

* @hobbyquaker explicit owner/group (fix #16)
* @hobbyquaker update nodejs
* @hobbyquaker get node version from package.json




# [v1.0.0-beta.13+109](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.13+109) 2018-06-11T16:02:59Z

* @hobbyquaker skip install and test step
* @hobbyquaker combine dependencies for david-dm




# [v1.0.0-beta.12+105](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.12+105) 2018-06-11T15:25:31Z

* @hobbyquaker update node-red-contrib-ccu




# [v1.0.0-beta.11+104](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.11+104) 2018-06-10T19:32:05Z

* @hobbyquaker remove node-red-admin
* @hobbyquaker tweak changelog, include all versions again





# [v1.0.0-beta.10+102](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.10+102) 2018-06-10T18:30:12Z

* @hobbyquaker config ui
* @hobbyquaker reorganize directory structure
* @hobbyquaker update node-red-contrib-ccu


# [v1.0.0-beta.9+101](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.9+101) 2018-06-06T17:57:43Z
* @hobbyquaker fix www links update
* @hobbyquaker update node-red-contrib-ccu
* @hobbyquaker fix custom error page
* @hobbyquaker fix webui restart msg


# [v1.0.0-beta.8+99](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.8+99) 2018-06-06T15:57:11Z

* @hobbyquaker reorganize directory structure (#14)


# [v1.0.0-beta.7+97](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.7+97) 2018-06-03T18:06:52Z
* @hobbyquaker update node-red-contrib-ccu
* @hobbyquaker update readme


# [v1.0.0-beta.6+96](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.6+96) 2018-06-03T11:23:02Z
* @hobbyquaker update node-red-contrib-ccu


# [v1.0.0-beta.5+95](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.5+95) 2018-06-02T06:37:24Z

* @hobbyquaker fix uninstall


# [v1.0.0-beta.4+90](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.4+90) 2018-06-01T18:49:56Z
* @hobbyquaker fix links in systemsteuerung


# [v1.0.0-beta.3+89](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.3+89) 2018-06-01T18:32:48Z

* @hobbyquaker update node-red-contrib-ccu - set localhost as default ccu


# [v1.0.0-beta.2+79](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.2+79) 2018-05-31T19:34:49Z

* @hobbyquaker fix update check
* @hobbyquaker update npm
* @hobbyquaker add deps badge


# [v1.0.0-beta.1+75](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.1+75) 2018-05-31T16:38:24Z

* @hobbyquaker explicit versions


# [v1.0.0-beta.0+68](https://github.com/rdmtc/RedMatic/releases/v1.0.0-beta.0+68) 2018-05-31T16:13:40Z
* @hobbyquaker renaming, bump major
* @hobbyquaker renaming, logo
* @hobbyquaker add logo
* @hobbyquaker add logo


# [v0.0.26+65](https://github.com/rdmtc/RedMatic/releases/v0.0.26+65) 2018-05-29T18:26:17Z
* @hobbyquaker update node-red-contrib-ccu (#12)


# [v0.0.25+64](https://github.com/rdmtc/RedMatic/releases/v0.0.25+64) 2018-05-27T12:15:10Z
* @hobbyquaker update node-red-contrib-ccu (#11)
* @hobbyquaker wording
* @hobbyquaker append build number with + (follows semver)


# [v0.0.24-63](https://github.com/rdmtc/RedMatic/releases/v0.0.24-63) 2018-05-23T16:19:50Z
* @hobbyquaker update node-red-contrib-ccu (#10)
* @hobbyquaker update licenses


# [v0.0.23-61](https://github.com/rdmtc/RedMatic/releases/v0.0.23-61) 2018-05-21T20:10:58Z

* @hobbyquaker add node-red-contrib-mqtt-json
* @hobbyquaker update Node.js to 8.11.2


# [v0.0.22-60](https://github.com/rdmtc/RedMatic/releases/v0.0.22-60) 2018-05-20T13:11:59Z

* @hobbyquaker update node-red-contrib-ccu (#8)


# [v0.0.21-59](https://github.com/rdmtc/RedMatic/releases/v0.0.21-59) 2018-05-15T19:05:51Z

* @hobbyquaker Update node-red-contrib-ccu (#7)
* @hobbyquaker fix issue tracker link


# [v0.0.20-57](https://github.com/rdmtc/RedMatic/releases/v0.0.20-57) 2018-05-11T15:35:45Z

* @hobbyquaker update node-red-contrib-ccu (#6)


# [v0.0.19-56](https://github.com/rdmtc/RedMatic/releases/v0.0.19-56) 2018-05-08T17:33:44Z
* @hobbyquaker update node-red-dashboard
* @hobbyquaker fix wiki link


# [v0.0.18-54](https://github.com/rdmtc/RedMatic/releases/v0.0.18-54) 2018-05-05T19:10:34Z
* @hobbyquaker update node-red-contrib-ccu


# [v0.0.17-53](https://github.com/rdmtc/RedMatic/releases/v0.0.17-53) 2018-05-05T17:33:22Z
* @hobbyquaker update node-red-contrib-ccu


# [v0.0.16-52](https://github.com/rdmtc/RedMatic/releases/v0.0.16-52) 2018-05-05T16:19:00Z
* @hobbyquaker add node version
* @hobbyquaker fix module links
* @hobbyquaker fix release tag
* @hobbyquaker bump version, update node-red-contrib-ccu
* @hobbyquaker auto create versions file from all installed modules


# [v0.0.15-48](https://github.com/rdmtc/RedMatic/releases/v0.0.15-48) 2018-05-02T21:10:34Z
* @hobbyquaker fix addon uninstall


# [v0.0.14-47](https://github.com/rdmtc/RedMatic/releases/v0.0.14-47) 2018-05-02T19:59:08Z
* @hobbyquaker fix hm_addons.cfg entries ...


# [v0.0.13-46](https://github.com/rdmtc/RedMatic/releases/v0.0.13-46) 2018-05-02T19:32:53Z
* @hobbyquaker chmod a+x update_addon
* @hobbyquaker fix #3
* @hobbyquaker bump version
* @hobbyquaker fix #3


# [v0.0.12-43](https://github.com/rdmtc/RedMatic/releases/v0.0.12-43) 2018-05-02T19:01:39Z
* @hobbyquaker update node-red-contrib-ccu
* @hobbyquaker typo


# [v0.0.11-41](https://github.com/rdmtc/RedMatic/releases/v0.0.11-41) 2018-05-01T18:27:15Z
* @hobbyquaker update node-red-contrib-ccu, bump version
* @hobbyquaker article links


# [v0.0.10-40](https://github.com/rdmtc/RedMatic/releases/v0.0.10-40) 2018-05-01T16:39:02Z
* @hobbyquaker update node-red-contrib-ccu, bump version
* @hobbyquaker emphasize hints
* @hobbyquaker emphasize hints
* @hobbyquaker add headings
* @hobbyquaker fix wiki link
* @hobbyquaker remove node-red-admin link
* @hobbyquaker password auth hint


# [v0.0.9-34](https://github.com/rdmtc/RedMatic/releases/v0.0.9-34) 2018-04-30T21:38:16Z

* @hobbyquaker addon update check
* @hobbyquaker fix update
* @hobbyquaker export env vars
* @hobbyquaker move npm env var to init script
* @hobbyquaker create backup of settings.js on update
* @hobbyquaker npm install directly in lib/node_modules
* @hobbyquaker include node-red-admin
* @hobbyquaker add CCU1/2 hint
* @hobbyquaker fix typos, add license text
* @hobbyquaker add download counter badge
* @hobbyquaker add release badge
* @hobbyquaker auto-generate changelog for release page on travis, cleanup build.sh


# [v0.0.8-16](https://github.com/rdmtc/RedMatic/releases/v0.0.8-16) 2018-04-29T17:36:48Z


# [v0.0.7-14](https://github.com/rdmtc/RedMatic/releases/v0.0.7-14) 2018-04-29T16:50:45Z


# [v0.0.6-12](https://github.com/rdmtc/RedMatic/releases/v0.0.6-12) 2018-04-29T00:59:57Z


# [v0.0.5-11](https://github.com/rdmtc/RedMatic/releases/v0.0.5-11) 2018-04-29T00:33:42Z


# [v0.0.4-10](https://github.com/rdmtc/RedMatic/releases/v0.0.4-10) 2018-04-29T00:12:29Z


# [v0.0.3-9](https://github.com/rdmtc/RedMatic/releases/v0.0.3-9) 2018-04-28T21:36:21Z


