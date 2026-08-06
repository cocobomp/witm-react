---
title: "Live Reactions & Consensus Scoring: The Room Just Got Louder"
date: 2026-04-18
excerpt: "Emoji reactions that float across the screen in real time, and a new scoring engine that rewards reading the room. Version 2.6.0 is all about game feel."
tags: [update, reactions, scoring, new-feature, gameplay, engagement]
author: Corentin Bompard
lang: en
---

# Live Reactions & Consensus Scoring: The Room Just Got Louder

Version 2.6.0 isn't about new questions or new modes. It's about **game feel** — the micro-moments between rounds that make a good game great.

Two big changes land in this release: **live emoji reactions** during the results phase, and a **brand-new scoring engine** that completely rethinks what it means to win.

## Live Reactions: Finally, You Can Yell at the Screen

During the results reveal, every player can now tap one of six emoji buttons:

😂 😱 🤔 👏 💀 🔥

Tap one, and it floats across every player's screen in real time — with haptic feedback on your device and a clean overlay on everyone else's. It's the digital equivalent of the group yelling at the TV during a sports match.

A few design choices:

- **Six emojis, no text** — reactions should be instant. Typing kills the vibe.
- **Anonymous by default** — the overlay shows the emoji, not who sent it. We want chaos, not callouts.
- **Rate-limited** — you can't spam the screen. One emoji at a time, small cooldown.
- **Playing duo or wedding mode?** You get a dedicated emoji set (❤️ 😍 🥰 🎉 🥂 💍) tuned for the vibe.

It's a small feature on paper. In practice, it completely changes the energy of the results screen.

## Consensus Scoring: Reading the Room Wins

Here's the philosophy behind the new scoring system:

> Being voted for is BAD. You are "the most." That's a malus.
> But correctly guessing who the group will pick is GOOD. That's a bonus.

The old scoring was simple: you got points when you were picked. Fun for a few rounds, but it flattened the game — the "loudest" person always won because they got the most votes.

The new system flips it:

| Situation | Player who got votes | Voter who picked them |
|---|---|---|
| Unanimous (100%) | −10 extra malus | +3 bonus |
| Landslide (≥75%) | −5 extra malus | +2 bonus |
| Simple majority (<75%) | 0 extra malus | +1 bonus |
| Tie (two players tied) | no extra malus | +1 for picking either |

On top of that, **every player who receives any vote gets −(votes received)** as a base malus. Reading the room correctly is the only way to climb.

## The x2 Multiplier: The Last Two Rounds Matter

For games of 3 rounds or more, the **final two rounds are worth double**. It keeps the game alive until the very end — a late-game comeback is always possible, and a big lead isn't safe.

We tested this hard. Games used to feel "decided" after round 3. Now they stay tense until the last vote.

## Putting It All Together

Between rounds, you now see:
- Your cumulative score with rank changes
- A clean leaderboard with rank arrows (↑ ↓)
- The multiplier indicator when x2 kicks in

And at the end, the Awards ceremony ties everything together — we wrote a [dedicated post about that here](/blog/2026-04-18-end-of-game-awards).

## Why This Matters

A game isn't just rules and content. It's **tempo, feedback, and stakes**. Reactions give you tempo and feedback. Consensus scoring gives you stakes. Awards give you the debrief.

Three small features. One much better game.

## Get It Now

Everything is live in version 2.6.0. Update your app on the [App Store](https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093) or [Google Play](https://play.google.com/store/apps/details?id=com.qelp.ch).

Open a room, throw a 💀 during the results, and see if you can read the group better than they read themselves.
