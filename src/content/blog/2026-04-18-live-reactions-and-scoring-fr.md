---
title: "Reactions en direct & Consensus Scoring : la salle devient plus bruyante"
date: 2026-04-18
excerpt: "Des reactions emoji qui traversent l'ecran en temps reel, et un nouveau moteur de score qui recompense la lecture du groupe. La version 2.6.0 est entierement dediee au ressenti du jeu."
tags: [update, reactions, scoring, new-feature, gameplay, engagement]
author: Corentin Bompard
lang: fr
---

# Reactions en direct & Consensus Scoring : la salle devient plus bruyante

La version 2.6.0 n'est pas une histoire de nouvelles questions ou de nouveaux modes. C'est une histoire de **ressenti** — ces micro-instants entre les rounds qui transforment un bon jeu en un tres bon jeu.

Deux gros changements dans cette release : les **reactions emoji en direct** pendant la phase de resultats, et un **tout nouveau moteur de score** qui repense completement ce que gagner veut dire.

## Reactions en direct : enfin, vous pouvez hurler sur l'ecran

Pendant le reveal des resultats, chaque joueur peut desormais taper sur l'un des six emojis :

😂 😱 🤔 👏 💀 🔥

Tapez dessus, et l'emoji traverse l'ecran de tous les joueurs en temps reel — avec un retour haptique sur votre appareil et un overlay propre chez les autres. C'est l'equivalent numerique du groupe qui gueule devant la TV pendant un match.

Quelques choix de design :

- **Six emojis, pas de texte** — les reactions doivent etre instantanees. Taper tue le rythme.
- **Anonyme par defaut** — l'overlay affiche l'emoji, pas celui qui l'a envoye. On veut du chaos, pas des accusations.
- **Rate-limite** — impossible de spammer l'ecran. Un emoji a la fois, petit cooldown.
- **En mode duo ou mariage ?** Vous avez un set d'emojis dedie (❤️ 😍 🥰 🎉 🥂 💍) accorde au contexte.

Sur le papier, c'est une petite feature. En pratique, ca change completement l'energie de l'ecran de resultats.

## Consensus Scoring : lire le groupe, c'est gagner

Voici la philosophie du nouveau systeme :

> Recevoir des votes, c'est MAL. Tu es "le plus". C'est un malus.
> Mais deviner correctement qui le groupe va choisir, c'est BIEN. C'est un bonus.

L'ancien scoring etait simple : vous gagniez des points quand on votait pour vous. Fun sur quelques rounds, mais ca aplatissait le jeu — la personne la plus "bruyante" du groupe gagnait toujours parce qu'elle recevait le plus de votes.

Le nouveau systeme inverse la logique :

| Situation | Joueur qui a recu des votes | Votant qui l'a choisi |
|---|---|---|
| Unanime (100%) | −10 malus en plus | +3 bonus |
| Ecrasant (≥75%) | −5 malus en plus | +2 bonus |
| Majorite simple (<75%) | 0 malus en plus | +1 bonus |
| Egalite (deux joueurs a egalite) | pas de malus en plus | +1 pour chaque choix valide |

En plus de ca, **chaque joueur qui recoit au moins un vote ecope de −(votes recus)** comme malus de base. La seule facon de grimper au classement, c'est de bien lire le groupe.

## Le multiplicateur x2 : les deux derniers rounds pesent

Pour les parties de 3 rounds ou plus, **les deux derniers rounds valent le double**. Ca garde le jeu vivant jusqu'au dernier vote — un comeback de fin de partie est toujours possible, et une grosse avance n'est jamais safe.

On a beaucoup teste cette regle. Avant, les parties semblaient "jouees" apres le round 3. Maintenant elles restent tendues jusqu'au bout.

## Mettre tout ca ensemble

Entre les rounds, vous voyez desormais :
- Votre score cumule avec les changements de rang
- Un classement propre avec des fleches de rang (↑ ↓)
- Un indicateur de multiplicateur quand le x2 s'active

Et a la fin, la ceremonie des Awards boucle tout — on a ecrit un [article dedie juste ici](/blog/2026-04-18-end-of-game-awards).

## Pourquoi ca compte

Un jeu, ce n'est pas juste des regles et du contenu. C'est **du tempo, du feedback et des enjeux**. Les reactions donnent le tempo et le feedback. Le consensus scoring donne les enjeux. Les awards donnent le debrief.

Trois petites features. Un jeu beaucoup plus reussi.

## Disponible maintenant

Tout est live dans la version 2.6.0. Mettez a jour votre app sur l'[App Store](https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093) ou [Google Play](https://play.google.com/store/apps/details?id=com.qelp.ch).

Ouvrez une room, balancez un 💀 pendant les resultats, et voyez si vous lisez le groupe mieux qu'il ne se lit lui-meme.
