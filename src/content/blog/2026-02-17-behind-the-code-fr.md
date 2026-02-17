---
title: "Dans les coulisses : comment WITM est construit"
date: 2026-02-17
excerpt: "Un regard sous le capot de l'architecture qui fait tourner WITM. Du multijoueur en temps reel a l'architecture clean — voici comment on a construit un jeu de soiree qui fonctionne vraiment."
tags: [tech, architecture, flutter, firebase]
author: Corentin Bompard
lang: fr
---

# Dans les coulisses : comment WITM est construit

Construire un jeu multijoueur en temps reel, c'est un sacre defi. Quand on a commence a travailler sur WITM, on savait qu'il fallait une architecture capable de gerer des votes en direct, une synchronisation instantanee entre les joueurs, et une experience fluide meme avec une connexion instable. Voici un apercu de ce qui se passe sous le capot.

## La vue d'ensemble : Clean Architecture

WITM suit une approche **Clean Architecture** avec quatre couches distinctes :

- **Domain** — Le coeur de l'application. Les modeles metier (utilisateurs, salons, questions), les interfaces abstraites pour les repositories et services. Cette couche n'a aucune dependance a Flutter ou Firebase.
- **Data** — La couche d'implementation. Les repositories Firestore, le stockage local, et tout ce qui communique avec l'exterieur.
- **Core** — La colle d'infrastructure. Injection de dependances, routing, authentification, publicites, audio, localisation — tous les services dont l'app a besoin.
- **Features** — L'interface utilisateur. Chaque ecran vit dans son propre dossier avec sa propre logique. Authentification, lobby, partie, classement, parametres, profil.

Cette separation signifie qu'on peut remplacer Firebase par un autre backend, changer le framework UI, ou refactoriser une fonctionnalite — sans tout casser. Ca rend aussi le test et le debogage bien plus simples.

## Multijoueur en temps reel avec Firestore

Le coeur de l'experience multijoueur de WITM repose sur les **streams Cloud Firestore**. Quand un hote cree un salon, chaque joueur connecte recoit les mises a jour en direct via les listeners temps reel de Firestore.

Voici le deroulement typique d'une partie :

1. **Creation du salon** — L'hote choisit les parametres (categorie, nombre de manches, duree du timer) et cree un salon avec un code PIN unique.
2. **Lobby** — Les joueurs rejoignent avec le PIN. Tout le monde voit qui est dans le salon en temps reel.
3. **Jeu** — Les questions apparaissent simultanement pour tous les joueurs. Un compte a rebours tourne. Les joueurs votent. Quand tout le monde a vote (ou que le timer expire), les resultats sont reveles instantanement.
4. **Classement** — Apres toutes les manches, le classement final est affiche.

Tout cela est alimente par les listeners de documents Firestore. Quand l'hote avance d'une manche, l'ecran de chaque joueur se met a jour en quelques millisecondes. On a aussi active la **persistence hors ligne**, pour que l'app reste fonctionnelle meme lors d'une breve coupure de connexion.

## Gestion d'etat : pragmatique, pas dogmatique

On utilise une approche hybride :

- **ValueNotifier** pour l'etat global de l'app (utilisateur actuel, langue) — simple, leger, zero boilerplate.
- **Provider (ChangeNotifier)** pour l'etat du widget tree qui doit survivre aux rebuilds.
- **Streams Firestore** pour toutes les donnees de jeu en temps reel — la source unique de verite pendant la partie.

Pas de librairie de gestion d'etat sur-engineeree. Chaque outil est utilise la ou il a le plus de sens.

## Injection de dependances avec GetIt

Tous nos services et repositories sont enregistres en **lazy singletons** via GetIt. Ca signifie :

- Les services sont crees uniquement quand ils sont utilises pour la premiere fois.
- N'importe quelle partie de l'app peut y acceder sans les passer dans les constructeurs.
- Remplacer une implementation (par exemple, des services mock pour les tests) est trivial.

La configuration DI est decoupee en modules : un pour les instances Firebase, un pour les services metier (auth, audio, connectivite, notifications).

## Trois langues des le premier jour

WITM supporte **l'anglais, le francais et l'allemand** via le systeme de localisation integre de Flutter. Chaque langue a son propre fichier ARB, et les traductions sont generees a la compilation. Les utilisateurs peuvent changer de langue a la volee, et leur preference est sauvegardee en local et dans leur profil Firestore.

Les questions supportent aussi les traductions — chaque document question dans Firestore contient une map `translations`, et l'app choisit automatiquement la bonne version selon la langue de l'utilisateur.

## Architecture intelligente des salons

Le repository des salons utilise un **pattern facade** qui delegue a des sous-services specialises :

- **Base Repository** — CRUD des salons et gestion des statuts
- **Player Service** — Operations de join/leave et streams des joueurs
- **Voting Service** — Enregistrement des votes et agregation en temps reel
- **Round Service** — Logique de progression des manches
- **Question Service** — Recuperation et localisation des questions
- **Streams Service** — Flux de donnees combines en temps reel

Chaque piece reste focalisee et testable, tandis que la facade fournit une API propre pour la couche UI.

## Son, pubs et les details

- **Audio** : 8 sons de jeu (bips de compte a rebours, confirmation de vote, fanfare des resultats...) geres par un service dedie. Les utilisateurs peuvent activer/desactiver le son dans les parametres, et la preference se synchronise avec leur profil.
- **Publicites** : Des pubs interstitielles entre les parties, via Google Mobile Ads.
- **Authentification** : Google Sign-In et Apple Sign-In via Firebase Auth.
- **Navigation** : GoRouter avec des routes type-safe et redirection basee sur l'authentification.

## La suite

On itere en permanence. Notre architecture nous permet d'ajouter des fonctionnalites rapidement tout en gardant le code propre. A venir : des animations ameliorees, de nouveaux modes de jeu, et des fonctionnalites sociales plus poussees.

Envie de voir ca en action ? Telechargez WITM et lancez une partie avec vos amis !
