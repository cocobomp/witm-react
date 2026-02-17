---
title: "Quoi de neuf : Sécurité & Performance sous le capot"
date: 2026-02-18
excerpt: "On a bossé dur pour renforcer WITM en coulisses. Des règles de sécurité Firestore à un matchmaking plus rapide — voici ce qui a changé."
tags: [update, security, performance, firebase]
author: Corentin Bompard
lang: fr
---

# Quoi de neuf : Sécurité & Performance sous le capot

Vous ne verrez peut-être pas ces changements à l'écran, mais croyez-nous — ils comptent. Cette mise à jour se concentre sur la sécurité, la rapidité et la fiabilité de WITM pour chaque soirée jeu.

## Règles de sécurité Firestore

On a déployé des règles de sécurité complètes pour protéger vos données :

- **Votre profil vous appartient.** Vous seul pouvez lire et modifier vos données. Personne d'autre ne peut voir vos stats ou changer votre avatar.
- **Intégrité des rooms.** Seul l'hôte peut modifier ou supprimer une room. Les joueurs peuvent rejoindre et quitter, mais pas toucher aux données des autres.
- **Votes sécurisés.** Les votes sont en écriture unique — personne ne peut changer son vote après l'avoir soumis. Fair-play garanti.
- **Questions protégées.** Les questions publiques sont en lecture seule. Seul l'auteur original peut modifier ses questions proposées.

## Matchmaking plus rapide

On a optimisé le chargement des données joueurs quand vous rejoignez une room. Avant, l'appli récupérait chaque profil un par un. Maintenant elle les récupère tous en parallèle — le lobby se charge nettement plus vite, surtout pour les grands groupes.

On a aussi ajouté des timeouts sur toutes les requêtes réseau pour que l'appli ne reste jamais bloquée si votre connexion coupe un instant.

## Gestion d'erreurs intelligente

Quand quelque chose tourne mal (connexion coupée, vote échoué, notification non envoyée), l'appli gère maintenant la situation proprement au lieu de planter en silence. Vous avez un retour clair, et la partie continue.

Concrètement :
- **Les erreurs de vote** remontent maintenant jusqu'à l'interface pour que vous sachiez si quelque chose a dérapé.
- **Les échecs de notification** sont gérés individuellement — une notification ratée ne bloque pas les autres.
- **Le nettoyage des rooms** tourne en arrière-plan sans risquer de crash.

## Améliorations Cloud Functions

Notre système de notifications backend a reçu une mise à jour majeure :
- **Validation des données** sur chaque déclencheur — les données malformées sont rejetées avant tout envoi.
- **Nettoyage des tokens invalides** — si le token de votre appareil expire, le système le supprime automatiquement au lieu de réessayer à l'infini.
- **Traitement parallèle** — les notifications à plusieurs joueurs sont maintenant envoyées simultanément.

## Et ensuite ?

On améliore WITM en permanence pour vous offrir la meilleure expérience de jeu. Restez connectés pour de nouveaux modes de jeu, de meilleures animations et plus de fonctionnalités sociales.

Des retours ? On veut vous entendre !
