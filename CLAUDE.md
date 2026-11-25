# Strichliste

Kleine App zur Verwaltung der Büro-Strichlisten (Kaffee, Twix, Getränke, Pizza …): Erfassen, Abrechnen, Drucken, Scoreboard. Läuft lokal auf dem Handy, keine Cloud.

**Zuerst lesen:** `SPEC.md` (Anforderungen, Datenmodell, Architektur, Roadmap). Aktueller Stand: lauffähige PWA ohne Build-Schritt (`index.html`, `sw.js`, `manifest.webmanifest`), Version siehe README.

## Sprache & Stil
- UI-Texte, Commit-Messages und Kommentare auf Deutsch, Code-Bezeichner auf Englisch.
- Knapp, keine Over-Engineering-Abstraktionen. Kein Framework-Zoo.

## Stack (Vorgabe)
Vite + TypeScript, Preact (oder Vanilla), IndexedDB via Dexie, vite-plugin-pwa, Vitest. Kein Backend, keine externen Requests zur Laufzeit. **Einzige Ausnahme:** optionale, standardmäßig ausgeschaltete Online-Sicherung (nur AES-256-GCM-verschlüsselter Text in ein privates GitHub-Repo, Zugang in Verwalten eingetragen; Klartext verlässt nie das Gerät).

## Struktur (Ziel)
```
src/domain/   reine Logik: Saldo, Ranking, Buchen, Export/Import (testbar, ohne DOM)
src/db/       Dexie-Schema, Migrationen
src/ui/       Views: erfassen, abrechnung, scoreboard, druck, verwalten
src/print.css Print-Layout (@page, mm-Höhen)
```

## Harte Regeln
- Beträge als Integer-Cent, nie Floats. Formatierung nur an der UI-Grenze (`Intl.NumberFormat('de-AT')`).
- Entry speichert Preis-Snapshot. Preisänderung darf alte Buchungen nicht verändern.
- Personen mit Buchungen nie löschen, nur deaktivieren.
- Personen = Dienstgrad + Nachname (keine Vornamen). Anzeige „OWm Gruber“. Dienstgrad-Liste in SPEC.md.
- Speicherstrategie siehe SPEC.md „Speicherstrategie (iPhone)“: IndexedDB, persist(), PWA-Installation, Backup-Erinnerung. Zielgerät ist iPhone/Safari, dort testen.
- Design: Bundesheer-Anmutung (Olivgrün/Sand/Rot), aber keine Wappen, Logos oder Bundesadler.
- Destruktive Aktionen (Zahlung löschen, Alles leeren, Import) mit Bestätigung, Import vorher automatischen Export anbieten.
- Jede DB-Schemaänderung = Dexie-Migration + Test mit altem Export.
- Keine Telemetrie, keine CDN-Skripte, keine Fonts von extern.
- Namen/Konsum sind personenbezogene Daten: nichts davon in Logs oder URLs.

## Tests
- `src/domain/` mit Vitest abdecken: Saldo mit Teilzahlungen/Guthaben, Zusammenführen von Buchungen, Ranking je Zeitraum, Preis-Snapshot, Export→Import identisch.
- Druck manuell prüfen: A4 quer + hoch, ≥ 25 Personen, Seitenumbruch mit wiederholter Kopfzeile.

## Befehle (nach Setup)
```
npm run dev       # Dev-Server
npm run build     # statischer Build in dist/
npm test          # Vitest
```

## Nächste Schritte für Claude Code
1. Single-File-App in Vite + TypeScript überführen, `src/domain/` samt Vitest-Tests extrahieren (Verhalten 1:1 beibehalten, Version/Cache-Handling per vite-plugin-pwa).
2. Dexie-Schema nach SPEC.md, JSON-Export/Import.
3. Views nach Prototyp nachbauen (Mobile-first, Bottom-Tabbar).
4. Druckansicht mit echtem `window.print()` auf Desktop und Handy testen.
