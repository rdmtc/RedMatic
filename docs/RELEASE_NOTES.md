### RedMatic 10.1.0

RedMatic-HomeKit und RedMatic-Matter werden nach einem RedMatic-Update mit
aktualisiert, node-red-contrib-ccu 4.15.0 schreibt einen deutlich kleineren
Wertecache, und die Einstellungsseite hat einen Dark Mode.

- **RedMatic-HomeKit und RedMatic-Matter werden nach einem RedMatic-Update
  mit aktualisiert.** Bisher blieben die beiden Nodes nach einem Update von
  RedMatic auf der Version stehen, die über die Palette installiert worden
  war. Jetzt fragt RedMatic beim ersten Start nach einem Update die
  npm-Registry nach neueren Versionen, installiert sie in einem Durchgang
  und startet Node-RED danach einmal neu. Das gilt für jeden Weg, auf dem
  RedMatic aktualisiert wird: die Zusatzsoftware-Seite der CCU, den
  Update-Knopf der RedMatic-Einstellungen und die Addons-Seite von
  openccu-lite.
  - Die Einstellung dazu steht auf der Einstellungsseite von RedMatic und
    ist **eingeschaltet**, auch nach dem Update von einer älteren Version.
    Dort steht auch, was der letzte Lauf getan hat.
  - Nur diese beiden Pakete, und nur, wenn sie installiert sind. Andere
    Nodes bleiben, wie sie sind.
  - Genommen wird die neueste Version, die zum Node.js und Node-RED dieser
    RedMatic-Version passt, nie eine Vorabversion. Ein Paket, für das in
    der `package.json` des Node-RED-Verzeichnisses eine feste Version
    (`4.1.4` statt `~4.1.4`) oder eine andere Quelle steht, wird nicht
    angefasst.
  - Ohne Verbindung zur npm-Registry oder bei einem Fehler von npm bleibt
    alles, wie es ist: Node-RED läuft weiter, die Meldung steht im Log und
    auf der Einstellungsseite, und die nächsten Starts versuchen es erneut.
  - **Schon dieses Update tut es:** Sind RedMatic-HomeKit oder
    RedMatic-Matter installiert und nicht aktuell, werden sie kurz nach dem
    ersten Start von 10.1.0 aktualisiert (derzeit auf RedMatic-HomeKit
    4.2.0 und RedMatic-Matter 1.0.2), und Node-RED startet etwa eine Minute
    nach dem Update ein zweites Mal. Wer das nicht möchte, schaltet die
    Einstellung vor dem Update von RedMatic aus – das geht erst ab 10.1.0;
    beim Update auf 10.1.0 selbst lässt sich ein Paket nur über eine feste
    Version in der `package.json` ausnehmen.
- **node-red-contrib-ccu 4.15.0: deutlich kleinerer Wertecache.** Die Datei
  `ccu_values_<host>.json` im Node-RED-Verzeichnis enthielt zu jedem
  Datenpunkt die komplette Nachricht mit Namen, Typen, Räumen und
  Gewerken – auf einem großen System 2,5 MB für 3500 Datenpunkte. Sie
  enthält jetzt nur noch den Wert, seine Zeitstempel und den vorherigen
  Wert und ist etwa ein Fünftel so groß; alles andere wird beim Start aus
  den Geräte- und Namensdaten ergänzt. Ein Wert aus dem Cache trägt damit
  die aktuellen Namen, Räume und Gewerke statt derer seines letzten
  Ereignisses. Die Datei früherer Versionen wird gelesen, das nächste
  Schreiben ist das kurze Format.
  - **Hinweis zum Zurückgehen:** Wird danach wieder eine ältere Version
    von node-red-contrib-ccu (oder RedMatic) installiert, tragen die Werte
    aus dem Cache bei deren erstem Start keine Namen, bis die Werte wieder
    von der Zentrale gelesen wurden.
- **Einstellungsseite im Dark Mode.** Die Einstellungsseite von RedMatic
  folgt jetzt der Einstellung des Systems bzw. Browsers (hell/dunkel),
  ebenso die Fehlerseiten und die Lizenzübersicht.
- **openccu-lite:** Die Zeile „Node-RED Abstürze seit letztem
  RedMatic-Start“ wird dort nicht mehr angezeigt – sie zeigte immer
  „keine“, und den Dienst überwacht dort das System. Auf CCU3 und OpenCCU
  bleibt sie. Außerdem neue Beschreibung und neuer Hinweistext im
  Addon-Katalog des Systems; was das Addon braucht, öffnet und kontaktiert,
  steht dort weiterhin unter den Details.

Node.js 26.13.1, Node-RED 5.0.10 und npm 11.21.3 wie in 10.0.0.
