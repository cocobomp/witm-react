---
title: "Hinter dem Code: Wie WITM gebaut ist"
date: 2026-02-17
excerpt: "Ein Blick unter die Haube der Architektur hinter WITM. Von Echtzeit-Multiplayer-Sync bis Clean Architecture — so haben wir ein Partyspiel gebaut, das einfach funktioniert."
tags: [tech, architecture, flutter, firebase]
author: Corentin Bompard
lang: de
---

# Hinter dem Code: Wie WITM gebaut ist

Ein Echtzeit-Multiplayer-Partyspiel zu entwickeln ist keine leichte Aufgabe. Als wir mit der Arbeit an WITM begannen, wussten wir, dass wir eine Architektur brauchen, die Live-Abstimmungen, sofortige Synchronisation zwischen Spielern und ein flussiges Erlebnis selbst bei instabiler Verbindung bewaltigen kann. Hier ist ein Blick hinter die Kulissen.

## Das grosse Bild: Clean Architecture

WITM folgt einem **Clean Architecture**-Ansatz mit vier klar getrennten Schichten:

- **Domain** — Das Herz der App. Geschaftsmodelle (Benutzer, Raume, Fragen), abstrakte Schnittstellen fur Repositories und Services. Diese Schicht hat keine Abhangigkeit von Flutter oder Firebase.
- **Data** — Die Implementierungsschicht. Firestore-Repositories, lokaler Speicher und alles, was mit der Aussenwelt kommuniziert.
- **Core** — Der Infrastruktur-Klebstoff. Dependency Injection, Routing, Authentifizierung, Werbung, Audio, Lokalisierung — alle Dienste, die die App braucht.
- **Features** — Die Benutzeroberflache. Jeder Bildschirm lebt in seinem eigenen Ordner mit eigener Logik. Authentifizierung, Lobby, Spielablauf, Rangliste, Einstellungen, Profil.

Diese Trennung bedeutet, dass wir Firebase durch ein anderes Backend ersetzen, das UI-Framework wechseln oder ein Feature umbauen konnen — ohne alles andere kaputt zu machen. Es macht auch das Testen und Debuggen viel einfacher.

## Echtzeit-Multiplayer mit Firestore

Das Herzstuck von WITMs Multiplayer-Erlebnis basiert auf **Cloud Firestore Streams**. Wenn ein Host einen Raum erstellt, erhalt jeder verbundene Spieler Live-Updates uber Firestores Echtzeit-Listener.

So lauft ein typisches Spiel ab:

1. **Raum erstellen** — Der Host wahlt die Einstellungen (Kategorie, Rundenanzahl, Timer-Dauer) und erstellt einen Raum mit einem einzigartigen PIN-Code.
2. **Lobby** — Spieler treten mit dem PIN bei. Jeder sieht in Echtzeit, wer im Raum ist.
3. **Spielablauf** — Fragen erscheinen gleichzeitig fur alle Spieler. Ein Countdown-Timer lauft. Spieler stimmen ab. Wenn alle abgestimmt haben (oder der Timer ablauft), werden die Ergebnisse sofort angezeigt.
4. **Rangliste** — Nach allen Runden wird das finale Ranking angezeigt.

All dies wird von Firestore-Dokument-Listenern angetrieben. Wenn der Host eine Runde weiterschaltet, aktualisiert sich der Bildschirm jedes Spielers innerhalb von Millisekunden. Wir haben auch **Offline-Persistenz** aktiviert, damit die App auch bei einem kurzen Verbindungsabbruch funktionsfahig bleibt.

## State Management: Pragmatisch, nicht dogmatisch

Wir verwenden einen hybriden Ansatz:

- **ValueNotifier** fur den globalen App-Zustand (aktueller Benutzer, Sprache) — einfach, leichtgewichtig, kein Boilerplate.
- **Provider (ChangeNotifier)** fur Widget-Tree-State, der Rebuilds uberstehen muss.
- **Firestore Streams** fur alle Echtzeit-Spieldaten — die einzige Quelle der Wahrheit wahrend des Spiels.

Keine uber-engineerte State-Management-Bibliothek. Jedes Tool wird dort eingesetzt, wo es am meisten Sinn macht.

## Dependency Injection mit GetIt

Alle unsere Services und Repositories sind als **Lazy Singletons** uber GetIt registriert. Das bedeutet:

- Services werden erst erstellt, wenn sie zum ersten Mal benotigt werden.
- Jeder Teil der App kann darauf zugreifen, ohne sie durch Konstruktoren durchzureichen.
- Implementierungen austauschen (z.B. Mock-Services fur Tests) ist trivial.

Das DI-Setup ist in Module aufgeteilt: eines fur Firebase-Instanzen, eines fur Business-Services (Auth, Audio, Konnektivitat, Benachrichtigungen).

## Drei Sprachen von Anfang an

WITM unterstutzt **Englisch, Franzosisch und Deutsch** uber Flutters eingebautes Lokalisierungssystem. Jede Sprache hat ihre eigene ARB-Datei, und Ubersetzungen werden zur Kompilierzeit generiert. Benutzer konnen die Sprache jederzeit wechseln, und ihre Praferenz wird sowohl lokal als auch in ihrem Firestore-Profil gespeichert.

Fragen unterstutzen ebenfalls Ubersetzungen — jedes Fragen-Dokument in Firestore enthalt eine `translations`-Map, und die App wahlt automatisch die richtige Version basierend auf der Sprache des Benutzers.

## Intelligente Raum-Architektur

Das Raum-Repository verwendet ein **Facade Pattern**, das an spezialisierte Sub-Services delegiert:

- **Base Repository** — CRUD fur Raume und Statusverwaltung
- **Player Service** — Beitritts-/Verlassensoperationen und Spieler-Streams
- **Voting Service** — Abstimmungserfassung und Echtzeit-Aggregation
- **Round Service** — Rundenfortschrittslogik
- **Question Service** — Fragenabruf und Lokalisierung
- **Streams Service** — Kombinierte Echtzeit-Datenströme

Jedes Teil bleibt fokussiert und testbar, wahrend die Facade eine saubere API fur die UI-Schicht bietet.

## Sound, Werbung und die Details

- **Audio**: 8 Spielsounds (Countdown-Pieptone, Abstimmungsbestatigung, Ergebnis-Fanfare...) verwaltet durch einen eigenen Service. Benutzer konnen den Sound in den Einstellungen ein-/ausschalten, und die Praferenz synchronisiert sich mit ihrem Profil.
- **Werbung**: Interstitial-Anzeigen zwischen Spielen, betrieben von Google Mobile Ads.
- **Authentifizierung**: Google Sign-In und Apple Sign-In uber Firebase Auth.
- **Navigation**: GoRouter mit typsicheren Routen und Authentifizierungs-basierter Umleitung.

## Was kommt als Nachstes

Wir iterieren standig. Unsere Architektur ermoglicht es uns, schnell neue Features hinzuzufugen und dabei den Code sauber zu halten. Demnachst: verbesserte Animationen, neue Spielmodi und tiefere soziale Features.

Willst du es in Aktion sehen? Lade WITM herunter und starte ein Spiel mit deinen Freunden!
