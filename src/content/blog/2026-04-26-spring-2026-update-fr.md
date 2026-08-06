---
title: "Mise à jour printemps 2026 : intégrité des votes, accessibilité et finitions"
date: 2026-04-26
excerpt: "Trois semaines d'audit et de petits correctifs : vos votes sont maintenant infalsifiables, chaque bouton fait 44 px, et les anciennes versions de l'app continuent de fonctionner sans accroc."
tags: [update, security, accessibility, audit, polish]
author: Corentin Bompard
lang: fr
---

# Mise à jour printemps 2026 : intégrité des votes, accessibilité et finitions

Certaines mises à jour apportent une nouvelle fonctionnalité spectaculaire. Celle-ci, non. Pendant trois semaines, on a passé l'app au peigne fin — sécurité, accessibilité, performances, qualité du code — et on a livré 25 correctifs. La plupart, tu ne les remarqueras jamais. Et c'est exactement le but.

Voici ce qui change.

## Tes votes sont maintenant infalsifiables

Quand tu notes une question 👍 ou 👎 dans une partie, cette note vivait jusqu'ici dans le document partagé de la salle — techniquement modifiable par n'importe qui dans la même room. Le problème n'a jamais été exploité, mais un joueur déterminé sur un client trafiqué aurait pu gonfler ses propres compteurs ou écraser les tiens.

Plus possible. Chaque note vit maintenant dans un enregistrement personnel, par utilisateur et par question, protégé directement par la base de données. La règle est appliquée côté stockage :

> Un joueur ne peut écrire que sa propre note. Il ne peut jamais toucher la tienne.

Les anciennes versions de l'app continuent de fonctionner normalement — elles utilisent l'ancien système, et la nouvelle app lit les deux sources sans friction. Aucune coupure.

## Chaque bouton fait 44 px

On a passé tous les écrans en revue pour s'assurer que chaque élément tactile respecte le minimum d'accessibilité d'Apple et Google : **44 × 44 points**. Les boutons trop petits ont reçu du padding. Les icônes trop serrées ont gagné de l'espace. Le lobby, la barre de notation, les réactions en jeu — tout a été repris.

Le contraste des couleurs est aussi passé sous revue. Quelques ratios limites ont été ajustés au-dessus du seuil WCAG AA (4,5:1 pour le texte courant). L'app devrait être un peu plus reposante pour les yeux — surtout en plein soleil.

## Traductions, vraiment finies

Quelques messages d'erreur étaient encore codés en anglais en dur ("Not enough players to start" et compagnie). Ils sont tous maintenant localisés en **anglais, français et allemand** — y compris pour les modes couple, mariage et soirée.

Si ton app est en français ou en allemand, tu ne devrais plus voir d'anglais surgir.

## Compatibilité ascendante, en silence

Un détail subtil mais essentiel : on s'est assuré que tout ce qu'on livre cohabite proprement avec les anciennes versions encore installées. Si un copain n'a pas mis à jour et rejoint ta partie, ça tourne sans erreur. Règles, formats de données, flux de messages — tout est pensé pour être compatible.

Tu ne le verras pas — mais c'est précisément le but : que *rien* ne casse, pour personne, jamais.

## Plus petit, plus fin

- Le splash ne navigue plus accidentellement deux fois après connexion
- Le leaderboard gère correctement jusqu'à 499 joueurs en un seul lot
- Les votes sont maintenant atomiques — finis les rares cas de double comptage quand deux téléphones votent au même instant
- Quelques fuites mémoire dans les animations sont parties

## La suite

Cette mise à jour est une fondation — on solidifie la confiance et les finitions avant la prochaine vague de nouveautés. Reste à l'affût.

En attendant : mets à jour ton app sur l'[App Store](https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093) ou [Google Play](https://play.google.com/store/apps/details?id=com.qelp.ch), réunis tes amis, et joue l'esprit tranquille.
