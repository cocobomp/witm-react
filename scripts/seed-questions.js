/**
 * Seed script — bulk-inserts 190 questions into Firestore QUESTIONS collection.
 *
 * Usage:
 *   node scripts/seed-questions.js              # insert all questions
 *   node scripts/seed-questions.js --dry-run     # preview only, no writes
 *
 * Reads Firebase config from .env (VITE_FIREBASE_* vars).
 * Fetches CATEGORIES to resolve category IDs automatically.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(projectRoot, '.env');
  if (!existsSync(envPath)) {
    console.error('.env not found');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [key, ...v] = t.split('=');
    env[key.trim()] = v.join('=').trim();
  }
  return env;
}

const env = loadEnv();

// ─── Firebase init ────────────────────────────────────────────────────────────
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const db = getFirestore(app);

// ─── Questions data ───────────────────────────────────────────────────────────
// Format: { fr, en, de } — "Qui est le plus…" / "Who is most likely to…" / "Wer würde am ehesten…"

const QUESTIONS = {
  wtf: [
    { fr: "Qui est le plus susceptible de parler tout seul dans la rue ?", en: "Who is most likely to talk to themselves in the street?", de: "Wer würde am ehesten auf der Straße Selbstgespräche führen?" },
    { fr: "Qui est le plus susceptible de manger un truc tombé par terre ?", en: "Who is most likely to eat something that fell on the floor?", de: "Wer würde am ehesten etwas essen, das auf den Boden gefallen ist?" },
    { fr: "Qui est le plus susceptible de devenir viral sur TikTok par accident ?", en: "Who is most likely to accidentally go viral on TikTok?", de: "Wer würde am ehesten aus Versehen auf TikTok viral gehen?" },
    { fr: "Qui est le plus susceptible de se retrouver dans un pays étranger sans passeport ?", en: "Who is most likely to end up in a foreign country without a passport?", de: "Wer würde am ehesten ohne Reisepass in einem fremden Land landen?" },
    { fr: "Qui est le plus susceptible de croire aux aliens ?", en: "Who is most likely to believe in aliens?", de: "Wer würde am ehesten an Aliens glauben?" },
    { fr: "Qui est le plus susceptible de dormir en cours ou en réunion ?", en: "Who is most likely to fall asleep in class or a meeting?", de: "Wer würde am ehesten im Unterricht oder in einer Besprechung einschlafen?" },
    { fr: "Qui est le plus susceptible de participer à une télé-réalité ?", en: "Who is most likely to participate in a reality TV show?", de: "Wer würde am ehesten an einer Reality-Show teilnehmen?" },
    { fr: "Qui est le plus susceptible d'avoir un talent caché bizarre ?", en: "Who is most likely to have a weird hidden talent?", de: "Wer hat am ehesten ein seltsames verstecktes Talent?" },
    { fr: "Qui est le plus susceptible de survivre à une apocalypse zombie ?", en: "Who is most likely to survive a zombie apocalypse?", de: "Wer würde am ehesten eine Zombie-Apokalypse überleben?" },
    { fr: "Qui est le plus susceptible de parler à son téléphone comme si c'était une personne ?", en: "Who is most likely to talk to their phone as if it were a person?", de: "Wer würde am ehesten mit dem Handy reden, als wäre es ein Mensch?" },
    { fr: "Qui est le plus susceptible de se perdre dans un centre commercial ?", en: "Who is most likely to get lost in a shopping mall?", de: "Wer würde am ehesten sich in einem Einkaufszentrum verlaufen?" },
    { fr: "Qui est le plus susceptible de porter deux chaussures différentes sans s'en rendre compte ?", en: "Who is most likely to wear two different shoes without noticing?", de: "Wer würde am ehesten zwei verschiedene Schuhe tragen, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible de créer un mème sans le vouloir ?", en: "Who is most likely to accidentally create a meme?", de: "Wer würde am ehesten versehentlich ein Meme erschaffen?" },
    { fr: "Qui est le plus susceptible de se réveiller dans un endroit inconnu après une soirée ?", en: "Who is most likely to wake up in an unknown place after a party?", de: "Wer würde am ehesten nach einer Party an einem unbekannten Ort aufwachen?" },
    { fr: "Qui est le plus susceptible de chanter sous la douche à tue-tête ?", en: "Who is most likely to sing loudly in the shower?", de: "Wer würde am ehesten laut unter der Dusche singen?" },
    { fr: "Qui est le plus susceptible de finir dans un documentaire Netflix ?", en: "Who is most likely to end up in a Netflix documentary?", de: "Wer würde am ehesten in einer Netflix-Dokumentation landen?" },
    { fr: "Qui est le plus susceptible de croire une fake news ?", en: "Who is most likely to believe fake news?", de: "Wer würde am ehesten Fake News glauben?" },
    { fr: "Qui est le plus susceptible de faire un pari stupide et le perdre ?", en: "Who is most likely to make a stupid bet and lose?", de: "Wer würde am ehesten eine dumme Wette eingehen und verlieren?" },
    { fr: "Qui est le plus susceptible de devenir ami avec un inconnu dans le bus ?", en: "Who is most likely to become friends with a stranger on the bus?", de: "Wer würde am ehesten sich mit einem Fremden im Bus anfreunden?" },
    { fr: "Qui est le plus susceptible de se teindre les cheveux d'une couleur improbable ?", en: "Who is most likely to dye their hair an unlikely color?", de: "Wer würde am ehesten die Haare in einer ungewöhnlichen Farbe färben?" },
  ],

  friends: [
    { fr: "Qui est le plus susceptible d'oublier l'anniversaire d'un ami ?", en: "Who is most likely to forget a friend's birthday?", de: "Wer würde am ehesten den Geburtstag eines Freundes vergessen?" },
    { fr: "Qui est le plus susceptible de garder un secret pendant des années ?", en: "Who is most likely to keep a secret for years?", de: "Wer würde am ehesten ein Geheimnis jahrelang bewahren?" },
    { fr: "Qui est le plus susceptible de débarquer chez un ami sans prévenir ?", en: "Who is most likely to show up at a friend's place unannounced?", de: "Wer würde am ehesten unangemeldet bei einem Freund auftauchen?" },
    { fr: "Qui est le plus susceptible de pleurer devant un film avec ses amis ?", en: "Who is most likely to cry during a movie with friends?", de: "Wer würde am ehesten bei einem Film mit Freunden weinen?" },
    { fr: "Qui est le plus susceptible de devenir le meilleur ami d'une célébrité ?", en: "Who is most likely to become best friends with a celebrity?", de: "Wer würde am ehesten bester Freund einer Berühmtheit werden?" },
    { fr: "Qui est le plus susceptible de raconter un secret par accident ?", en: "Who is most likely to accidentally spill a secret?", de: "Wer würde am ehesten aus Versehen ein Geheimnis verraten?" },
    { fr: "Qui est le plus susceptible de toujours arriver en retard au rendez-vous ?", en: "Who is most likely to always be late to meetups?", de: "Wer würde am ehesten immer zu spät zu Verabredungen kommen?" },
    { fr: "Qui est le plus susceptible de proposer un plan de dernière minute ?", en: "Who is most likely to suggest last-minute plans?", de: "Wer würde am ehesten Last-Minute-Pläne vorschlagen?" },
    { fr: "Qui est le plus susceptible de prêter de l'argent et ne jamais le réclamer ?", en: "Who is most likely to lend money and never ask for it back?", de: "Wer würde am ehesten Geld verleihen und es nie zurückfordern?" },
    { fr: "Qui est le plus susceptible de tout annuler à la dernière minute ?", en: "Who is most likely to cancel everything at the last minute?", de: "Wer würde am ehesten alles in letzter Minute absagen?" },
    { fr: "Qui est le plus susceptible de commencer un groupe WhatsApp inutile ?", en: "Who is most likely to start a useless WhatsApp group?", de: "Wer würde am ehesten eine nutzlose WhatsApp-Gruppe erstellen?" },
    { fr: "Qui est le plus susceptible d'organiser la meilleure soirée de l'année ?", en: "Who is most likely to throw the best party of the year?", de: "Wer würde am ehesten die beste Party des Jahres veranstalten?" },
    { fr: "Qui est le plus susceptible de défendre ses amis contre n'importe qui ?", en: "Who is most likely to defend their friends against anyone?", de: "Wer würde am ehesten seine Freunde gegen jeden verteidigen?" },
    { fr: "Qui est le plus susceptible de stalker les réseaux sociaux de quelqu'un ?", en: "Who is most likely to stalk someone's social media?", de: "Wer würde am ehesten jemandes Social Media stalken?" },
    { fr: "Qui est le plus susceptible de se disputer pour choisir un restaurant ?", en: "Who is most likely to argue about choosing a restaurant?", de: "Wer würde am ehesten über die Restaurantwahl streiten?" },
    { fr: "Qui est le plus susceptible de devenir le confident du groupe ?", en: "Who is most likely to become the group's confidant?", de: "Wer würde am ehesten zum Vertrauten der Gruppe werden?" },
    { fr: "Qui est le plus susceptible de faire un road trip spontané ?", en: "Who is most likely to go on a spontaneous road trip?", de: "Wer würde am ehesten einen spontanen Roadtrip machen?" },
    { fr: "Qui est le plus susceptible de créer un drama entre amis ?", en: "Who is most likely to create drama among friends?", de: "Wer würde am ehesten Drama unter Freunden verursachen?" },
    { fr: "Qui est le plus susceptible de dormir chez un ami après une soirée ?", en: "Who is most likely to crash at a friend's place after a night out?", de: "Wer würde am ehesten nach einer Partynacht bei einem Freund schlafen?" },
    { fr: "Qui est le plus susceptible de toujours prendre les meilleures photos du groupe ?", en: "Who is most likely to always take the best group photos?", de: "Wer würde am ehesten immer die besten Gruppenfotos machen?" },
  ],

  family: [
    { fr: "Qui est le plus susceptible de devenir le préféré de la famille ?", en: "Who is most likely to become the family favorite?", de: "Wer würde am ehesten zum Liebling der Familie werden?" },
    { fr: "Qui est le plus susceptible de ruiner le dîner de Noël ?", en: "Who is most likely to ruin Christmas dinner?", de: "Wer würde am ehesten das Weihnachtsessen ruinieren?" },
    { fr: "Qui est le plus susceptible de devenir papa ou maman poule ?", en: "Who is most likely to become an overprotective parent?", de: "Wer würde am ehesten eine Helikopter-Mutter oder -Vater werden?" },
    { fr: "Qui est le plus susceptible d'oublier l'anniversaire de mariage de ses parents ?", en: "Who is most likely to forget their parents' wedding anniversary?", de: "Wer würde am ehesten den Hochzeitstag der Eltern vergessen?" },
    { fr: "Qui est le plus susceptible de mentir à ses parents pour éviter des problèmes ?", en: "Who is most likely to lie to their parents to avoid trouble?", de: "Wer würde am ehesten die Eltern anlügen, um Ärger zu vermeiden?" },
    { fr: "Qui est le plus susceptible de ramener un animal à la maison sans prévenir ?", en: "Who is most likely to bring a pet home without warning?", de: "Wer würde am ehesten ein Tier nach Hause bringen, ohne Bescheid zu geben?" },
    { fr: "Qui est le plus susceptible de finir comme son père ou sa mère ?", en: "Who is most likely to end up just like their dad or mom?", de: "Wer würde am ehesten genauso wie Vater oder Mutter werden?" },
    { fr: "Qui est le plus susceptible de toujours raconter les histoires embarrassantes des autres ?", en: "Who is most likely to always tell embarrassing stories about others?", de: "Wer würde am ehesten immer peinliche Geschichten über andere erzählen?" },
    { fr: "Qui est le plus susceptible de manger le dernier morceau de gâteau sans rien dire ?", en: "Who is most likely to eat the last piece of cake without saying anything?", de: "Wer würde am ehesten das letzte Stück Kuchen essen, ohne etwas zu sagen?" },
    { fr: "Qui est le plus susceptible de faire la vaisselle sans qu'on le demande ?", en: "Who is most likely to do the dishes without being asked?", de: "Wer würde am ehesten abwaschen, ohne dass man es verlangt?" },
    { fr: "Qui est le plus susceptible de crier le plus fort pendant un match ?", en: "Who is most likely to scream the loudest during a sports game?", de: "Wer würde am ehesten am lautesten bei einem Sportspiel schreien?" },
    { fr: "Qui est le plus susceptible de rester vivre chez ses parents jusqu'à 30 ans ?", en: "Who is most likely to live with their parents until 30?", de: "Wer würde am ehesten bis 30 bei den Eltern wohnen bleiben?" },
    { fr: "Qui est le plus susceptible de se disputer pour la télécommande ?", en: "Who is most likely to fight over the TV remote?", de: "Wer würde am ehesten um die Fernbedienung streiten?" },
    { fr: "Qui est le plus susceptible de transformer un repas de famille en chaos ?", en: "Who is most likely to turn a family dinner into chaos?", de: "Wer würde am ehesten ein Familienessen ins Chaos verwandeln?" },
    { fr: "Qui est le plus susceptible d'être le premier à s'endormir lors d'une soirée en famille ?", en: "Who is most likely to be the first to fall asleep during family movie night?", de: "Wer würde am ehesten als Erster beim Familienabend einschlafen?" },
    { fr: "Qui est le plus susceptible de devenir le cuisinier de la famille ?", en: "Who is most likely to become the family cook?", de: "Wer würde am ehesten zum Familienkoch werden?" },
    { fr: "Qui est le plus susceptible de cacher des bonbons dans sa chambre ?", en: "Who is most likely to hide candy in their room?", de: "Wer würde am ehesten Süßigkeiten im Zimmer verstecken?" },
    { fr: "Qui est le plus susceptible de toujours demander 'on mange quoi ce soir ?' ?", en: "Who is most likely to always ask 'what's for dinner tonight?'", de: "Wer würde am ehesten immer fragen 'Was gibt es heute Abend zu essen?'" },
    { fr: "Qui est le plus susceptible d'avoir le plus de photos de famille sur son téléphone ?", en: "Who is most likely to have the most family photos on their phone?", de: "Wer hätte am ehesten die meisten Familienfotos auf dem Handy?" },
    { fr: "Qui est le plus susceptible de monopoliser la salle de bain ?", en: "Who is most likely to hog the bathroom?", de: "Wer würde am ehesten das Bad blockieren?" },
  ],

  job: [
    { fr: "Qui est le plus susceptible de devenir millionnaire ?", en: "Who is most likely to become a millionaire?", de: "Wer würde am ehesten Millionär werden?" },
    { fr: "Qui est le plus susceptible de quitter son travail pour suivre sa passion ?", en: "Who is most likely to quit their job to follow their passion?", de: "Wer würde am ehesten den Job kündigen, um seiner Leidenschaft zu folgen?" },
    { fr: "Qui est le plus susceptible d'être promu le plus rapidement ?", en: "Who is most likely to get promoted the fastest?", de: "Wer würde am ehesten am schnellsten befördert werden?" },
    { fr: "Qui est le plus susceptible de créer sa propre entreprise ?", en: "Who is most likely to start their own business?", de: "Wer würde am ehesten ein eigenes Unternehmen gründen?" },
    { fr: "Qui est le plus susceptible de faire semblant de travailler ?", en: "Who is most likely to pretend to be working?", de: "Wer würde am ehesten so tun, als würde er arbeiten?" },
    { fr: "Qui est le plus susceptible de devenir le boss un jour ?", en: "Who is most likely to become the boss one day?", de: "Wer würde am ehesten eines Tages Chef werden?" },
    { fr: "Qui est le plus susceptible de dormir au bureau ?", en: "Who is most likely to fall asleep at the office?", de: "Wer würde am ehesten im Büro einschlafen?" },
    { fr: "Qui est le plus susceptible de manger la nourriture des autres dans le frigo du bureau ?", en: "Who is most likely to eat someone else's food from the office fridge?", de: "Wer würde am ehesten das Essen anderer aus dem Bürokühlschrank essen?" },
    { fr: "Qui est le plus susceptible de faire un discours inspirant ?", en: "Who is most likely to give an inspiring speech?", de: "Wer würde am ehesten eine inspirierende Rede halten?" },
    { fr: "Qui est le plus susceptible de changer de métier tous les deux ans ?", en: "Who is most likely to change careers every two years?", de: "Wer würde am ehesten alle zwei Jahre den Beruf wechseln?" },
    { fr: "Qui est le plus susceptible d'arriver au travail en pyjama ?", en: "Who is most likely to show up to work in pajamas?", de: "Wer würde am ehesten im Schlafanzug zur Arbeit kommen?" },
    { fr: "Qui est le plus susceptible de devenir influenceur ?", en: "Who is most likely to become an influencer?", de: "Wer würde am ehesten Influencer werden?" },
    { fr: "Qui est le plus susceptible de se faire virer pour une raison ridicule ?", en: "Who is most likely to get fired for a ridiculous reason?", de: "Wer würde am ehesten aus einem lächerlichen Grund gefeuert werden?" },
    { fr: "Qui est le plus susceptible de répondre 'nouveau téléphone, c'est qui ?' à son boss ?", en: "Who is most likely to reply 'new phone, who dis?' to their boss?", de: "Wer würde am ehesten dem Chef mit 'Neues Handy, wer ist da?' antworten?" },
    { fr: "Qui est le plus susceptible de devenir célèbre ?", en: "Who is most likely to become famous?", de: "Wer würde am ehesten berühmt werden?" },
    { fr: "Qui est le plus susceptible de passer toute la journée sur les réseaux sociaux au lieu de travailler ?", en: "Who is most likely to spend all day on social media instead of working?", de: "Wer würde am ehesten den ganzen Tag in sozialen Medien statt zu arbeiten verbringen?" },
    { fr: "Qui est le plus susceptible de négocier le meilleur salaire ?", en: "Who is most likely to negotiate the best salary?", de: "Wer würde am ehesten das beste Gehalt verhandeln?" },
    { fr: "Qui est le plus susceptible d'envoyer un email embarrassant au mauvais destinataire ?", en: "Who is most likely to send an embarrassing email to the wrong person?", de: "Wer würde am ehesten eine peinliche E-Mail an den falschen Empfänger senden?" },
    { fr: "Qui est le plus susceptible de travailler pendant les vacances ?", en: "Who is most likely to work during vacation?", de: "Wer würde am ehesten im Urlaub arbeiten?" },
    { fr: "Qui est le plus susceptible de devenir le collègue que tout le monde adore ?", en: "Who is most likely to become everyone's favorite colleague?", de: "Wer würde am ehesten der Lieblingskollege aller werden?" },
  ],

  hot: [
    { fr: "Qui est le plus susceptible de draguer quelqu'un avec une phrase d'accroche nulle ?", en: "Who is most likely to flirt using a terrible pickup line?", de: "Wer würde am ehesten mit einem schlechten Anmachspruch flirten?" },
    { fr: "Qui est le plus susceptible d'envoyer un message à son ex en pleine nuit ?", en: "Who is most likely to text their ex in the middle of the night?", de: "Wer würde am ehesten mitten in der Nacht dem Ex schreiben?" },
    { fr: "Qui est le plus susceptible de tomber amoureux au premier regard ?", en: "Who is most likely to fall in love at first sight?", de: "Wer würde am ehesten sich auf den ersten Blick verlieben?" },
    { fr: "Qui est le plus susceptible d'avoir un crush sur un collègue ?", en: "Who is most likely to have a crush on a coworker?", de: "Wer würde am ehesten in einen Kollegen verknallt sein?" },
    { fr: "Qui est le plus susceptible de swiper à droite sur tout le monde sur Tinder ?", en: "Who is most likely to swipe right on everyone on Tinder?", de: "Wer würde am ehesten auf Tinder bei jedem nach rechts wischen?" },
    { fr: "Qui est le plus susceptible de se faire surprendre en train de stalker le profil de son crush ?", en: "Who is most likely to get caught stalking their crush's profile?", de: "Wer würde am ehesten dabei erwischt werden, das Profil des Schwarms zu stalken?" },
    { fr: "Qui est le plus susceptible de rougir en parlant à quelqu'un qui lui plaît ?", en: "Who is most likely to blush while talking to someone they like?", de: "Wer würde am ehesten erröten, wenn er mit jemandem spricht, der ihm gefällt?" },
    { fr: "Qui est le plus susceptible de se retrouver dans un triangle amoureux ?", en: "Who is most likely to end up in a love triangle?", de: "Wer würde am ehesten in einem Liebesdreieck landen?" },
    { fr: "Qui est le plus susceptible de faire une scène de jalousie ?", en: "Who is most likely to make a jealousy scene?", de: "Wer würde am ehesten eine Eifersuchtsszene machen?" },
    { fr: "Qui est le plus susceptible de tomber amoureux de quelqu'un qu'il ne peut pas avoir ?", en: "Who is most likely to fall for someone they can't have?", de: "Wer würde am ehesten sich in jemanden verlieben, den er nicht haben kann?" },
    { fr: "Qui est le plus susceptible d'oublier un anniversaire de couple ?", en: "Who is most likely to forget a relationship anniversary?", de: "Wer würde am ehesten einen Beziehungsjahrestag vergessen?" },
    { fr: "Qui est le plus susceptible de faire une demande en mariage complètement folle ?", en: "Who is most likely to propose in a completely crazy way?", de: "Wer würde am ehesten auf eine völlig verrückte Art einen Heiratsantrag machen?" },
    { fr: "Qui est le plus susceptible de mettre 3 jours à répondre à un message ?", en: "Who is most likely to take 3 days to reply to a text?", de: "Wer würde am ehesten 3 Tage brauchen, um auf eine Nachricht zu antworten?" },
    { fr: "Qui est le plus susceptible de se marier en premier ?", en: "Who is most likely to get married first?", de: "Wer würde am ehesten als Erster heiraten?" },
    { fr: "Qui est le plus susceptible d'écrire des lettres d'amour ?", en: "Who is most likely to write love letters?", de: "Wer würde am ehesten Liebesbriefe schreiben?" },
    { fr: "Qui est le plus susceptible de regarder des comédies romantiques en cachette ?", en: "Who is most likely to secretly watch romantic comedies?", de: "Wer würde am ehesten heimlich romantische Komödien schauen?" },
    { fr: "Qui est le plus susceptible de danser lentement sous la pluie avec quelqu'un ?", en: "Who is most likely to slow dance in the rain with someone?", de: "Wer würde am ehesten im Regen langsam mit jemandem tanzen?" },
    { fr: "Qui est le plus susceptible de quitter quelqu'un par texto ?", en: "Who is most likely to break up with someone via text?", de: "Wer würde am ehesten per SMS Schluss machen?" },
    { fr: "Qui est le plus susceptible d'avoir un rencard catastrophique ?", en: "Who is most likely to have a disastrous date?", de: "Wer hätte am ehesten ein katastrophales Date?" },
    { fr: "Qui est le plus susceptible de tomber amoureux pendant les vacances ?", en: "Who is most likely to fall in love on vacation?", de: "Wer würde am ehesten sich im Urlaub verlieben?" },
  ],

  normal: [
    { fr: "Qui est le plus susceptible de se coucher après minuit tous les soirs ?", en: "Who is most likely to go to bed after midnight every night?", de: "Wer würde am ehesten jeden Abend nach Mitternacht ins Bett gehen?" },
    { fr: "Qui est le plus susceptible de manger des céréales à toute heure ?", en: "Who is most likely to eat cereal at any time of day?", de: "Wer würde am ehesten zu jeder Tageszeit Müsli essen?" },
    { fr: "Qui est le plus susceptible de connaître toutes les paroles d'une chanson ?", en: "Who is most likely to know all the lyrics to a song?", de: "Wer würde am ehesten alle Texte eines Liedes kennen?" },
    { fr: "Qui est le plus susceptible de pleurer pour rien ?", en: "Who is most likely to cry for no reason?", de: "Wer würde am ehesten grundlos weinen?" },
    { fr: "Qui est le plus susceptible de binge-watcher une série entière en un week-end ?", en: "Who is most likely to binge-watch an entire series in one weekend?", de: "Wer würde am ehesten eine ganze Serie an einem Wochenende durchschauen?" },
    { fr: "Qui est le plus susceptible de parler avec les mains ?", en: "Who is most likely to talk with their hands?", de: "Wer würde am ehesten mit den Händen reden?" },
    { fr: "Qui est le plus susceptible d'acheter quelque chose d'inutile en soldes ?", en: "Who is most likely to buy something useless on sale?", de: "Wer würde am ehesten etwas Nutzloses im Schlussverkauf kaufen?" },
    { fr: "Qui est le plus susceptible de se souvenir de détails que personne ne retient ?", en: "Who is most likely to remember details no one else remembers?", de: "Wer würde am ehesten sich an Details erinnern, die sonst niemand behält?" },
    { fr: "Qui est le plus susceptible de rater son réveil ?", en: "Who is most likely to sleep through their alarm?", de: "Wer würde am ehesten den Wecker verschlafen?" },
    { fr: "Qui est le plus susceptible de dire 'oui' à tout ?", en: "Who is most likely to say 'yes' to everything?", de: "Wer würde am ehesten zu allem 'ja' sagen?" },
    { fr: "Qui est le plus susceptible de tomber dans les escaliers ?", en: "Who is most likely to fall down the stairs?", de: "Wer würde am ehesten die Treppe hinunterfallen?" },
    { fr: "Qui est le plus susceptible de perdre ses clés ?", en: "Who is most likely to lose their keys?", de: "Wer würde am ehesten die Schlüssel verlieren?" },
    { fr: "Qui est le plus susceptible de commander le même plat au restaurant à chaque fois ?", en: "Who is most likely to order the same dish at the restaurant every time?", de: "Wer würde am ehesten immer das gleiche Gericht im Restaurant bestellen?" },
    { fr: "Qui est le plus susceptible de rire au pire moment ?", en: "Who is most likely to laugh at the worst moment?", de: "Wer würde am ehesten im schlimmsten Moment lachen?" },
    { fr: "Qui est le plus susceptible de prendre le plus de temps à se préparer ?", en: "Who is most likely to take the longest to get ready?", de: "Wer würde am ehesten am längsten brauchen, um sich fertig zu machen?" },
    { fr: "Qui est le plus susceptible de faire un selfie partout où il va ?", en: "Who is most likely to take a selfie everywhere they go?", de: "Wer würde am ehesten überall ein Selfie machen?" },
    { fr: "Qui est le plus susceptible de parler à des inconnus dans la queue ?", en: "Who is most likely to chat with strangers in a queue?", de: "Wer würde am ehesten mit Fremden in der Schlange reden?" },
    { fr: "Qui est le plus susceptible de manger directement dans la casserole ?", en: "Who is most likely to eat straight from the pot?", de: "Wer würde am ehesten direkt aus dem Topf essen?" },
    { fr: "Qui est le plus susceptible de se souvenir de tous les anniversaires ?", en: "Who is most likely to remember everyone's birthday?", de: "Wer würde am ehesten sich an alle Geburtstage erinnern?" },
    { fr: "Qui est le plus susceptible de danser dès qu'il entend de la musique ?", en: "Who is most likely to start dancing whenever they hear music?", de: "Wer würde am ehesten anfangen zu tanzen, sobald Musik läuft?" },
  ],

  problemes: [
    // ── Base 20 ──
    { fr: "Qui est le plus susceptible de trahir le groupe pour de l'argent ?", en: "Who is most likely to betray the group for money?", de: "Wer würde am ehesten die Gruppe für Geld verraten?" },
    { fr: "Qui est le plus susceptible de mentir en regardant dans les yeux ?", en: "Who is most likely to lie while looking you in the eyes?", de: "Wer würde am ehesten lügen, während er einem in die Augen schaut?" },
    { fr: "Qui est le plus susceptible d'avoir un double compte Instagram secret ?", en: "Who is most likely to have a secret second Instagram account?", de: "Wer hätte am ehesten ein geheimes zweites Instagram-Konto?" },
    { fr: "Qui est le plus susceptible de fouiller dans le téléphone de quelqu'un ?", en: "Who is most likely to snoop through someone's phone?", de: "Wer würde am ehesten in jemandes Handy schnüffeln?" },
    { fr: "Qui est le plus susceptible de parler dans le dos des autres ?", en: "Who is most likely to talk behind others' backs?", de: "Wer würde am ehesten hinter dem Rücken anderer reden?" },
    { fr: "Qui est le plus susceptible de mentir sur son CV ?", en: "Who is most likely to lie on their resume?", de: "Wer würde am ehesten im Lebenslauf lügen?" },
    { fr: "Qui est le plus susceptible de piquer le ou la partenaire d'un ami ?", en: "Who is most likely to steal a friend's partner?", de: "Wer würde am ehesten einem Freund den Partner ausspannen?" },
    { fr: "Qui est le plus susceptible de ne jamais payer sa part au restaurant ?", en: "Who is most likely to never pay their share at the restaurant?", de: "Wer würde am ehesten nie seinen Anteil im Restaurant bezahlen?" },
    { fr: "Qui est le plus susceptible de lire les messages privés de quelqu'un d'autre ?", en: "Who is most likely to read someone else's private messages?", de: "Wer würde am ehesten die privaten Nachrichten eines anderen lesen?" },
    { fr: "Qui est le plus susceptible de disparaître sans donner de nouvelles ?", en: "Who is most likely to disappear without giving any news?", de: "Wer würde am ehesten verschwinden, ohne sich zu melden?" },
    { fr: "Qui est le plus susceptible de balancer tout le monde pour sauver sa peau ?", en: "Who is most likely to snitch on everyone to save themselves?", de: "Wer würde am ehesten alle verpetzen, um die eigene Haut zu retten?" },
    { fr: "Qui est le plus susceptible de critiquer quelqu'un et faire la même chose après ?", en: "Who is most likely to criticize someone then do the exact same thing?", de: "Wer würde am ehesten jemanden kritisieren und dann das Gleiche tun?" },
    { fr: "Qui est le plus susceptible de prétendre être malade pour ne pas venir ?", en: "Who is most likely to fake being sick to avoid showing up?", de: "Wer würde am ehesten sich krank stellen, um nicht kommen zu müssen?" },
    { fr: "Qui est le plus susceptible d'inventer des histoires pour se rendre intéressant ?", en: "Who is most likely to make up stories to seem interesting?", de: "Wer würde am ehesten Geschichten erfinden, um interessant zu wirken?" },
    { fr: "Qui est le plus susceptible de se venger si on lui fait un mauvais coup ?", en: "Who is most likely to seek revenge if wronged?", de: "Wer würde am ehesten sich rächen, wenn man ihm etwas antut?" },
    { fr: "Qui est le plus susceptible de garder rancune pendant des années ?", en: "Who is most likely to hold a grudge for years?", de: "Wer würde am ehesten jahrelang nachtragend sein?" },
    { fr: "Qui est le plus susceptible de faire du chantage émotionnel ?", en: "Who is most likely to emotionally manipulate someone?", de: "Wer würde am ehesten emotionale Erpressung betreiben?" },
    { fr: "Qui est le plus susceptible de tricher à un jeu et ne jamais l'avouer ?", en: "Who is most likely to cheat at a game and never admit it?", de: "Wer würde am ehesten bei einem Spiel schummeln und es nie zugeben?" },
    { fr: "Qui est le plus susceptible de jeter quelqu'un comme une vieille chaussette ?", en: "Who is most likely to dump someone like an old sock?", de: "Wer würde am ehesten jemanden fallen lassen wie eine heiße Kartoffel?" },
    { fr: "Qui est le plus susceptible de prendre le crédit pour le travail de quelqu'un d'autre ?", en: "Who is most likely to take credit for someone else's work?", de: "Wer würde am ehesten sich die Arbeit eines anderen zuschreiben?" },

    // ── 50 extra subversive ──
    { fr: "Qui est le plus susceptible de draguer en couple ?", en: "Who is most likely to flirt while in a relationship?", de: "Wer würde am ehesten fremdflirten?" },
    { fr: "Qui est le plus susceptible de mentir sur sa localisation ?", en: "Who is most likely to lie about their location?", de: "Wer würde am ehesten über seinen Standort lügen?" },
    { fr: "Qui est le plus susceptible de ghoster quelqu'un sans raison ?", en: "Who is most likely to ghost someone for no reason?", de: "Wer würde am ehesten jemanden grundlos ghosten?" },
    { fr: "Qui est le plus susceptible d'avoir un plan B en permanence ?", en: "Who is most likely to always have a backup plan for relationships?", de: "Wer würde am ehesten immer einen Plan B in Beziehungen haben?" },
    { fr: "Qui est le plus susceptible de mentir sur son âge ?", en: "Who is most likely to lie about their age?", de: "Wer würde am ehesten über sein Alter lügen?" },
    { fr: "Qui est le plus susceptible de dire 'je t'aime' sans le penser ?", en: "Who is most likely to say 'I love you' without meaning it?", de: "Wer würde am ehesten 'Ich liebe dich' sagen, ohne es zu meinen?" },
    { fr: "Qui est le plus susceptible de vendre ses amis pour une promo au travail ?", en: "Who is most likely to sell out their friends for a work promotion?", de: "Wer würde am ehesten Freunde für eine Beförderung verraten?" },
    { fr: "Qui est le plus susceptible de supprimer des messages compromettants ?", en: "Who is most likely to delete incriminating messages?", de: "Wer würde am ehesten belastende Nachrichten löschen?" },
    { fr: "Qui est le plus susceptible de faire semblant d'écouter ?", en: "Who is most likely to pretend to listen?", de: "Wer würde am ehesten so tun, als würde er zuhören?" },
    { fr: "Qui est le plus susceptible de piquer la nourriture dans l'assiette des autres ?", en: "Who is most likely to steal food from others' plates?", de: "Wer würde am ehesten Essen vom Teller anderer klauen?" },
    { fr: "Qui est le plus susceptible de promettre un truc et ne jamais le faire ?", en: "Who is most likely to promise something and never do it?", de: "Wer würde am ehesten etwas versprechen und es nie tun?" },
    { fr: "Qui est le plus susceptible de dire du mal de quelqu'un et sourire devant lui ?", en: "Who is most likely to badmouth someone then smile in their face?", de: "Wer würde am ehesten über jemanden lästern und ihm dann ins Gesicht lächeln?" },
    { fr: "Qui est le plus susceptible d'être le premier à quitter le navire en cas de problème ?", en: "Who is most likely to be the first to bail when things go wrong?", de: "Wer würde am ehesten als Erster abhauen, wenn es Probleme gibt?" },
    { fr: "Qui est le plus susceptible de se faire prendre en flagrant délit de mensonge ?", en: "Who is most likely to get caught in a lie?", de: "Wer würde am ehesten beim Lügen erwischt werden?" },
    { fr: "Qui est le plus susceptible de juger les gens sur leur apparence ?", en: "Who is most likely to judge people by their appearance?", de: "Wer würde am ehesten Menschen nach ihrem Aussehen beurteilen?" },
    { fr: "Qui est le plus susceptible de ne jamais s'excuser même quand il a tort ?", en: "Who is most likely to never apologize even when wrong?", de: "Wer würde am ehesten sich nie entschuldigen, auch wenn er Unrecht hat?" },
    { fr: "Qui est le plus susceptible de faire croire qu'il est occupé alors qu'il ne fait rien ?", en: "Who is most likely to pretend to be busy when doing nothing?", de: "Wer würde am ehesten so tun, als wäre er beschäftigt, obwohl er nichts tut?" },
    { fr: "Qui est le plus susceptible de copier le style de quelqu'un sans l'admettre ?", en: "Who is most likely to copy someone's style without admitting it?", de: "Wer würde am ehesten jemandes Stil kopieren, ohne es zuzugeben?" },
    { fr: "Qui est le plus susceptible de ramener tous les potins ?", en: "Who is most likely to bring all the gossip?", de: "Wer würde am ehesten allen Klatsch mitbringen?" },
    { fr: "Qui est le plus susceptible de faire une crise pour quelque chose de futile ?", en: "Who is most likely to throw a tantrum over something trivial?", de: "Wer würde am ehesten wegen einer Kleinigkeit ausrasten?" },
    { fr: "Qui est le plus susceptible de faire un scandale en public ?", en: "Who is most likely to cause a scene in public?", de: "Wer würde am ehesten in der Öffentlichkeit eine Szene machen?" },
    { fr: "Qui est le plus susceptible de manipuler les gens pour obtenir ce qu'il veut ?", en: "Who is most likely to manipulate people to get what they want?", de: "Wer würde am ehesten Menschen manipulieren, um zu bekommen, was er will?" },
    { fr: "Qui est le plus susceptible de mentir pour avoir la paix ?", en: "Who is most likely to lie just to be left alone?", de: "Wer würde am ehesten lügen, um seine Ruhe zu haben?" },
    { fr: "Qui est le plus susceptible de tricher aux examens ?", en: "Who is most likely to cheat on exams?", de: "Wer würde am ehesten bei Prüfungen schummeln?" },
    { fr: "Qui est le plus susceptible de rouler tout le monde au Monopoly ?", en: "Who is most likely to scam everyone at Monopoly?", de: "Wer würde am ehesten bei Monopoly alle über den Tisch ziehen?" },
    { fr: "Qui est le plus susceptible de profiter de la gentillesse des autres ?", en: "Who is most likely to take advantage of other people's kindness?", de: "Wer würde am ehesten die Freundlichkeit anderer ausnutzen?" },
    { fr: "Qui est le plus susceptible de prétendre ne pas avoir vu un message ?", en: "Who is most likely to pretend they didn't see a message?", de: "Wer würde am ehesten so tun, als hätte er eine Nachricht nicht gesehen?" },
    { fr: "Qui est le plus susceptible de se la raconter devant des inconnus ?", en: "Who is most likely to show off in front of strangers?", de: "Wer würde am ehesten vor Fremden angeben?" },
    { fr: "Qui est le plus susceptible de faire payer les autres pour lui ?", en: "Who is most likely to make others pay for them?", de: "Wer würde am ehesten andere für sich bezahlen lassen?" },
    { fr: "Qui est le plus susceptible de couper la parole en permanence ?", en: "Who is most likely to constantly interrupt others?", de: "Wer würde am ehesten ständig anderen ins Wort fallen?" },
    { fr: "Qui est le plus susceptible d'être le pire conducteur ?", en: "Who is most likely to be the worst driver?", de: "Wer wäre am ehesten der schlechteste Autofahrer?" },
    { fr: "Qui est le plus susceptible de se plaindre pour absolument tout ?", en: "Who is most likely to complain about absolutely everything?", de: "Wer würde am ehesten über absolut alles meckern?" },
    { fr: "Qui est le plus susceptible de faire un caprice au restaurant ?", en: "Who is most likely to throw a fit at a restaurant?", de: "Wer würde am ehesten im Restaurant eine Szene machen?" },
    { fr: "Qui est le plus susceptible de ne jamais rembourser une dette ?", en: "Who is most likely to never pay back a debt?", de: "Wer würde am ehesten eine Schuld nie zurückzahlen?" },
    { fr: "Qui est le plus susceptible de se moquer de quelqu'un devant tout le monde ?", en: "Who is most likely to mock someone in front of everyone?", de: "Wer würde am ehesten sich vor allen über jemanden lustig machen?" },
    { fr: "Qui est le plus susceptible d'être un cauchemar en colocation ?", en: "Who is most likely to be a nightmare roommate?", de: "Wer wäre am ehesten ein Alptraum als Mitbewohner?" },
    { fr: "Qui est le plus susceptible d'exagérer une histoire pour impressionner ?", en: "Who is most likely to exaggerate a story to impress?", de: "Wer würde am ehesten eine Geschichte übertreiben, um zu beeindrucken?" },
    { fr: "Qui est le plus susceptible de se retourner contre toi dans un débat ?", en: "Who is most likely to turn against you in an argument?", de: "Wer würde am ehesten sich in einem Streit gegen dich wenden?" },
    { fr: "Qui est le plus susceptible de prendre la plus grosse part du gâteau ?", en: "Who is most likely to take the biggest slice of cake?", de: "Wer würde am ehesten das größte Stück Kuchen nehmen?" },
    { fr: "Qui est le plus susceptible de ne jamais admettre qu'il a tort ?", en: "Who is most likely to never admit they're wrong?", de: "Wer würde am ehesten nie zugeben, dass er falsch liegt?" },
    { fr: "Qui est le plus susceptible de révéler un secret sous pression ?", en: "Who is most likely to reveal a secret under pressure?", de: "Wer würde am ehesten unter Druck ein Geheimnis preisgeben?" },
    { fr: "Qui est le plus susceptible de faire semblant d'être content pour quelqu'un ?", en: "Who is most likely to fake being happy for someone?", de: "Wer würde am ehesten vortäuschen, sich für jemanden zu freuen?" },
    { fr: "Qui est le plus susceptible de poster un truc embarrassant sur les réseaux sociaux ?", en: "Who is most likely to post something embarrassing on social media?", de: "Wer würde am ehesten etwas Peinliches in sozialen Medien posten?" },
    { fr: "Qui est le plus susceptible de faire la morale aux autres sans l'appliquer ?", en: "Who is most likely to preach to others without practicing it?", de: "Wer würde am ehesten anderen predigen, ohne sich selbst daran zu halten?" },
    { fr: "Qui est le plus susceptible d'avoir un ego surdimensionné ?", en: "Who is most likely to have an oversized ego?", de: "Wer hätte am ehesten ein übergroßes Ego?" },
    { fr: "Qui est le plus susceptible de parler de soi en permanence ?", en: "Who is most likely to always talk about themselves?", de: "Wer würde am ehesten ständig über sich selbst reden?" },
    { fr: "Qui est le plus susceptible de piquer un truc dans un magasin ?", en: "Who is most likely to shoplift something?", de: "Wer würde am ehesten etwas in einem Laden klauen?" },
    { fr: "Qui est le plus susceptible de laisser ses amis tomber pour un rendez-vous amoureux ?", en: "Who is most likely to ditch their friends for a date?", de: "Wer würde am ehesten Freunde für ein Date sitzen lassen?" },
    { fr: "Qui est le plus susceptible de voter pour le pire candidat ?", en: "Who is most likely to vote for the worst candidate?", de: "Wer würde am ehesten den schlechtesten Kandidaten wählen?" },
    { fr: "Qui est le plus susceptible de finir en prison pour une bêtise ?", en: "Who is most likely to end up in jail for something stupid?", de: "Wer würde am ehesten wegen einer Dummheit im Gefängnis landen?" },
  ],
};

// ─── Resolve categories ──────────────────────────────────────────────────────
async function fetchCategories() {
  const snap = await getDocs(collection(db, 'CATEGORIES'));
  const cats = [];
  snap.forEach((d) => cats.push({ id: d.id, ...d.data() }));
  return cats;
}

function matchCategory(cats, key) {
  // Try matching by document ID, title, name, or key field (case-insensitive)
  // Also try startsWith for titles like "WTF !?" matching key "wtf"
  const lower = key.toLowerCase();
  return cats.find(
    (c) =>
      c.id.toLowerCase() === lower ||
      (c.title && c.title.toLowerCase() === lower) ||
      (c.title && c.title.toLowerCase().startsWith(lower)) ||
      (c.name && c.name.toLowerCase() === lower) ||
      (c.key && c.key.toLowerCase() === lower)
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching categories from Firestore...');
  const cats = await fetchCategories();
  console.log(`Found ${cats.length} categories:`, cats.map((c) => `${c.id} (${c.title || c.name || '?'})`).join(', '));

  // Build catId map
  const catIdMap = {};
  const missing = [];
  for (const key of Object.keys(QUESTIONS)) {
    const match = matchCategory(cats, key);
    if (match) {
      catIdMap[key] = match.id;
      console.log(`  ${key} → ${match.id}`);
    } else {
      missing.push(key);
      console.warn(`  ${key} → NOT FOUND`);
    }
  }

  if (missing.length > 0) {
    console.error(`\nCould not resolve categories: ${missing.join(', ')}`);
    console.error('Available categories:', cats.map((c) => JSON.stringify({ id: c.id, title: c.title, name: c.name })).join('\n  '));
    process.exit(1);
  }

  // Flatten all questions with catId
  const allQuestions = [];
  for (const [key, questions] of Object.entries(QUESTIONS)) {
    for (const q of questions) {
      allQuestions.push({
        question: q.fr,
        translations: { en: q.en, fr: q.fr, de: q.de },
        catId: catIdMap[key],
        likes: 0,
        dislikes: 0,
      });
    }
  }

  console.log(`\nTotal questions to insert: ${allQuestions.length}`);
  console.log(`  wtf: ${QUESTIONS.wtf.length}`);
  console.log(`  friends: ${QUESTIONS.friends.length}`);
  console.log(`  family: ${QUESTIONS.family.length}`);
  console.log(`  job: ${QUESTIONS.job.length}`);
  console.log(`  hot: ${QUESTIONS.hot.length}`);
  console.log(`  normal: ${QUESTIONS.normal.length}`);
  console.log(`  problemes: ${QUESTIONS.problemes.length}`);

  if (dryRun) {
    console.log('\n--- DRY RUN — no writes performed ---');
    console.log('Sample question:', JSON.stringify(allQuestions[0], null, 2));
    process.exit(0);
  }

  // Write in batches of 400 (Firestore limit is 500 ops per batch)
  const BATCH_SIZE = 400;
  let written = 0;

  for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
    const chunk = allQuestions.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const q of chunk) {
      const newDocRef = doc(collection(db, 'QUESTIONS'));
      batch.set(newDocRef, {
        ...q,
        isDeleted: false,
        deletedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    console.log(`Writing batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} questions)...`);
    await batch.commit();
    written += chunk.length;
    console.log(`  Done. Total written: ${written}/${allQuestions.length}`);
  }

  console.log(`\nAll ${written} questions inserted successfully!`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
