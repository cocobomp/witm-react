---
title: "Live-Reaktionen & Consensus Scoring: Der Raum wird lauter"
date: 2026-04-18
excerpt: "Emoji-Reaktionen, die in Echtzeit ueber den Bildschirm fliegen, und ein neues Punktesystem, das gutes Lesen der Gruppe belohnt. Version 2.6.0 dreht sich ganz um das Spielgefuehl."
tags: [update, reactions, scoring, new-feature, gameplay, engagement]
author: Corentin Bompard
lang: de
---

# Live-Reaktionen & Consensus Scoring: Der Raum wird lauter

Version 2.6.0 bringt weder neue Fragen noch neue Modi. Es geht um das **Spielgefuehl** — diese kleinen Momente zwischen den Runden, die aus einem guten Spiel ein grossartiges machen.

Zwei grosse Aenderungen in diesem Release: **Live-Emoji-Reaktionen** waehrend der Ergebnisphase und eine **voellig neue Scoring-Engine**, die komplett neu definiert, was Gewinnen bedeutet.

## Live-Reaktionen: Endlich koennt ihr den Bildschirm anschreien

Waehrend der Ergebnispraesentation kann jeder Spieler jetzt auf einen von sechs Emoji-Buttons tippen:

😂 😱 🤔 👏 💀 🔥

Tippt drauf, und das Emoji fliegt in Echtzeit ueber den Bildschirm aller Spieler — mit haptischem Feedback auf eurem Geraet und einem sauberen Overlay bei allen anderen. Das digitale Aequivalent dazu, wenn die Gruppe bei einem Fussballspiel den Fernseher anschreit.

Ein paar Design-Entscheidungen:

- **Sechs Emojis, kein Text** — Reaktionen muessen sofort sein. Tippen toetet den Rhythmus.
- **Standardmaessig anonym** — das Overlay zeigt das Emoji, nicht den Absender. Wir wollen Chaos, keine Anschuldigungen.
- **Rate-limitiert** — kein Spam auf dem Bildschirm. Ein Emoji nach dem anderen, kurze Abklingzeit.
- **Im Duo- oder Hochzeitsmodus?** Ihr bekommt ein eigenes Emoji-Set (❤️ 😍 🥰 🎉 🥂 💍), abgestimmt auf die Stimmung.

Auf dem Papier ist das ein kleines Feature. In der Praxis veraendert es die Energie des Ergebnisbildschirms komplett.

## Consensus Scoring: Die Gruppe lesen = gewinnen

Die Philosophie hinter dem neuen System:

> Stimmen zu bekommen ist SCHLECHT. Du bist "der Meiste". Das ist ein Malus.
> Aber richtig zu erraten, wen die Gruppe waehlen wird, ist GUT. Das ist ein Bonus.

Das alte System war einfach: Punkte, wenn jemand fuer dich stimmt. Spassig fuer ein paar Runden, aber es hat das Spiel flachgedrueckt — die "lauteste" Person gewann immer, weil sie die meisten Stimmen bekam.

Das neue System dreht die Logik um:

| Situation | Spieler mit Stimmen | Waehler, der ihn gewaehlt hat |
|---|---|---|
| Einstimmig (100%) | −10 Extra-Malus | +3 Bonus |
| Erdrutsch (≥75%) | −5 Extra-Malus | +2 Bonus |
| Einfache Mehrheit (<75%) | 0 Extra-Malus | +1 Bonus |
| Gleichstand (zwei Spieler gleichauf) | kein Extra-Malus | +1 fuer jede gueltige Wahl |

Ausserdem: **Jeder Spieler, der mindestens eine Stimme erhaelt, bekommt −(erhaltene Stimmen)** als Grund-Malus. Der einzige Weg nach oben fuehrt ueber gutes Lesen der Gruppe.

## Der x2-Multiplikator: Die letzten zwei Runden zaehlen

Bei Partien mit 3 oder mehr Runden zaehlen die **letzten beiden Runden doppelt**. Das haelt das Spiel bis zur letzten Stimme lebendig — ein spaetes Comeback ist immer moeglich, ein grosser Vorsprung nie sicher.

Wir haben das ausgiebig getestet. Frueher fuehlten sich Partien nach Runde 3 "entschieden" an. Jetzt bleiben sie bis zum Schluss spannend.

## Alles zusammengefuehrt

Zwischen den Runden seht ihr jetzt:
- Euren kumulierten Punktestand mit Rangaenderungen
- Eine saubere Bestenliste mit Rang-Pfeilen (↑ ↓)
- Einen Multiplikator-Hinweis, sobald x2 aktiv wird

Und am Ende rundet die Award-Zeremonie alles ab — wir haben [einen eigenen Artikel dazu geschrieben](/blog/2026-04-18-end-of-game-awards).

## Warum das wichtig ist

Ein Spiel besteht nicht nur aus Regeln und Inhalten. Es besteht aus **Tempo, Feedback und Einsaetzen**. Reaktionen geben das Tempo und Feedback. Consensus Scoring gibt die Einsaetze. Awards geben das Nachspiel.

Drei kleine Features. Ein deutlich besseres Spiel.

## Jetzt verfuegbar

Alles ist live in Version 2.6.0. Aktualisiert eure App im [App Store](https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093) oder bei [Google Play](https://play.google.com/store/apps/details?id=com.qelp.ch).

Oeffnet eine Room, werft ein 💀 waehrend der Ergebnisse und schaut, ob ihr die Gruppe besser lest als sie sich selbst.
