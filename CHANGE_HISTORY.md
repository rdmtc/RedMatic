
# v4.2.0 2019-04-17T17:59:47Z

* c0dd219 @hobbyquaker Update RedMatic-HomeKit
  * Maximale Anzahl von Accessories je Bridge auf 150 erhöht
  * Unterstützung für Heizungsgruppen hinzugefügt (https://github.com/rdmtc/RedMatic-HomeKit/issues/131)
  * HmIP-WTH, HmIP-eTRV-* Fehler behoben bei der Anzeige der Batterie-Warnung
* 9bd2ea0 @hobbyquaker RedMatic-UI: Fehler behoben Statusanzeige Node-RED Prozess falls Restart-Kommando Fehler zurückgibt.



# v4.1.3 2019-04-16T19:13:45Z

* 7b56d79 @hobbyquaker Startscript verbessert, das Neustarten von Node-RED über das RedMatic UI sollte nun zuverlässig funktionieren (#189)



# v4.1.2 2019-04-13T16:00:43Z

* 1299484 @hobbyquaker Update node-red-contrib-sun-position
* 1ebf7a7 bce479e 3adbca2 731d7d1 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu führen konnte das nachfolgende Änderungen im Flow die Statusanzeige von _Value_ und _Sysvar_ Nodes geändert haben (https://github.com/rdmtc/node-red-contrib-ccu/issues/77)
  * Fehler behoben der dazu führte dass Datenpunkte des Maintenance-Kanals (:0) und `PRESS_*` Datenpunkte nicht initial angelegt wurden (https://github.com/rdmtc/node-red-contrib-ccu/issues/76)
  * Fehler behoben der dazu führte dass keine "speziellen" Werte gesetzt werden konnten (https://github.com/rdmtc/node-red-contrib-ccu/issues/74)


# v4.1.1 2019-04-11T17:04:38Z

* d1deba2 @hobbyquaker Update node-red-node-serialport
* 115a87a @hobbyquaker Update node-red-node-email
* 0005b5a @hobbyquaker Sortierung und Filter im RedMatic Package Manager UI (#184)



# v4.1.0 2019-04-08T17:40:49Z

* bd3af68 @hobbyquaker Update node-red-contrib-ccu
  * _set value_ Node: Fehler behoben bei der Anzeige des aktuellen Werts im Flow-Editor
* b5a3660 @hobbyquaker (redmatic-pkg-)node-red-contrib-gpio hinzugefügt
* b5a3660 @hobbyquaker Update RedMatic-LED
  * An neuen Monit-Service in RaspberryMatic 3.45.5.20190330 angepasst 
* 9c53530 @hobbyquaker Update node-red-node-serialport
* 3485852 @hobbyquaker Update node-red-contrib-sun-position
* 0647889 @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))



# v4.0.5 2019-04-02T20:32:12Z

* b9a24b7 7dac950 bf01a19 @hobbyquaker Fehler behoben der u.U. die Installation von redmatic-pkg-* Paketen verhindert hat (#178)



# v4.0.3 2019-04-01T16:13:24Z

* 21a4029 @hobbyquaker Update RedMatic-HomeKit
  * Universal Accessory: Anpassungen für Television Service (automatisches Linken weiterer Services)
* 1c8ef20 @hobbyquaker RedMatic UI weist auf Updates hin (close #177)
* 527d7fc @hobbyquaker Update node-red-contrib-ccu
* e3a340d @hobbyquaker Update node-red-contrib-smartmeter
* f1ea09b @hobbyquaker Telemetrie ([Wiki](https://github.com/rdmtc/RedMatic/wiki/Telemetry))



# v4.0.2 2019-03-24T20:46:43Z

* 29f2f0b @hobbyquaker Improve log output of redmatic-pkg upgrade
* e7597db @hobbyquaker Fix redirection of redmatic-pkg output to logfile
* e0f836c @hobbyquaker Fix automatic Update of redmatic-pkg-* packages after RedMatic Update (once more 😕)


# v4.0.1 2019-03-24T15:56:55Z

* efde3ad @hobbyquaker Update RedMatic-HomeKit
  * Überflüssigen BatteryService bei HmIP-BWTH(24) entfernt (https://github.com/rdmtc/RedMatic-HomeKit/issues/133)
* 9b2caa6 @hobbyquaker Fehler behoben beim automatischen Update der redmatic-pkg-* Packages im Zuge von RedMatic Updates.
* 7d5baa5 @hobbyquaker node-red-contrib-zigbee hinzugefügt (**Alpha-Version!** API nicht finalisiert, keine Doku, höchstwahrscheinlich viele Bugs)
* 5432798 @hobbyquaker Diverse Verbesserungen des RedMatic UI
* 4c6dc04 @hobbyquaker Diverse Verbesserungen des Log Downloads


# v4.0.0 2019-03-24T12:36:35Z

* 6532f1f @hobbyquaker Einfaches Paketmanagement für Nodes mit Binärmodulen hinzugefügt (#170)
  Zusätzliche Nodes die Aufgrund von Binärabhängigkeiten nicht über den Palette Manager installiert werden können sind nun nich mehr im RedMatic Installationspaket enthalten, sondern können unter dem neuen Menüpunkt "Packages" im RedMatic UI installiert werden. Damit konnte die Größe des Installationspakets halbiert werden, dies sollte Probleme wie #169 vermeiden und die RedMatic Installation bzw. Updates sollten schneller vonstatten gehen. Es ist empfehlenswert nicht verwendete Nodes dort zu deinstallieren um die Startzeit und Speichernutzung von Node-RED zu reduzieren.


# v3.3.2 2019-03-23T11:13:10Z

* 254dd1f @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu führte das diverse Nodes im Status "partly connected" oder "disconnected" blieben und nicht funktionierten (#172)



# v3.3.1 2019-03-22T18:10:26Z

* ee7fa4e @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* d8a114a @hobbyquaker Update node-red-contrib-ccu
  * Crash verhindern falls binrpc/xmlrpc Ports bereits belegt sind
* d8a114a @hobbyquaker Update node-red-contrib-mysensors
* d8a114a @Hypnos3  Update node-red-contrib-sun-position
* d8a114a @hobbyquaker Update node-red-contrib-combine



# v3.3.0 2019-03-19T17:33:06Z

* 6accc06 @hobbyquaker Update RedMatic-HomeKit
  * Garage Accessory: Fehlerbehebung ON_TIME
  * Garage Accessory: Input/Output hinzugefügt
  * Neues Accessory: Irrigation (Bewässerung)
* 40ebcf6 @hobbyquaker Update node-red-contrib-combine
  * Neue Option für List und Statistic Node um boolean false Werte zu ignorieren
* 1dc8159 @hobbyquaker Revert ccu3 patches on uninstall



# v3.2.0 2019-03-18T20:54:02Z

* 2139c3c @hobbyquaker Update RedMatic-HomeKit
  * Garage Accessory: Fehler behoben bei Verwendung zweier Sensoren (https://github.com/rdmtc/RedMatic-HomeKit/issues/130)
* 504e59a @hobbyquaker Update node-red-contrib-modbus serialport binary
* e8cb82a @hobbyquaker Update node-red-contrib-mysensors
* b09b480 @hobbyquaker patch ccu3 backup routine to respect nobackup tag (close #168)
* 414f594 @hobbyquaker Update 3rd Party Licenses



# v3.1.2 2019-03-16T09:20:22Z

* 416dadd @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* cba9d5c @hobbyquaker Update node-red-contrib-modbus



# v3.1.1 2019-03-14T21:19:40Z

* 9330e8c @hobbyquaker Update RedMatic-HomeKit 
  * Garage Accessory, Verbesserung des Verhaltens bei Richtungsumkehr (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/130)



# v3.1.0 2019-03-14T17:48:51Z

* 9e790e5 @hobbyquaker Update RedMatic-WebApp 
  * Schwerwiegenden Fehler behoben der zum Node-RED Crash geführt hat (https://github.com/HM-RedMatic/RedMatic-WebApp/issues/26)
* f8e5b2b @hobbyquaker Möglichkeit Node-RED im "Safe Mode" zu starten (#164)
* c2af3a9 @hobbyquaker Update node-red-contrib-ccu
  * Clonen von Sysvar Messages um Flow-Übergreifende Änderungen der Message zu verhindern (https://github.com/HM-RedMatic/node-red-contrib-ccu/issues/67)



# v3.0.1 2019-03-13T18:51:57Z

* cd6fa5d @hobbyquaker Update RedMatic-HomeKit
  * Garage Accessory: Konfigurierbare Pausenzeit bei Richtungsumkehr (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/130)


# v3.0.0 2019-03-12T21:00:25Z

* ddce80a @hobbyquaker Update node-red ([Video](https://youtu.be/C6w2H3BPauc), [Changelog](https://github.com/node-red/node-red/blob/master/CHANGELOG.md))
* f3d660c @Hypnos3  update node-red-contrib-sun-position
* 4a892ee @hobbyquaker add node-red-contrib-rfxcom (#159)



# v2.9.0 2019-03-10T14:34:11Z

* c666fab @hobbyquaker Update RedMatic-HomeKit
  * Homematic Garage Accessory verbessert (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/130 https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/128)
  * Unterstützung für HmIPW-DRS8/16 hinzugefügt
  * Unterstützung für HmIPW-DRI16/32 hinzugefügt
  * HAP-Nodejs Update
  * TV-Fernbedienungs Services im _Universal Accessory_ hinzugefügt
* c666fab @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben bei der Filterung im _Set Value_ Node
  * Möglichkeit nach Kanal-Index zu filtern im _Set Value_ und _RPC Event_ Node hinzugefügt
  * Fehler beim `lc` (Lastchange) Attribut des _Sysvar_ Node behoben
  * Testautomatisierung
* c666fab @Hypnos3 Update node-red-contrib-sun-position
* c666fab @hobbyquaker Update dependencies
  * Node.js
  * npm
  * node-red-node-serialport
* da850ad @hobbyquaker start version range at 0.0.0 to satisfy david-dm
* a7249f1 @hobbyquaker remove node-red-contrib-mqtt-json



# v2.8.2 2019-03-02T09:15:12Z

* ef641c4 @hobbyquaker Update Dependencies
  * Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.14.0))
  * Update node-red
  * Update node-red-node-email
  * Update Node.js



# v2.8.1 2019-02-21T20:22:59Z

* 074dde1 @hobbyquaker Update node-red-contrib-ccu
  * Workaround wegen ausbleibender Events von HmIP-RF (hmipserver) ab CCU Firmware 3.43.15 implementiert ([Forum](https://homematic-forum.de/forum/viewtopic.php?f=77&t=49224))
  * Bei JSON.parse Fehlern beim Abfragen von Rega-Variablen wird nun eine Debug Datei erzeugt um diese Fehler besser analysieren zu können (#153)


# v2.8.0 2019-02-19T20:26:53Z

* e26e118 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim Ansteuern der LED des HmIP-MP3P mit dem Signal Node
* c4914b4 @hobbyquaker node-red-contrib-mysensors hinzugefügt (#154)



# v2.7.1 2019-02-18T20:03:11Z

* b230acf @hobbyquaker Update RedMatic-HomeKit
  * Verbesserung beim Richtungswechsel von Rollläden (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/121)
  * Garage Accessory: Unterstützung für HMW-Sen-SC-* (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/42)
* b230acf @hobbyquaker Update node-red-contrib-sun-position



# v2.7.0 2019-02-17T20:15:35Z

* 539076d @hobbyquaker Update node-red-contrib-ccu
  * Signal Node: Unterstützung für HmIP-MP3P (https://github.com/HM-RedMatic/node-red-contrib-ccu/issues/59)
  * Signal Node: Unterstützung für HmIP-BSL (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/0d288f18d1586ea4396f41f84421cb415170ad1e)
  * Signal Node: Unterstützung für HmIP-ASIR (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/058814630fab8105122b71efad937d5fdd74c9b8)
* 539076d @hobbyquaker Update RedMatic-HomeKit
  * Neues Accessory: Homematic Garage (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/42)
  * Verbesserungen für Rollladenaktoren beim Richtungswechsel (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/121)
* 539076d @hobbyquaker  Update node-red-contrib-sun-position
  * @Hypnos3 Neuer Node "Time comp" zum umrechnen und vergleichen von Zeitpunkten
  * @Hypnos3 Neuer Node "Timespan" für die Berechnung und den Vergleich von Zeitspannen  
  * @Hypnos3 Diverse Verbesserungen
* 8836837 @hobbyquaker Buildprozess verbessert, Automatisierung des "prebuild" von Binärmodulen 
* e879286 @hobbyquaker RedMatic-HomeKit von var/ nach lib/ verschoben
* 539076d @hobbyquaker Update node-red-node-email
* 539076d @hobbyquaker Update node-red-node-serialport
* 539076d @hobbyquaker Update npm




# v2.6.0 2019-02-10T17:12:26Z

* f0c7c60 @hobbyquaker add node-red-contrib-modbus (#151)



# v2.5.1 2019-02-07T18:02:53Z

* a2910b1 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der dazu führte das findChannel Methode keine Channel mehr über ihren Namen finden konnte



# v2.5.0 2019-02-07T16:43:31Z

* 44a05fa @hobbyquaker Update node-red-contrib-ccu
  * setValue Calls aus den Nodes "set value" und "value" werden per Queue abgearbeitet ([cc8cbfc](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/cc8cbfc797e073c48e7c0bad3647dfaa0e8cc97e) [69d99d0](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/69d99d0d693e6362f8999d5fde88189830986997))
  * weitere Verbesserungen bei der Verarbeitung von WORKING bzw. PROCESS Datenpunkten ([4d395ba](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/4d395ba644f0edf287905e3efab403050aca46c9))
  * Performance-Optimierung für die Abarbeitung von Callbacks ([4a6feed](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/4a6feedad2b073c5c414a26a68ae46b9dbdfe4db))
  * Performance-Optimierung für das Auffinden von Channels über Namen ([c74a611](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/c74a61164abedabcfbff68bc2a587e4e70833fe0))
  * Messages werden vor der Übergabe an einen Callback gecloned um Veränderungen des Zustands durch Nachfolgende Nodes zu verhindern ([f036018](https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/f036018595865fdea8bf952527f2f2502b19ab74))
* 614b974 @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung für HM-Sec-Sir-WM hinzugefügt (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/118)



# v2.4.1 2019-02-03T14:38:26Z

* f00e1ca @hobbyquaker Update node-red-contrib-ccu
  * Verarbeitung von WORKING* und PROCESS Datenpunkten verbessert



# v2.4.0 2019-02-02T13:00:28Z

* 69a908a @hobbyquaker add node-red-contrib-smartmeter (#144)
* 5fdf699 @hobbyquaker Update node-red-contrib-ccu
  * setValueQueued Methode hinzugefügt um Werte nacheinander zu setzen (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/a391f83633f9772562a42fdf96bc56f1db9fe70b)
  * set Value Node nutzt nun setValueQueued (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/69d99d0d693e6362f8999d5fde88189830986997)
* 5fdf699 @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung für HM-Sec-Win und HM-Sec-Key-O hinzugefügt (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/116)
  * Werte werden nun über setValueQueued gesetzt (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/115)
* 5fdf699 @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases))
* 5fdf699 @hobbyquaker Update node-red-node-email
* 5fdf699 @hobbyquaker Update Node.js
* 5fdf699 @hobbyquaker Update npm





# v2.3.0 2019-01-20T16:48:14Z

* 2b34bd9 @hobbyquaker Update node-red-contrib-ccu
  * Fehler beim zuordnen von CUxD Events behoben (#138)
* 2b34bd9 @hobbyquaker Update RedMatic-HomeKit
  * HmIP-SAM hinzugefügt
  * Fensterkontakte können nun auch als GarageDoorOpener Service genutzt werden
* 2b34bd9 @hobbyquaker Update npm


# v2.2.1 2019-01-15T20:22:24Z

* 5e8bae0 @hobbyquaker Fehler beim setzen des Context Storage Pfad und Flushintervall behoben
* b1ab903 @hobbyquaker Update RedMatic-HomeKit
  * Fehler bei der Darstellung der Konfigurations-Dropdowns behoben



# v2.2.0 2019-01-15T17:01:17Z

* 31c9f21 @hobbyquaker Update node-red-contrib-ccu
  * Workaround für Bug im hmipserver der dazu geführt hat dass sich sinnlose init-subscribers des VirtualDevices Interface angesammelt haben
  * WORKING_SLATS Datenpunkt des HM-LC-Ja1PBU wird ausgewertet (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/71)
* 31c9f21 @hobbyquaker Update RedMatic-HomeKit
  * Tür/Fensterkontakte können nun als Door- oder Window-Service konfiguriert werden ([Diskussion](https://homematic-forum.de/forum/viewtopic.php?f=77&t=48406&p=485193))
  * Fehler behoben bei der Konfiguration des LightSensor von Bewegungsmeldern


# v2.1.0 2019-01-14T20:26:59Z

* 5e1d487 @hobbyquaker Update RedMatic-HomeKit
  * Service-Typ für Switch-Kanäle konfigurierbar
  * Eventuellen Node-RED Crash beim Pairen der Bridge abgefangen
* d871d73 @hobbyquaker Verzichtbare Verzeichnisse aus Backup ausgenommen (bisher nur für RaspberryMatic) (Siehe dazu #135)



# v2.0.2 2019-01-13T09:45:54Z

* d9257ba a12a80d @hobbyquaker Weiteren (hoffentlich letzten) schwerwiegenden Fehler der contextStorage settings behoben (#134)



# v2.0.1 2019-01-13T08:50:08Z

* d0af042 @hobbyquaker Schwerwiegenden Fehler behoben der u.U. zum Node-RED Absturz geführt hat weil contextStorage settings beim Update nicht vorhanden waren (#134)



# v2.0.0 2019-01-12T21:19:37Z

* 549ccd9 @hobbyquaker Node.js auf Version 10 aktualisiert (#73)
* 6340afa @hobbyquaker Neue Konfigurationsoptionen für Context Storage, Authentifizierung und das Node-RED Projects Feature hinzugefügt (#31 #132 #78 #45)
* 1ea51dc @hobbyquaker Admin Auth default auf "Rega" - d.h. es wird der gleiche Username und das gleiche Passwort verwendet wie auch bei der Anmeldung am CCU WebUI
* 165cd05 @hobbyquaker coap-client für node-red-contrib-tradfri hinzugefügt (#131)
* bfac27e @hobbyquaker Update RedMatic-HomeKit
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/75369a5f81ee822bcd3963b63ea686d6d265ea4e HmIP-SWDM-B/B1/B2 Varianten hinzugefügt
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/dc76cbe76685fe09720243ba579e762d965c2516 Propagieren des Boost von WTH auf TRV verzögert
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/fba2f7ca1aa1cf901b920213fbe8f3c6a28133bb Ventilstellungsmaximum aller mit einem WTH verknüpften TRVs wird ausgewertet
  * https://github.com/HM-RedMatic/RedMatic-HomeKit/commit/5dcb68e3c7706718b11beb4ab9dad9ab8757917c HM-LC-Ja1PBU-FM über `LEVEL_COMBINED` Datenpunkt steuern (sollte Probleme bei der Verwendung in HomeKit-Szenen beseitigen)


# v1.10.12 2019-01-03T17:38:27Z

* 53ad4fc @hobbyquaker Update RedMatic-Homekit
   * Fix hmw-sen-sc-12
* 4c2d946 @hobbyquaker Update RedMatic-HomeKit
  * Schwerwiegenden Fehler behoben der zum Node-RED Crash beim Pairing der Bridge führen konnte
* ed81e67 @hobbyquaker Fehler behoben default Settings beim automatischen Node-RED Neustart



# v1.10.10 2019-01-02T16:48:25Z

* 901f672 @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben der dazu führte das Services für eigentlich deaktivierte Kanäle angelegt wurden
  * Unterstützung für HMW-Sen-SC-12-* hinzugefügt
* 901f672 @hobbyquaker Update node-red-contrib-ccu
  * Im _set value_ Node kann nun mittels regulären Ausdrücken gefiltert werden
  * Anzeige des letzten Wertes im Status der _sysvar_ und _get value_ Nodes




# v1.10.9 2018-12-30T18:05:33Z

* ef2e126 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim Schließen der ccu-connection der dazu führen konnte das "init-Leichen" im hmipserver verblieben sind und u.U. die Funktion des hmipservers beeinträchtigt haben
* ef2e126 @hobbyquaker Update RedMatic-HomeKit
  * Anlegen von Homematic Geräten nun asynchron und mit kurzen Pausen um das Blockieren des Node-RED Prozesses beim Start zu vermeiden (hat u.U. zu `XmlRpc transport failed` Fehlermeldungen des rfd/hs485d beim Node-RED Start geführt)



# v1.10.8 2018-12-27T17:44:08Z


* 43fe0b2 @hobbyquaker Update node-red-contrib-ccu
  * Schwerwiegenden Fehler behoben der zum Node-RED Crash führt wenn ein updateDevices Event eingeht (https://github.com/HM-RedMatic/node-red-contrib-ccu/commit/773785c9bf5214c4ad5efde3798b90b172c06c33)
* 43fe0b2 @hobbyquaker Update RedMatic-HomeKit
  * Setzen des Boost-Modes an Wandthermostaten wird auch an alle direkt Verknüpften Heizungssteller gesendet (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/96)
  * Neuer Node zur Integration von Kameras in HomeKit





# v1.10.5 2018-12-26T14:57:37Z

* eeb1200 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben - ON_TIME/RAMP_TIME wurde gespeichert obwohl nicht von Aktor unterstützt (https://github.com/HM-RedMatic/node-red-contrib-ccu/issues/40)
* eeb1200 @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung für hm-lc-rgbw-wm / hb-uni-rgb-led-ctrl Farbe hinzugefügt
  * Fehler behoben bei HmIP-SMI55 (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/98)
  * Setzen der On-Characteristic bei Dimmern verzögert (https://github.com/HM-RedMatic/RedMatic-HomeKit/issues/87)
  * Alle Mehrkanal Schaltaktoren können nun wahlweise als SingleAccessory konfiguriert werden


# v1.10.4 2018-12-23T19:34:24Z

* e6aa13e @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben bei hm-wds-30-ot2
  * Unterstützung für diverse Homebrew Geräte hinzugefügt



# v1.10.3 2018-12-23T17:11:21Z

* 95bca5d @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung hinzugefügt für: HM-Sec-RHS-2, HM-WDS-30-OT, HM-WDS-30-OT-2, HB-UNI-Sen-Temp-IR



# v1.10.2 2018-12-23T12:43:44Z

* 418ac9e @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben bei der Anzeige des Heizungsstatus des HmIP-(B)WTH
  * Unterstützung für diverse HmIP Geräte hinzugefügt
* 5d38e75 @hobbyquaker Fehler behoben bei der Anzeige der Node-RED CPU Nutzung in Systemsteuerung


# v1.10.1 2018-12-22T20:04:52Z

* d8e1d59 @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben beim bestimmen des Verbindungsstatus
  * Setzen von Rega-Systemvariablen wird verzögert falls Verbindung noch nicht aufgebaut ist
  * Minütliches loggen einiger Statistiken bei Loglevel debug oder trace
* d8e1d59 @hobbyquaker RedMatic-HomeKit
  * Neues Accessory "Pseudobutton"
  * Unterstützung für diverse Homematic Geräte hinzugefügt
* d8e1d59 @hobbyquaker node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.13.0))
* 8bf05f2 @hobbyquaker Anzeige der Node-RED CPU-Nutzung in Systemsteuerung
* 192c9a2 @hobbyquaker node-red-contrib-sun-position hinzugefügt
* 192c9a2 @hobbyquaker node-red-contrib-time-range-switch entfernt



# v1.10.0 2018-12-21T15:30:21Z

* b8f2303 @hobbyquaker Update node-red-contrib-ccu
  * diverse Optimierungen und Fehlerbehebungen, hauptsächlich betreffs Filterung im rpc-event Node
* b8f2303 @hobbyquaker Update RedMatic-HomeKit - 1.0 Release! 🎉
  * Unterstützung für diverse Geräte hinzugefügt
  * Luftfeuchte- und Helligkeitsensoren deaktivierbar
  * Keymatic Verhalten ("Open on Unlock") konfigurierbar
  * Bei Mehrkanal-Schaltaktoren können Kanäle einzeln deaktiviert werden
  * Boost Switch für Thermostate/Heizungssteller hinzugefügt (deaktivierbar)
  * Umfangreiches Refactoring, diverse Fehler behoben
* b8f2303 @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases))
* b8f2303 @hobbyquaker Update node-red-contrib-email
* b8f2303 @hobbyquaker Update node-red-node-sqlite
* b8f2303 @hobbyquaker Update Node.js, Update npm




# v1.9.15 2018-12-07T23:12:17Z

* ec82520 @hobbyquaker Update RedMatic-HomeKit
  * Fix HmIP-SRH
* d636f8b @hobbyquaker add jo binary



# v1.9.14 2018-12-07T21:53:51Z

* f4258ce @hobbyquaker Update RedMatic-HomeKit
  * HmIP-SMI55 hinzugefügt
  * Fehler beim Erzeugen von Homematic Devices werden nun abgefangen und geloggt




# v1.9.13 2018-12-07T18:10:03Z

* 519e513 @hobbyquaker fix log download
* 5e00ee1 @hobbyquaker Update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.12.0))


# v1.9.12 2018-12-07T17:02:32Z

* 5e00ee1 @hobbyquaker Update RedMatic-HomeKit
  * Neue Geräte hinzugefügt: HmIP-SWSD, HmIP-BBL, HmIP-FBL, HmIP-BROLL, HmIP-FROLL
* 3f1b775 @hobbyquaker Node-RED Restart-Verhalten konfigurierbar (#110)
* eead532 @hobbyquaker rfc2616 compliant linebreaks for http headers



# v1.9.11 2018-12-01T16:20:47Z

* 3909107 @hobbyquaker Update RedMatic-HomeKit
  * add HmIP-eTRV-B1 support
* 0e911a0 @hobbyquaker Update node.js to 8.14.0
* be180cc @hobbyquaker Komfortabler Log-Download im RedMatic UI (CCU WebUI Systemeinstellungen)
* f350a31 @hobbyquaker rfc2616 compliant linebreaks for http headers
* d51cf10 @hobbyquaker Automatischer Neustart von Node-RED im falle eines Absturzes (#110)
* c0b601c @hobbyquaker Issue Template hinzugefügt


# v1.9.10 2018-11-27T19:52:17Z

* 25fd630 @hobbyquaker Update node-red-contrib-ccu
  * Erkennung ob >=3.41.x mit reverse proxy vorhanden ist über `/etc/lighttpd/conf.d/proxy.conf` statt `/etc/config/rfd.conf` (Anpassung an RaspberryMatic 3.47.11.20181126)
  * RedMatic Absturz verhindern bei ungültigen Rega-Antworten



# v1.9.9 2018-11-25T20:51:35Z

* 1e35e1a @hobbyquaker Bug Mitigation für RaspberryMatic 3.41.11.20181124 (https://github.com/jens-maus/RaspberryMatic/issues/480) - Content-Type header in cgis hinzugefügt (#108)
* 292f1c7 @hobbyquaker Update Node.js auf 8.13.0
* a6a3481 @hobbyquaker Update node-red-contrib-combine
  * @Sineos Fehler im Logic Node behoben (https://github.com/HM-RedMatic/node-red-contrib-combine/issues/5)



# v1.9.6 2018-11-19T19:00:20Z

* 7c425e7 @hobbyquaker update node-red-contrib-ccu
  * @psi-4ward _get value_ Node verbessert (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/34)
* 7c425e7 @hobbyquaker update RedMatic-HomeKit
  * Versuch verlorene Raumzuordnungen beim CCU Reboot zu verhindern (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/86)



# v1.9.5 2018-11-18T20:11:59Z

* ebaea70 @hobbyquaker update node-red-contrib-ccu
  * diverse Fehler im _switch_ Node behoben
  * Neuer _get value_ Node für komfortablen Zugriff auf Datenpunkte und Systemvariablen



# v1.9.4 2018-11-18T14:49:40Z

* 78ec62b @hobbyquaker update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.11.0))
* 78ec62b @hobbyquaker update node-red-contrib-ccu
  * Fehlerbehandlung bei fehlgeschlagenen RPC Calls verbessert
* 78ec62b @hobbyquaker RedMatic-HomeKit
  * Weitere Geräte implementiert: HM-LC-Sw4-DR, HmIP-STH*, HmIP-SWO*, HM-Mod-Re-8
  * BatteryService für HmIP-PCBS ergänzt



# v1.9.3 2018-11-16T20:00:17Z

* c87508a @hobbyquaker update RedMatic-HomeKit
  * Service Typ WindowCovering für Rollläden (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/78)
  * Fehler behoben HM-LC-Ja1PBU (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/71)
  * Geräte hinzugefügt: HM-LC-AO-SM, HM-LC-Sw4-SM
* c87508a @hobbyquaker update node-red-contrib-ccu
  * Absturz verhindern bei ungültigen RPC params (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/31)
* 6383e85 @hobbyquaker update ain2 and unix-dgram prebuilt



# v1.9.2 2018-11-10T02:18:43Z

* 867fea4 @hobbyquaker update RedMatic-HomeKit
  * HM-LC-Ja1PBU-FM hinzugefügt (~~bisher ungetestet~~, leider noch Fehlerhaft, führt zum Node-RED Absturz. Falls Gerät vorhanden bitte im HomeKit Homematic Node deaktiveren) (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/71)
  * HmIP-SWDM hinzugefügt (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/73)
  * HmIP-eTRV-B hinzugefügt (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/72)



# v1.9.1 2018-11-06T22:42:33Z

* eb14ede @hobbyquaker Update node-red-contrib-ccu
  * Fehler behoben der u.U. dazu geführt hat dass Events von Dimmern und Rollläden/Jalousien ausgeblieben sind. (#83)
* eb14ede @hobbyquaker Update RedMatic-HomeKit
  * Fehler behoben der dazu führte dass HmIP-Dimmer ungewollt auf 100% Helligkeit sprangen (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/61)
  * Unterstützung für HmIP-PDT hinzugefügt (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/67)
* 087e5be @hobbyquaker Twitter and Feedparser Nodes aus Installationspaket entfernt. Müssen bei bedarf manuell nachinstalliert werden.
* c30157d @hobbyquaker Nicht Update-fähige Nodes (solche die Binärmodule enthalten: sqlite und serialport) im `lib` statt im `var` Verzeichnis ausliefern, verhindert dass über den Palette-Manager ein Update angestoßen wird das fehlschlägt und die Nodes lahmlegt (close #87)



# v1.9.0 2018-11-04T19:33:58Z

* 1117d5a @hobbyquaker node-red-node-serialport integriert (#85)



# v1.8.0 2018-11-04T12:21:23Z

* 12a9b32 @hobbyquaker Update node-red-contrib-ccu
  * Anpassungen an neue Sicherheitsmaßnahmen in CCU Firmware 3.41
* 12a9b32 @hobbyquaker Update RedMatic-HomeKit



# v1.7.16 2018-11-02T15:53:38Z

* f0af886 @hobbyquaker Update node-red-contrib-ccu
  * Schwerwiegenden Fehler behoben der zum RedMatic Crash führen konnte (#80)
* f0af886 @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung weiterer Geräte hinzugefügt


# v1.7.15 2018-10-31T21:30:17Z

* e20b19c @hobbyquaker Update Node-RED ([Changelog](https://github.com/node-red/node-red/releases/tag/0.19.5))
* e20b19c @hobbyquaker Update node-red-contrib-ccu
  * HmIP ACTIVITY_STATE und PROCESS Datenpunkte auf msg.direction bzw. msg.working gemappt
* e20b19c @hobbyquaker Update RedMatic-HomeKit
  * Unterstützung einiger Geräte ergänzt


# v1.7.14 2018-10-29T17:02:14Z

* 1a8a0ab @hobbyquaker update node-red-dashboard ([Changelog](https://github.com/node-red/node-red-dashboard/releases/tag/2.10.1))
* 412dcfa @hobbyquaker set env `HOME` to `/usr/local/addons/redmatic/home` (close #76)



# v1.7.13 2018-10-28T14:42:45Z

* 455458e @hobbyquaker update node-red-contrib-ccu
  * Fehler bei Filterung nach Interface im "set value" Node behoben (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/25)
* 90f44c9 @hobbyquaker Mitgelieferte Node-RED standard Nodes (email, feedparser, rbe und twitter) können nun mit dem Palette Manager aktualisiert werden (#74)



# v1.7.12 2018-10-27T14:44:55Z

* 86ac590 @hobbyquaker update node-red-dashboard
  * Changelog siehe https://github.com/node-red/node-red-dashboard/releases/tag/2.10.0
* 86ac590 @hobbyquaker update node-red-contrib-ccu
  * Fehler behoben: Cast von Boolean nach Integer bei Datenpunkten vom Typ Enum (https://github.com/hobbyquaker/RedMatic/issues/72)
  * Fehler behoben: JSON.parse schägt fehl (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/24)
  * diverse Fehler im Script Node behoben



# v1.7.11 2018-10-21T12:45:58Z

* a8e589b @hobbyquaker update RedMatic-HomeKit (Beta)
  * diverse Fehler behoben die u.U. dazu geführt haben dass keine Antwort mehr von der Bridge erhalten wurde
* a8e589b @hobbyquaker update node-red-contrib-ccu
  * MQTT Node: Fehler behoben der dazu führte dass *_NOTWORKING message ausblieb


# v1.7.10 2018-10-20T15:53:13Z

* 7bbed38 @hobbyquaker update RedMatic-HomeKit (Beta)
  * Fehlerbehebung: Universal Accessory optionale Charakteristiken (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/44)



# v1.7.9 2018-10-20T12:55:12Z

* c963f61 @hobbyquaker update node-red-contrib-ccu
  * Anzeige des Namens des Rega-Scripts in Fehlermeldung bei JSON.parse Fehlern
* c963f61 @hobbyquaker update RedMatic-HomeKit
  * diverse Fehlerbehebungen und Verbesserungen


# v1.7.8 2018-10-19T22:32:52Z

* a447af6 @hobbyquaker update RedMatic-HomeKit (beta)
  * diverse Fehlerbehebungen
  * neue Homematic Geräte unterstützt
  * neues "Universal Accessory"



# v1.7.7 2018-10-18T18:59:55Z

* ee97145 de247d3 @hobbyquaker update RedMatic-HomeKit
  * Schwerwiegende Fehler die zum Node-RED Crash führen konnten behoben (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/54)



# v1.7.6 2018-10-18T16:02:45Z

* 4a80198 @hobbyquaker update node-red-contrib-ccu
* 4a80198 @hobbyquaker update RedMatic-HomeKit (Beta)
  * Unterstützung von einigen neuen Geräten
  * Geräte können deaktiviert werden
  * diverse Fehlerbehebungen und Verbesserungen



# v1.7.5 2018-10-14T19:38:33Z

* 300bbf1 @hobbyquaker update RedMatic-HomeKit (still Beta)
  * diverse Fehlerbehebungen und Verbesserungen
  * HMIP-eTRV hinzugefügt (noch nicht ganz fertig, siehe https://github.com/hobbyquaker/RedMatic-HomeKit/issues/10)



# v1.7.4 2018-10-14T13:45:27Z

* 5e6047c @hobbyquaker update RedMatic-HomeKit (still Beta)
  * Fehlerbehebung (https://github.com/hobbyquaker/RedMatic-HomeKit/issues/50)


# v1.7.3 2018-10-14T12:27:50Z

* d6a4eae @hobbyquaker update RedMatic-HomeKit (still Beta)
  * Diverse Fehlerbehebungen und Verbesserungen
  * Unterstützung von mehr Homematic Geräten
  * Neues universelles Accessory "Event"



# v1.7.2 2018-10-13T00:24:52Z

* 5144272 @hobbyquaker update RedMatic-HomeKit (Beta)
  * diverse Fehlerbehebungen und Verbesserungen
  *  [weitere Geräte implementiert](https://github.com/hobbyquaker/RedMatic-HomeKit/tree/master/homematic-devices)


# v1.7.1 2018-10-12T16:27:55Z

* 7e309f6 @hobbyquaker update node-red-contrib-ccu
  * added some randomness to rpc init identifier (prevent problems when multiple instances are connected to the same ccu)
* 7e309f6 @hobbyquaker update RedMatic-HomeKit (still alpha/experimental, subject to change)



# v1.7.0 2018-10-08T16:41:10Z

* 41047a9 @hobbyquaker **Neu:** [RedMatic-HomeKit](https://github.com/hobbyquaker/RedMatic-HomeKit) (alpha/experimental version)
* 41047a9 @hobbyquaker Update RedMatic-WebApp 
  * fix https://github.com/hobbyquaker/RedMatic-WebApp/issues/24


# v1.6.0 2018-10-07T08:57:52Z

* 6875d4a @hobbyquaker update node-red-contrib-ccu
* 6875d4a @hobbyquaker __Neu__: [RedMatic WebApp](https://github.com/hobbyquaker/RedMatic-WebApp) (beta version)



# v1.5.3 2018-10-04T16:16:15Z

* 175cbac @hobbyquaker update node-red-contrib-ccu
  * [add api endpoint to get room list](https://github.com/hobbyquaker/node-red-contrib-ccu/commit/9b073d0f3eac2d19934f06a06bf11766a38e6dce)
  * [setValue Node: fix functions filter](https://github.com/hobbyquaker/node-red-contrib-ccu/commit/2f3ec31936dca9a0a6236252639231ba1bbb86e6) https://github.com/hobbyquaker/node-red-contrib-ccu/issues/20
  * [include channel type blind in working detection workaround](https://github.com/hobbyquaker/node-red-contrib-ccu/commit/4454ab5b0d6556085e3cef147cc4097eb586d179)



# v1.5.2 2018-09-18T16:01:44Z

* f2eeb6f @hobbyquaker Update Node-RED
* f2eeb6f @hobbyquaker Update node-red-contrib-ccu
  * Sysvar Node: gibt alle Systemvariablen aus wenn keine Systemvariable selektiert wurde
  * Fix: Exception verhindern wenn RPC call mit leeren Params eingeht
  * Fix: Ping Calls nicht im txCounter zählen, Pong-Events nicht im rxCounter zählen
  * updateDevice, replaceDevice und readdedDevice RPC methoden implementiert



# v1.5.1 2018-09-15T19:07:35Z

* 9a03b29 @hobbyquaker Update node-red-contrib-ccu
  * Value Node akzeptiert `channelName` am Input
  * Fix: re-init bei HmIP Ping Timeout #59 
* 9a03b29 @hobbyquaker Update RedMatic-LED
  * Nutzung von `/sys/class/leds` statt `/sys/devices/platform/leds`



# v1.5.0 2018-09-14T18:01:35Z

* e4b42a8 @hobbyquaker Neuer Node zum Ansteuern der CCU3/RPI-RF-MOD LED.
* 6980251 @hobbyquaker Update node-red-contrib-ccu
  * MQTT Node rx/tx counter
  * Fix: MQTT Node publiziert PRESS_SHORT/PRESS_LONG beim Start



# v1.4.0 2018-09-13T21:01:09Z

* b9a0d99 @hobbyquaker Fix: lighttpd_ssl.conf Patch um RedMatic auf CCU3 auch via https verfügbar zu machen
* fbbdc7f @hobbyquaker Update node-red-contrib-ccu
  * Neuer Node "set Value" um mehrere Aktoren auf einmal zu setzen (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/20)
  * Fix: Fehler behoben bei Autovervollständigung
  * Logging von "PONG" Events
* fbbdc7f @hobbyquaker  Update node-red-dashboard
* 9e51467 @hobbyquaker Update Node-RED
* 2ad581b @hobbyquaker Update Node.js



# v1.3.0 2018-08-31T09:47:01Z

* a96b5a6 @hobbyquaker update node-red-contrib-ccu
  * new node to ease MQTT connection of the ccu
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/5
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/8
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/16
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/17
  * fix https://github.com/hobbyquaker/node-red-contrib-ccu/issues/18


# v1.2.1 2018-08-25T17:29:58Z

* d0cbf68 @hobbyquaker update node-red
* d0cbf68 @hobbyquaker update node-red-dashboard
* d0cbf68 @hobbyquaker update node-red-contrib-ccu
* d0cbf68 @hobbyquaker update node-red-node-sqlite
* d727451 @hobbyquaker add custom lighttpd config for ccu3



# v1.2.0 2018-08-24T12:17:27Z

* 83fd899 @hobbyquaker update node-red-contrib-ccu (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/15), improve paramsetDescription cache handling, renew paramsetDescriptions on HmIP Device Firmware Updates



# v1.1.1 2018-08-19T22:31:37Z

* f66b83e @hobbyquaker try to prevent unwanted module deletion on npm calls through palette manager (#56)



# v1.1.0 2018-08-16T17:04:37Z

* 79026f5 @hobbyquaker adapt settings and config ui to persistable context (#40)
* b247285 @hobbyquaker update node-red-contrib-ccu to 1.1.20 (activate ping on CUxD, available since CUxD 2.1.0)
* ffcf5dc @hobbyquaker update node-red-contrib-ccu to 1.1.19 (#53)
* ffcf5dc @hobbyquaker update node.js to 8.11.4
* ffcf5dc @hobbyquaker update npm to 6.4.0
* ffcf5dc @hobbyquaker update node-red to 0.19.1



# v1.0.16 2018-08-13T16:19:51Z

* 21a3f78 @hobbyquaker update node-red-contrib-ccu (try to improve #52)
* 21a3f78 @hobbyquaker update node-red-node-sqlite
* 21a3f78 @hobbyquaker update node-red-contrib-time-range-switch



# v1.0.15 2018-08-10T18:33:58Z

* f005722 @hobbyquaker include node-red-node-sqlite (#51)
* f005722 @hobbyquaker cleanup prebuilt, adapt build.sh



# v1.0.14 2018-08-05T12:55:01Z

* e0381d5 @hobbyquaker improve service status display on stopping
* 0c6fc8f @hobbyquaker improve error 503 page (closes #38)



# v1.0.13 2018-08-05T09:14:31Z

* 1dde843 @hobbyquaker update node-red-contrib-ccu
  * fix sysvar output filter (cache and change)


# v1.0.12 2018-08-03T16:20:03Z

* 3d72a5c @hobbyquaker update node-red-contrib-ccu
  * sysvar node enhancements (https://github.com/hobbyquaker/node-red-contrib-ccu/issues/13)
* f68c602 @hobbyquaker update npm



# v1.0.11 2018-07-29T16:31:19Z

* e2cc294 @hobbyquaker update node-red-contrib-ccu
  * fix display node HM-Dis-EP-WM55 line assignment https://github.com/hobbyquaker/node-red-contrib-ccu/issues/14


# v1.0.10 2018-07-27T15:52:05Z

* 2c566ac @hobbyquaker update node-red-contrib-ccu
  * prevent selection of disabled interfaces (#37)
  * various fixes and improvements
* 6315350 @hobbyquaker create random encryption key for credentials stored in node-red (implements #39)
* 8e1d6d6 @hobbyquaker improve init script, increase log verbosity
* 3702613 @hobbyquaker log directly to syslog via unix socket
* c6dff95 @hobbyquaker organize prebuilt binaries



# v1.0.9 2018-07-24T17:17:45Z

* 06f1778 @hobbyquaker update node-red-contrib-ccu
  * fixes and enhancements for `display` node
  * fixes and enhancements for `signal` node
  * fix destruction of rega polling



# v1.0.8 2018-07-22T19:56:38Z

* 2e76844 @hobbyquaker update node-red-contrib-ccu (fix string sysvars)



# v1.0.7 2018-07-21T20:18:48Z

* a05983c @hobbyquaker update node-red-contrib-ccu (#32, https://github.com/hobbyquaker/node-red-contrib-ccu/issues/10)
* a05983c @hobbyquaker update node-red-dashboard
* a05983c @hobbyquaker update node-red-contrib-time-range-switch
* a05983c @hobbyquaker update npm
* 0b2fbdf @hobbyquaker update third party licenses



# v1.0.6 2018-07-12T19:41:22Z

* f5307b1 @hobbyquaker fix WebUI buttons (fix #29)



# v1.0.5 2018-07-12T19:11:58Z
* ee291d7 @hobbyquaker update node-red-contrib-ccu (fix #26)

# v1.0.4 2018-07-12T19:05:57Z

* 831964a @hobbyquaker update third party licenses
* 63e6e71 @hobbyquaker icons
* 2654b6d @hobbyquaker logo link
* 3521067 @hobbyquaker redmatic button
* 6db440d @hobbyquaker fix restart cmd (fix #28)



# v1.0.3 2018-07-11T17:12:08Z

* 05bce4a @hobbyquaker improve config ui
* 7710374 @hobbyquaker update node-red-contrib-ccu (fix #27)
* 7710374 @hobbyquaker update node-red-dashboard
* 8fc7926 @hobbyquaker show node-red process status and memory consumption
* 64e1bea @hobbyquaker refactor cgis, improve session validation



# v1.0.2 2018-07-02T17:40:29Z

* 930788c @hobbyquaker update node-red-contrib-ccu (Anzeige des Verbindungs-Status)


# v1.0.1 2018-06-27T19:49:21Z

* e8ceb46 @hobbyquaker update node-red-contrib-combine



# v1.0.0 2018-06-25T17:14:20Z

* 60e1306 @hobbyquaker update node-red-contrib-combine
* b9060c7 @hobbyquaker remove build number from tag, show in changelog




# v1.0.0-rc.7+120 2018-06-22T19:19:29Z

* dce97f7 @hobbyquaker update node-red-contrib-combine



# v1.0.0-rc.6+119 2018-06-22T18:04:45Z

* 0d92e2c @hobbyquaker show license in web ui
* 4017320 @hobbyquaker fix www dir symlink



# v1.0.0-rc.5+118 2018-06-20T20:30:15Z

* ecc9750 @hobbyquaker adds jq to preserve extra nodes in var/package.json, remove migration steps from old beta versions




# v1.0.0-rc.4+117 2018-06-17T16:48:18Z

* 889b3ba @hobbyquaker fix git permissions (#18)



# v1.0.0-rc.3+115 2018-06-17T16:23:16Z

* 707175a @hobbyquaker update node-red-contrib-combine
* 1b6db2c @hobbyquaker add git (#18)



# v1.0.0-rc.2+114 2018-06-16T11:29:16Z

* 3c2271a @hobbyquaker update node-red-contrib-combine
* 13cd4b9 @hobbyquaker add time-range-switch



# v1.0.0-rc.1+113 2018-06-15T21:07:30Z

* 719afd7 @hobbyquaker update node-red-contrib-ccu (fix #17)



# v1.0.0-rc.0+112 2018-06-13T20:01:39Z

* 47f7132 @hobbyquaker explicit owner/group (fix #16)
* eb3ab09 @hobbyquaker update nodejs
* a6f5b59 @hobbyquaker get node version from package.json



# v1.0.0-beta.13+109 2018-06-11T16:02:59Z

* d2909a3 @hobbyquaker skip install and test step
* 5b2e2f5 @hobbyquaker combine dependencies for david-dm



# v1.0.0-beta.12+105 2018-06-11T15:25:31Z

* 9e1cd47 @hobbyquaker update node-red-contrib-ccu



# v1.0.0-beta.11+104 2018-06-10T19:32:05Z

* 757d53a @hobbyquaker remove node-red-admin
* 1afba8c @hobbyquaker tweak changelog, include all versions again




# v1.0.0-beta.10+102 2018-06-10T18:30:12Z

* e503733 @hobbyquaker config ui
* c4fffed @hobbyquaker reorganize directory structure
* d12e96e @hobbyquaker update node-red-contrib-ccu

# v1.0.0-beta.9+101 2018-06-06T17:57:43Z
* 9714c0d @hobbyquaker fix www links update
* 9bec9dc @hobbyquaker update node-red-contrib-ccu
* 663547a @hobbyquaker fix custom error page
* e74810b @hobbyquaker fix webui restart msg

# v1.0.0-beta.8+99 2018-06-06T15:57:11Z

* b737181 @hobbyquaker reorganize directory structure (#14)

# v1.0.0-beta.7+97 2018-06-03T18:06:52Z
* 549175e @hobbyquaker update node-red-contrib-ccu
* e367675 @hobbyquaker update readme

# v1.0.0-beta.6+96 2018-06-03T11:23:02Z
* 2b4feba @hobbyquaker update node-red-contrib-ccu

# v1.0.0-beta.5+95 2018-06-02T06:37:24Z

* e928ff1 @hobbyquaker fix uninstall

# v1.0.0-beta.4+90 2018-06-01T18:49:56Z
* edde70c @hobbyquaker fix links in systemsteuerung

# v1.0.0-beta.3+89 2018-06-01T18:32:48Z

* 51bcbc8 @hobbyquaker update node-red-contrib-ccu - set localhost as default ccu

# v1.0.0-beta.2+79 2018-05-31T19:34:49Z

* dafa384 @hobbyquaker fix update check
* 1713b6f @hobbyquaker update npm
* d89fa2a @hobbyquaker add deps badge

# v1.0.0-beta.1+75 2018-05-31T16:38:24Z

* 428eb74 @hobbyquaker explicit versions

# v1.0.0-beta.0+68 2018-05-31T16:13:40Z
* b17e01d @hobbyquaker renaming, bump major
* ef57dce @hobbyquaker renaming, logo
* 6625073 @hobbyquaker add logo
* 66056c9 @hobbyquaker add logo

# v0.0.26+65 2018-05-29T18:26:17Z
* 7f62e40 @hobbyquaker update node-red-contrib-ccu (#12)

# v0.0.25+64 2018-05-27T12:15:10Z
* 034f1d0 @hobbyquaker update node-red-contrib-ccu (#11)
* 0778d79 @hobbyquaker wording
* 9b4e89a @hobbyquaker append build number with + (follows semver)

# v0.0.24-63 2018-05-23T16:19:50Z
* caecea0 @hobbyquaker update node-red-contrib-ccu (#10)
* 66adbfb @hobbyquaker update licenses

# v0.0.23-61 2018-05-21T20:10:58Z

* 9c9509f @hobbyquaker add node-red-contrib-mqtt-json
* b6745ce @hobbyquaker update Node.js to 8.11.2

# v0.0.22-60 2018-05-20T13:11:59Z

* 85c7cbc @hobbyquaker update node-red-contrib-ccu (#8)

# v0.0.21-59 2018-05-15T19:05:51Z

* 2442cf3 @hobbyquaker Update node-red-contrib-ccu (#7)
* a95d126 @hobbyquaker fix issue tracker link

# v0.0.20-57 2018-05-11T15:35:45Z

* b29461a @hobbyquaker update node-red-contrib-ccu (#6)

# v0.0.19-56 2018-05-08T17:33:44Z
* fc6707b @hobbyquaker update node-red-dashboard
* c2cdb1c @hobbyquaker fix wiki link

# v0.0.18-54 2018-05-05T19:10:34Z
* 35b625d @hobbyquaker update node-red-contrib-ccu

# v0.0.17-53 2018-05-05T17:33:22Z
* 188ccc1 @hobbyquaker update node-red-contrib-ccu

# v0.0.16-52 2018-05-05T16:19:00Z
* 28b84db @hobbyquaker add node version
* 03982ed @hobbyquaker fix module links
* f0b9d36 @hobbyquaker fix release tag
* c8ee471 @hobbyquaker bump version, update node-red-contrib-ccu
* 574071b @hobbyquaker auto create versions file from all installed modules

# v0.0.15-48 2018-05-02T21:10:34Z
* 88af93c @hobbyquaker fix addon uninstall

# v0.0.14-47 2018-05-02T19:59:08Z
* 9949b07 @hobbyquaker fix hm_addons.cfg entries ...

# v0.0.13-46 2018-05-02T19:32:53Z
* 26f2ce8 @hobbyquaker chmod a+x update_addon
* 6d03782 @hobbyquaker fix #3
* 417f113 @hobbyquaker bump version
* aa68629 @hobbyquaker fix #3

# v0.0.12-43 2018-05-02T19:01:39Z
* 11b3b7b @hobbyquaker update node-red-contrib-ccu
* 8421a73 @hobbyquaker typo

# v0.0.11-41 2018-05-01T18:27:15Z
* c16dbd4 @hobbyquaker update node-red-contrib-ccu, bump version
* d48c8d5 @hobbyquaker article links

# v0.0.10-40 2018-05-01T16:39:02Z
* 9748e1e @hobbyquaker update node-red-contrib-ccu, bump version
* 7083997 @hobbyquaker emphasize hints
* 3787109 @hobbyquaker emphasize hints
* efd50d6 @hobbyquaker add headings
* 39728d8 @hobbyquaker fix wiki link
* 1061930 @hobbyquaker remove node-red-admin link
* 98a4633 @hobbyquaker password auth hint

# v0.0.9-34 2018-04-30T21:38:16Z

* 27d2c5f @hobbyquaker addon update check
* 8793e52 @hobbyquaker fix update
* a5ae08a @hobbyquaker export env vars
* 0e72ea9 @hobbyquaker move npm env var to init script
* a0fdd0c @hobbyquaker create backup of settings.js on update
* ed88266 @hobbyquaker npm install directly in lib/node_modules
* 678b3a8 @hobbyquaker include node-red-admin
* 91a15ae @hobbyquaker add CCU1/2 hint
* 00e44df @hobbyquaker fix typos, add license text
* d0a21d0 @hobbyquaker add download counter badge
* ba32a27 @hobbyquaker add release badge
* 2c66f50 @hobbyquaker auto-generate changelog for release page on travis, cleanup build.sh

# v0.0.8-16 2018-04-29T17:36:48Z

# v0.0.7-14 2018-04-29T16:50:45Z

# v0.0.6-12 2018-04-29T00:59:57Z

# v0.0.5-11 2018-04-29T00:33:42Z

# v0.0.4-10 2018-04-29T00:12:29Z

# v0.0.3-9 2018-04-28T21:36:21Z
