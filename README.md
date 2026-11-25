# Strichliste

Verwaltung der Büro-Strichlisten (Kaffee, Twix, Getränke …): erfassen, abrechnen, 2 Papierlisten drucken, Scoreboard. Läuft als Web-App (PWA) komplett lokal im Browser, kein Server, kein Login, keine Daten im Netz.

## Auf dem iPhone installieren
1. Seite in **Safari** öffnen (Adresse siehe unten, kein Konto nötig).
2. Teilen → **Zum Home-Bildschirm** → Hinzufügen.
3. App **vom Home-Bildschirm aus** öffnen und erst dort Daten anlegen. Die installierte App hat unter iOS einen eigenen Speicher, getrennt vom Safari-Tab.
4. Regelmäßig **Verwalten → Backup sichern** (Teilen → In Dateien sichern).

Wichtig: App-Icon löschen oder „Websitedaten löschen“ entfernt alle Daten. Backup-Datei vorher sichern. Wiederherstellen: Verwalten → Import.

## Aktualisieren
Neue Version hochladen → das Gerät lädt sie beim nächsten Start mit Internet, ein Hinweis erscheint. App einmal komplett schließen und neu öffnen.

## Veröffentlichen (GitHub Pages)
Repo → Settings → Pages → Branch `main`, Ordner `/ (root)`. Adresse: `https://<benutzer>.github.io/<repo>/`
Nur die Programmdateien liegen öffentlich im Repo, nie Daten.

## Entwicklung
Keine Build-Schritte. Dateien: `index.html` (gesamte App), `sw.js` (Offline-Cache), `manifest.webmanifest`, `icons/`.
Lokal testen: `python3 -m http.server 8000` → http://localhost:8000
Bei jeder Änderung `VERSION` in `index.html` und `V` in `sw.js` hochzählen, sonst bekommen Geräte kein Update.
Anforderungen und Roadmap: `SPEC.md`, Arbeitsregeln für Claude Code: `CLAUDE.md`.

## Windows-PC / Firefox
Seite normal im Browser öffnen. Die Daten liegen automatisch im Browserspeicher dieses Browsers/Profils (kein Server, kein Login). Unter Verwalten ganz unten zeigt die **Speicher-Diagnose**, was gespeichert ist. Backup über „Kopieren“ (Verwalten oder roter Hinweis).
Sicherung: Verwalten → **Backup kopieren** (Text in die Zwischenablage, dann in Editor/Mail einfügen und speichern) oder der rote Hinweis oben nach 7 Tagen. Wiederherstellen: Verwalten → **Import (Text)**. Es gibt bewusst keinen Datei-Export, weil Downloads in der Firmenumgebung gesperrt sind.
