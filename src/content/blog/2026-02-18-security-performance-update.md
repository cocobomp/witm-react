---
title: "What's New: Security & Performance Under the Hood"
date: 2026-02-18
excerpt: "We've been busy hardening WITM behind the scenes. From Firestore security rules to faster matchmaking — here's what changed."
tags: [update, security, performance, firebase]
author: Corentin Bompard
lang: en
---

# What's New: Security & Performance Under the Hood

You might not see these changes on screen, but trust us — they matter. This update focuses on making WITM more secure, faster, and more reliable for every game night.

## Firestore Security Rules

We've deployed comprehensive security rules to protect your data:

- **Your profile is yours.** Only you can read and write your own user data. No one else can peek at your stats or change your avatar.
- **Room integrity.** Only the host can update or delete a room. Players can join and leave, but they can't tamper with other people's data.
- **Vote safety.** Votes are write-once — no one can change their vote after submitting. Fair play guaranteed.
- **Question protection.** Public questions are read-only. Only the original author can edit their proposed questions.

## Faster Matchmaking

We optimized how the app loads player data when you join a room. Previously, the app fetched each player's profile one by one. Now it fetches them all in parallel — meaning the lobby loads significantly faster, especially for larger groups.

We also added timeouts to all network requests so the app never hangs indefinitely if your connection drops for a moment.

## Smarter Error Handling

When something goes wrong (a dropped connection, a failed vote, a notification that didn't send), the app now handles it gracefully instead of failing silently. You'll get clear feedback, and the game keeps running.

Specifically:
- **Voting errors** now bubble up to the UI so you know if something went wrong.
- **Notification failures** are handled individually — one failed push notification won't block the rest.
- **Room cleanup** runs safely in the background without risking crashes.

## Cloud Functions Improvements

Our backend notification system got a major upgrade:
- **Data validation** on every trigger — malformed data is rejected before any notification goes out.
- **Invalid token cleanup** — if your device token expires, the system automatically removes it instead of retrying forever.
- **Parallel processing** — notifications to multiple players are now sent concurrently.

## What's Next

We're constantly improving WITM to give you the best party game experience. Stay tuned for new game modes, better animations, and more social features.

Got feedback? We'd love to hear from you!
