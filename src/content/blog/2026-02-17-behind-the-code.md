---
title: "Behind the Code: How WITM Is Built"
date: 2026-02-17
excerpt: "A look under the hood at the architecture powering WITM. From real-time multiplayer sync to clean architecture — here's how we built a party game that just works."
tags: [tech, architecture, flutter, firebase]
author: Corentin Bompard
lang: en
---

# Behind the Code: How WITM Is Built

Building a real-time multiplayer party game is no small feat. When we started working on WITM, we knew we needed an architecture that could handle live voting, instant synchronization between players, and a smooth experience even on shaky connections. Here's a peek behind the curtain.

## The Big Picture: Clean Architecture

WITM follows a **Clean Architecture** approach with four distinct layers:

- **Domain** — The heart of the app. Business models (users, rooms, questions), abstract interfaces for repositories and services. This layer has zero dependency on Flutter or Firebase.
- **Data** — The implementation layer. Firestore repositories, local storage, and everything that talks to the outside world.
- **Core** — Infrastructure glue. Dependency injection, routing, authentication, ads, audio, localization — all the services the app needs to run.
- **Features** — The UI. Each screen lives in its own folder with its own logic. Authentication, lobby, game play, leaderboard, settings, profile.

This separation means we can swap out Firebase for another backend, change the UI framework, or refactor a feature — without breaking everything else. It also makes testing and debugging much more manageable.

## Real-Time Multiplayer with Firestore

The core of WITM's multiplayer experience relies on **Cloud Firestore streams**. When a host creates a room, every player connected to that room receives live updates through Firestore's real-time listeners.

Here's how a typical game flows:

1. **Room Creation** — The host picks settings (category, number of rounds, timer duration) and creates a room with a unique PIN code.
2. **Lobby** — Players join using the PIN. Everyone sees who's in the room in real-time.
3. **Game Play** — Questions appear simultaneously for all players. A countdown timer runs. Players vote. When everyone has voted (or the timer expires), results are revealed instantly.
4. **Leaderboard** — After all rounds, the final ranking is displayed.

All of this is powered by Firestore document listeners. When the host advances a round, every player's screen updates within milliseconds. We also enabled **offline persistence**, so the app stays functional even with a brief connection drop.

## State Management: Pragmatic, Not Dogmatic

We use a hybrid approach:

- **ValueNotifier** for global app state (current user, locale) — simple, lightweight, no boilerplate.
- **Provider (ChangeNotifier)** for widget tree state that needs to survive rebuilds.
- **Firestore Streams** for all real-time game data — the single source of truth during gameplay.

No over-engineered state management library. Each tool is used where it makes the most sense.

## Dependency Injection with GetIt

All our services and repositories are registered as **lazy singletons** through GetIt. This means:

- Services are created only when first needed.
- Any part of the app can access them without passing them through constructors.
- Swapping implementations (e.g., mock services for testing) is trivial.

The DI setup is split into modules: one for Firebase instances, one for business services (auth, audio, connectivity, notifications).

## Three Languages from Day One

WITM supports **English, French, and German** using Flutter's built-in localization system. Each language has its own ARB file, and translations are generated at compile time. Users can switch languages on the fly, and their preference is saved both locally and in their Firestore profile.

Questions also support translations — each question document in Firestore contains a `translations` map, and the app automatically picks the right version based on the user's locale.

## Smart Room Architecture

The room repository uses a **facade pattern** that delegates to specialized sub-services:

- **Base Repository** — Room CRUD and status management
- **Player Service** — Join/leave operations and player streams
- **Voting Service** — Vote recording and real-time aggregation
- **Round Service** — Round progression logic
- **Question Service** — Fetching and localizing questions
- **Streams Service** — Combined real-time data streams

This keeps each piece focused and testable, while the facade provides a clean API for the UI layer.

## Sound, Ads, and the Details

- **Audio**: 8 game sounds (countdown beeps, vote confirmation, results fanfare...) managed through a dedicated service. Users can toggle sound on/off in settings, and the preference syncs to their profile.
- **Ads**: Interstitial ads between games, powered by Google Mobile Ads.
- **Authentication**: Google Sign-In and Apple Sign-In through Firebase Auth.
- **Navigation**: GoRouter with type-safe routes and auth-based redirection.

## What's Next

We're constantly iterating. Our architecture allows us to add features quickly while keeping the codebase clean. Coming up: improved animations, more game modes, and deeper social features.

Want to see it in action? Download WITM and start a game with your friends!
