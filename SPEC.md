# Strichliste – Spezifikation

Ersetzt die Papier-Strichlisten (Kaffee, Twix, Getränke, Pizza …) im Büro durch eine kleine Verwaltungs-App. Papier bleibt als Erfassungsmedium erlaubt (Druckfunktion), die App übernimmt Stammdaten, Abrechnung und Auswertung.

Aktueller Stand: `index.html` (Single-File-PWA, IndexedDB + localStorage-Spiegel, Service Worker). Verhalten und Layout dort sind die Vorlage für eine spätere TypeScript-Version.

## Ziele
1. Personen, Produkte und Preise zentral pflegen
2. Konsum erfassen (direkt am Handy oder von Papierliste nachtragen)
3. Offene Beträge je Person, Zahlungen verbuchen
4. Papierlisten drucken (2 Listen)
5. Scoreboard (wer gibt wie viel aus)

## Nicht-Ziele (v1)
- Kein Login / keine Mehrbenutzer-Rechte (ein Admin)
- Keine Online-Zahlung, keine Cloud, kein Sync
- Keine Selbsterfassung durch die Kollegen (Option für später, siehe Roadmap)

## Datenmodell
Beträge immer als Integer-Cent. Datum als `YYYY-MM-DD` (lokal).

- Person: `id, rank (Dienstgrad-Kürzel, '' = zivil), last (Nachname), active` – Anzeige überall als „Dienstgrad Nachname“, z. B. „OWm Gruber“. Keine Vornamen.
- Product: `id, name, price (Cent), list ('A'|'B'|'C'), icon, active`
- Entry (Konsum): `id, personId, productId, qty, price (Preis-Snapshot zum Buchungszeitpunkt), date`
- Payment: `id, personId, amount (Cent), date`
- Settings: `title (Zeitraum/Titel für Ausdruck), orient, spareRows, sort ('name'|'rank')`
- Meta: `savedAt, lastExport, closedYears`
- Verdichteter Eintrag (Jahresabschluss): Entry mit `arch: true, amt (Cent-Summe), d: 'YYYY-12-31'`; `val(e) = amt ?? qty × price`

Dienstgrade (aufsteigend, Kürzel vor Verwendung gegen offizielle Liste prüfen): Rekr, Gfr, Kpl, Zgsfhr, Wm, OWm, StWm, OStWm, OStv, VzLt, Fhr (Fähnrich, nur Offiziersanwärter), Lt, Olt, Hptm, Mjr, Obstlt, Obst, Obst d.G., ObstA, Brig, GenMjr, GenLt, Gen. Sortierung: Nachname A–Z oder Dienstgrad absteigend.

Regeln:
- Offener Saldo = Σ(qty × price) − Σ(payments). Negativ = Guthaben.
- Preisänderung wirkt nur auf neue Buchungen (Snapshot im Entry).
- Buchung pro (Person, Produkt, Tag) wird zusammengeführt (qty erhöhen).
- Person mit Buchungen wird nur deaktiviert, nie gelöscht.
- Inaktive Personen erscheinen weder auf Druckliste noch in der Erfassung, aber in der Abrechnung solange Saldo ≠ 0.

## Funktionen
### Erfassen
- Einzeln: Personenliste mit Suche, Tap → Produkte mit +/−. Minus nur für heutige Buchungen; ältere über „Letzte Buchungen“ löschen.
- Matrix: Tabelle Person × Produkt, Zahlen eintragen, Datum wählen, „Alle buchen“ (zum Nachtragen der Papierliste).

### Abrechnung
- Offene Beträge sortiert, „Bezahlt“ bucht Vollzahlung (Zwei-Klick-Bestätigung). Zahlungen löschbar.
- Später: Teilzahlungen, Zahlungserinnerung als Text zum Kopieren.

### Druck
- Liste 1 = Produkte mit `list = 'A'` (Standard: Kaffee, Twix), Liste 2 = `list = 'B'`, Liste 3 = `list = 'C'` (Pizza).
- Zeilen: aktive Personen alphabetisch + konfigurierbare Leerzeilen. Spalten: ein breites Feld je Produkt (Preis im Header) + Spalte „Notiz“ am Ende.
- Eigene Seite pro Liste, Kopfzeile wiederholt sich bei Seitenumbruch, A4 hoch (Standard) oder quer wählbar, Titel/Zeitraum frei.
- Umsetzung über Print-CSS (`@media print`, `@page`), keine PDF-Bibliothek in v1. Zeilenhöhe in mm.

### Jahresabschluss
- Verwalten → Jahresabschluss: verdichtet alle Einzelbuchungen eines vergangenen Jahres zu einem Eintrag je (Person, Produkt) mit Summe aus Menge und Betrag.
- Salden, Abrechnung und Scoreboard (Jahr/Gesamt) bleiben unverändert. Vor dem Schreiben wird je Person geprüft, dass der Saldo identisch bleibt, sonst Abbruch ohne Änderung.
- Schutz: nur Jahre vor dem aktuellen; nur wenn heute ein Backup gesichert wurde; Zwei-Tipp-Bestätigung. Zahlungen bleiben einzeln erhalten.
- Verdichtete Einträge sind nicht einzeln löschbar und nehmen keine neuen Buchungen auf.

### Scoreboard
- Zeitraum: Monat / Jahr / Gesamt. Metrik: Ausgaben € / Stückzahl.
- Podium Top 3, Rangliste mit Balken, KPIs (Umsatz, Ø pro Person, Top-Produkt), „Produkt-König“ je Produkt.
- Anonym-Schalter (nur Initiale) für Bildschirm-Präsentation.
- Ideen später: Streak-Anzeige, Monats-Archiv („Hall of Fame“), Sparfuchs-Auszeichnung.

### Daten
- Export/Import als JSON (Backup, Gerätewechsel). Pflicht in v1, weil lokal gespeichert.

## Architektur-Empfehlung
**v1: statische PWA, rein lokal.**
- Vite + TypeScript, UI schlank (Preact oder Vanilla). Kein Backend.
- Speicher: IndexedDB (z. B. Dexie), Persistenz anfordern (`navigator.storage.persist()`).
- PWA-Manifest + Service Worker (vite-plugin-pwa) → Installation auf dem Handy, offline lauffähig.
- Logik (Saldo, Ranking, Buchung) als reine Funktionen in `src/domain/`, getrennt von UI → gut testbar (Vitest).

Betrieb ohne Firmengerät: Build ist ein statischer Ordner. Hosting z. B. privat (GitHub Pages / eigener Server) oder lokal vom Handy aus Datei. Daten bleiben im Browser des Handys.

### Speicherstrategie (iPhone)
Ziel: Daten dürfen nicht stillschweigend verschwinden.
- Primär IndexedDB, bei jeder Änderung schreiben (auch bei `visibilitychange`). Im Prototyp zusätzlich localStorage-Spiegel; neuerer `savedAt` gewinnt beim Start. Wiederherstellung aus dem jeweils anderen Speicher, wenn einer leer ist.
- `navigator.storage.persist()` anfordern, Status in der UI anzeigen.
- **Installation als Home-Bildschirm-App ist Pflicht** (Safari → Teilen → Zum Home-Bildschirm): Safari-Tabs räumen Website-Daten nach ca. 7 Tagen ohne Nutzung weg, installierte Web-Apps nicht (Stand iOS 17/18, vor Release gegenprüfen). Dafür: Manifest (`display: standalone`, Icons 180/512), Apple-Meta-Tags, Service Worker für Offline.
- App muss von einer HTTPS-Adresse geliefert werden (statisches Hosting, z. B. GitHub Pages/Cloudflare Pages; auf dem Server liegen nur die Programmdateien, nie Daten). Eine lose `.html` aus der Dateien-App ist als Dauerlösung ungeeignet (Speicher pro Datei unzuverlässig).
- iOS erlaubt keine stillen Dateisicherungen. Deshalb: Backup per Share-Sheet (`navigator.share({files})` → „In Dateien sichern“, iCloud Drive möglich), Header-Badge „Backup: vor X T“, Warnbanner ab 7 Tagen ohne Backup.
- Wenn das nicht reicht (echte Konsistenz über Geräte, kein Datenverlust-Risiko): Variante mit kleinem Server (Node + SQLite) im privaten Netz oder native Hülle (Capacitor + SQLite; braucht Mac/Xcode, bei Gratis-Signatur alle 7 Tage neu installieren).

Grenzen des lokalen Ansatzes (bewusst akzeptiert):
- Daten nur auf einem Gerät. Browserdaten löschen = weg → regelmäßig Export. Ggf. Export-Erinnerung in der App.
- Drucken vom Handy braucht einen erreichbaren Drucker. Praktisch: als PDF speichern/teilen und am Büro-PC drucken.
- Für Mehrgeräte/Selbsterfassung später: kleines Backend (Node + SQLite) im privaten Netz, Zugriff nur im LAN.

## Bilderkennung (verworfen)
Entscheidung: nicht umsetzen. Nachtragen läuft über die Matrix, alles bleibt lokal. Die folgenden Überlegungen bleiben als Hintergrund stehen.

- Ziel: Foto der ausgefüllten Papierliste → vorausgefüllte Matrix. Immer manuelle Prüfung vor dem Buchen.
- Strichzählen ist fehleranfällig (Bündel, Streichungen, Handschrift). Realistisch: Tabellenstruktur durch festes Druck-Layout (Zellen bekannt, evtl. QR/Eckmarker auf dem Ausdruck zur Ausrichtung) + Vision-Modell pro Zelle.
- Datenschutz: Cloud-Vision heißt, dass Namen/Konsum das Gerät verlassen. Entweder anonymisierte Zellen (nur Zahlen) oder lokales Modell.
- Billige Alternative, die vorher geht: Ausdruck mit Zellen zum Eintragen von Ziffern statt Strichen.

## Design
Anlehnung an das Österreichische Bundesheer, ohne dessen Logos/Wappen/Bundesadler zu verwenden (geschützt).
- Farben: Olivgrün `#4b5d2a` (Akzent), Dunkeloliv `#2f3b1a` (Header, Tabbar), Sand `#ecebe0` (Hintergrund), Rot `#c8102e` (Warnung, aktiver Tab-Balken). Rot-Weiß-Rot-Streifen unter dem Header.
- Typo: System-Font, Überschriften/Sektionen in Versalien mit Laufweite.
- Dienstgrad-Kürzel als Kennzeichen (Badge) vor dem Nachnamen.
- Druckausgabe bleibt schwarz-weiß.

## Datenschutz
- Name + Konsumverhalten sind personenbezogene Daten. Vor Produktivbetrieb mit den Betroffenen klären (Einwilligung/Information), besonders wenn Scoreboard mit Klarnamen sichtbar ist. Anonym-Modus bereitstellen (vorhanden).
- Keine Telemetrie, keine externen Requests, keine CDN-Abhängigkeiten zur Laufzeit.

## Roadmap
1. **MVP**: Stammdaten, Erfassen (einzeln + Matrix), Abrechnung, Druck (2 Listen), Scoreboard, JSON-Export/Import, PWA.
2. **v1.1**: Teilzahlungen, Monatsabschluss/Archiv, PDF-Export, Backup-Erinnerung.
3. **v2**: Foto → Matrix (Bilderkennung mit Prüfansicht), optional Selbsterfassung per QR-Code am Kühlschrank (braucht Backend im LAN).

## Abnahmekriterien MVP
- Demo-Szenario: 10 Personen, 8 Produkte, 3 Monate Daten → Scoreboard und Abrechnung stimmen mit Handrechnung überein.
- Druck: 2 Seiten A4 quer, Kopfzeile je Seite, ≥ 25 Personen laufen sauber auf Folgeseite.
- Handy-Bedienung mit einer Hand: Buchung in ≤ 3 Taps.
- Export → Daten löschen → Import stellt identischen Zustand her.
- localStorage/IndexedDB-Verlust simuliert (einer leer) → Daten werden aus dem anderen wiederhergestellt (Prototyp-Verhalten; in der finalen App reicht IndexedDB + Backup).
- Als Home-Bildschirm-App auf dem iPhone installiert, nach 10 Tagen ohne Nutzung noch alle Daten vorhanden.
