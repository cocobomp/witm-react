---
title: "Frühjahrs-Update 2026: Stimmen-Integrität, Barrierefreiheit und stille Politur"
date: 2026-04-26
excerpt: "Drei Wochen Audit und kleine, aber wichtige Fixes: Eure Stimmen sind jetzt manipulationssicher, jeder Button trifft 44 Pixel, und ältere App-Versionen funktionieren weiterhin nahtlos."
tags: [update, security, accessibility, audit, polish]
author: Corentin Bompard
lang: de
---

# Frühjahrs-Update 2026: Stimmen-Integrität, Barrierefreiheit und stille Politur

Manche Updates liefern ein glänzendes neues Feature. Dieses nicht. In den letzten drei Wochen haben wir die App gründlich auditiert — Sicherheit, Barrierefreiheit, Leistung, Code-Qualität — und 25 Korrekturen ausgeliefert. Die meisten wirst du nie bemerken. Und genau das ist der Punkt.

Hier ist, was sich geändert hat.

## Deine Stimmen sind jetzt manipulationssicher

Wenn du eine Frage in einem Raum mit 👍 oder 👎 bewertest, lebte diese Bewertung bisher im Raum selbst — in einer gemeinsamen Liste, die theoretisch jeder im Raum überschreiben konnte. Die Daten wurden nie tatsächlich missbraucht, aber ein entschlossener Spieler mit einem modifizierten Client hätte die eigenen Zähler aufblähen oder deine überschreiben können.

Nicht mehr. Jede Bewertung lebt jetzt in einem persönlichen Datensatz pro Nutzer und Frage, direkt von der Datenbank geschützt. Die Regel wird auf Speicherebene durchgesetzt:

> Ein Spieler kann nur seine eigene Bewertung schreiben. Deine kann er nie berühren.

Ältere App-Versionen funktionieren weiterhin normal — sie nutzen weiterhin das vorherige System, und die neue App liest beide Quellen transparent. Kein Bruch.

## Jeder Button trifft 44 Pixel

Wir sind Bildschirm für Bildschirm durchgegangen und haben sichergestellt, dass jedes antippbare Element das Barrierefreiheitsminimum von Apple und Google trifft: **44 × 44 Punkte**. Zu kleine Buttons haben Padding bekommen. Eng gepackte Icons haben Atemraum bekommen. Die Lobby, die Bewertungsleiste, die In-Game-Reaktionen — alle wurden angepasst.

Auch der Farbkontrast wurde überprüft. Einige Grenzfälle wurden über die WCAG-AA-Schwelle (4,5:1 für Fließtext) angehoben. Die App sollte jetzt etwas augenschonender sein — besonders im hellen Tageslicht.

## Übersetzungen, richtig zu Ende gebracht

Einige Fehlermeldungen waren noch hartcodiert auf Englisch ("Not enough players to start" und Konsorten). Alle davon sind jetzt in **Englisch, Französisch und Deutsch** lokalisiert — einschließlich der Couple-, Hochzeits- und Party-Modi.

Wenn deine App auf Französisch oder Deutsch eingestellt ist, sollten keine englischen Strings mehr durchrutschen.

## Rückwärtskompatibilität, leise stark

Eine subtile, aber wichtige Verschiebung: Wir haben sichergestellt, dass alles, was wir ausliefern, sauber mit älteren App-Versionen zusammenspielt, die noch im Umlauf sind. Wenn ein Freund noch nicht aktualisiert hat und deinem Raum beitritt, läuft das Spiel weiter ohne Fehler. Regeln, Datenformate, Nachrichtenflüsse — alles ist auf Kompatibilität ausgelegt.

Du würdest diese Arbeit nicht bemerken — aber genau das ist der Punkt: *Nichts* bricht, für niemanden, je.

## Kleinere Dinge

- Der Splash-Screen navigiert nicht mehr gelegentlich doppelt nach dem Login
- Das Leaderboard verarbeitet korrekt bis zu 499 Spieler in einem einzigen Batch
- Abstimmungen sind jetzt atomar — keine seltenen doppelten Zählungen mehr, wenn zwei Telefone im selben Augenblick abstimmen
- Eine Handvoll Speicherlecks in Animations-Handlern sind verschwunden

## Was als Nächstes kommt

Dies war ein Fundament-Update — Vertrauen und Politur festigen, bevor die nächste Feature-Welle kommt. Bleib dran.

In der Zwischenzeit: aktualisiere deine App im [App Store](https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093) oder bei [Google Play](https://play.google.com/store/apps/details?id=com.qelp.ch), versammle deine Freunde und spielt mit ruhigem Gewissen.
