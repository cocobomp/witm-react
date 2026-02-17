---
title: "Was gibt's Neues: Sicherheit & Performance unter der Haube"
date: 2026-02-18
excerpt: "Wir haben WITM hinter den Kulissen verstärkt. Von Firestore-Sicherheitsregeln bis zu schnellerem Matchmaking — hier ist, was sich geändert hat."
tags: [update, security, performance, firebase]
author: Corentin Bompard
lang: de
---

# Was gibt's Neues: Sicherheit & Performance unter der Haube

Diese Änderungen sieht man vielleicht nicht auf dem Bildschirm, aber glaubt uns — sie sind wichtig. Dieses Update konzentriert sich darauf, WITM sicherer, schneller und zuverlässiger für jeden Spieleabend zu machen.

## Firestore-Sicherheitsregeln

Wir haben umfassende Sicherheitsregeln eingeführt, um eure Daten zu schützen:

- **Euer Profil gehört euch.** Nur ihr könnt eure eigenen Daten lesen und ändern. Niemand sonst kann eure Stats einsehen oder euren Avatar ändern.
- **Room-Integrität.** Nur der Host kann einen Room ändern oder löschen. Spieler können beitreten und verlassen, aber nicht die Daten anderer manipulieren.
- **Sichere Abstimmungen.** Stimmen können nur einmal abgegeben werden — niemand kann seine Stimme nachträglich ändern. Faires Spiel garantiert.
- **Geschützte Fragen.** Öffentliche Fragen sind schreibgeschützt. Nur der ursprüngliche Autor kann seine vorgeschlagenen Fragen bearbeiten.

## Schnelleres Matchmaking

Wir haben optimiert, wie die App Spielerdaten beim Beitritt zu einem Room lädt. Vorher hat die App jedes Profil einzeln abgerufen. Jetzt werden alle parallel geladen — die Lobby lädt deutlich schneller, besonders bei größeren Gruppen.

Außerdem haben wir Timeouts für alle Netzwerkanfragen hinzugefügt, damit die App niemals endlos hängt, wenn die Verbindung kurz abbricht.

## Intelligentere Fehlerbehandlung

Wenn etwas schiefgeht (Verbindungsabbruch, fehlgeschlagene Abstimmung, nicht gesendete Benachrichtigung), geht die App jetzt elegant damit um, statt stillschweigend zu versagen. Ihr bekommt klares Feedback, und das Spiel läuft weiter.

Im Detail:
- **Abstimmungsfehler** werden jetzt bis zur Oberfläche weitergegeben, damit ihr wisst, wenn etwas schiefgelaufen ist.
- **Benachrichtigungsfehler** werden einzeln behandelt — eine fehlgeschlagene Push-Benachrichtigung blockiert nicht die restlichen.
- **Room-Bereinigung** läuft sicher im Hintergrund, ohne Absturzrisiko.

## Cloud Functions Verbesserungen

Unser Backend-Benachrichtigungssystem wurde grundlegend verbessert:
- **Datenvalidierung** bei jedem Trigger — fehlerhafte Daten werden abgelehnt, bevor eine Benachrichtigung rausgeht.
- **Bereinigung ungültiger Tokens** — wenn euer Geräte-Token abläuft, entfernt das System ihn automatisch, statt endlos zu wiederholen.
- **Parallele Verarbeitung** — Benachrichtigungen an mehrere Spieler werden jetzt gleichzeitig gesendet.

## Was kommt als Nächstes

Wir verbessern WITM ständig, um euch das beste Partyspiel-Erlebnis zu bieten. Bleibt dran für neue Spielmodi, bessere Animationen und mehr soziale Features.

Feedback? Wir freuen uns, von euch zu hören!
