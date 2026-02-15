/**
 * Seed script 2 — 50 additional questions per category (350 total).
 * All duplicates with batch 1 removed. More political/edgy/controversial questions.
 *
 * Usage:
 *   node scripts/seed-questions-2.js              # insert all
 *   node scripts/seed-questions-2.js --dry-run     # preview only
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

function loadEnv() {
  const envPath = resolve(projectRoot, '.env');
  if (!existsSync(envPath)) { console.error('.env not found'); process.exit(1); }
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
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const QUESTIONS = {
  wtf: [
    { fr: "Qui est le plus susceptible de manger de la pizza au petit-déjeuner ?", en: "Who is most likely to eat pizza for breakfast?", de: "Wer würde am ehesten Pizza zum Frühstück essen?" },
    { fr: "Qui est le plus susceptible d'adopter un animal exotique ?", en: "Who is most likely to adopt an exotic animal?", de: "Wer würde am ehesten ein exotisches Tier adoptieren?" },
    { fr: "Qui est le plus susceptible de se faire tatouer sur un coup de tête ?", en: "Who is most likely to get a tattoo on impulse?", de: "Wer würde am ehesten sich spontan tätowieren lassen?" },
    { fr: "Qui est le plus susceptible de croire qu'il a des pouvoirs surnaturels ?", en: "Who is most likely to believe they have supernatural powers?", de: "Wer würde am ehesten glauben, übernatürliche Kräfte zu haben?" },
    { fr: "Qui est le plus susceptible de manger un insecte pour un défi ?", en: "Who is most likely to eat a bug for a dare?", de: "Wer würde am ehesten ein Insekt als Mutprobe essen?" },
    { fr: "Qui est le plus susceptible de se déguiser sans raison un jour normal ?", en: "Who is most likely to wear a costume on a random day?", de: "Wer würde am ehesten sich an einem normalen Tag verkleiden?" },
    { fr: "Qui est le plus susceptible de parler à une plante ?", en: "Who is most likely to talk to a plant?", de: "Wer würde am ehesten mit einer Pflanze reden?" },
    { fr: "Qui est le plus susceptible de se raser la tête pour un pari ?", en: "Who is most likely to shave their head for a bet?", de: "Wer würde am ehesten sich für eine Wette den Kopf rasieren?" },
    { fr: "Qui est le plus susceptible de mélanger des aliments qui ne vont pas ensemble ?", en: "Who is most likely to mix foods that don't go together?", de: "Wer würde am ehesten Lebensmittel mischen, die nicht zusammenpassen?" },
    { fr: "Qui est le plus susceptible de se faire arrêter pour un malentendu ?", en: "Who is most likely to get arrested over a misunderstanding?", de: "Wer würde am ehesten wegen eines Missverständnisses verhaftet werden?" },
    { fr: "Qui est le plus susceptible de lancer une mode bizarre ?", en: "Who is most likely to start a weird fashion trend?", de: "Wer würde am ehesten einen seltsamen Modetrend starten?" },
    { fr: "Qui est le plus susceptible d'apprendre une langue juste pour le fun ?", en: "Who is most likely to learn a language just for fun?", de: "Wer würde am ehesten eine Sprache nur zum Spaß lernen?" },
    { fr: "Qui est le plus susceptible de se tromper de porte et entrer chez un inconnu ?", en: "Who is most likely to walk into a stranger's house by mistake?", de: "Wer würde am ehesten versehentlich in die Wohnung eines Fremden gehen?" },
    { fr: "Qui est le plus susceptible de collectionner un truc complètement bizarre ?", en: "Who is most likely to collect something completely bizarre?", de: "Wer würde am ehesten etwas völlig Bizarres sammeln?" },
    { fr: "Qui est le plus susceptible de danser dans un ascenseur ?", en: "Who is most likely to dance in an elevator?", de: "Wer würde am ehesten im Aufzug tanzen?" },
    { fr: "Qui est le plus susceptible de se perdre même avec un GPS ?", en: "Who is most likely to get lost even with GPS?", de: "Wer würde am ehesten sich sogar mit GPS verlaufen?" },
    { fr: "Qui est le plus susceptible de faire un voyage en auto-stop ?", en: "Who is most likely to go hitchhiking?", de: "Wer würde am ehesten per Anhalter reisen?" },
    { fr: "Qui est le plus susceptible de rêver éveillé en pleine conversation ?", en: "Who is most likely to daydream in the middle of a conversation?", de: "Wer würde am ehesten mitten im Gespräch tagträumen?" },
    { fr: "Qui est le plus susceptible de faire du somnambulisme ?", en: "Who is most likely to sleepwalk?", de: "Wer würde am ehesten schlafwandeln?" },
    { fr: "Qui est le plus susceptible d'envoyer un message au mauvais groupe ?", en: "Who is most likely to send a message to the wrong group chat?", de: "Wer würde am ehesten eine Nachricht in den falschen Gruppenchat senden?" },
    { fr: "Qui est le plus susceptible de se coincer dans un truc ?", en: "Who is most likely to get stuck in something?", de: "Wer würde am ehesten irgendwo stecken bleiben?" },
    { fr: "Qui est le plus susceptible de faire un régime et craquer le premier jour ?", en: "Who is most likely to start a diet and break it on day one?", de: "Wer würde am ehesten eine Diät anfangen und am ersten Tag aufgeben?" },
    { fr: "Qui est le plus susceptible de raconter la fin d'un film sans le vouloir ?", en: "Who is most likely to accidentally spoil a movie?", de: "Wer würde am ehesten versehentlich das Ende eines Films verraten?" },
    { fr: "Qui est le plus susceptible de se prendre une porte vitrée ?", en: "Who is most likely to walk into a glass door?", de: "Wer würde am ehesten gegen eine Glastür laufen?" },
    { fr: "Qui est le plus susceptible de liker un vieux post Instagram par accident ?", en: "Who is most likely to accidentally like an old Instagram post?", de: "Wer würde am ehesten versehentlich einen alten Instagram-Post liken?" },
    { fr: "Qui est le plus susceptible de confondre le sel et le sucre en cuisinant ?", en: "Who is most likely to mix up salt and sugar while cooking?", de: "Wer würde am ehesten beim Kochen Salz und Zucker verwechseln?" },
    { fr: "Qui est le plus susceptible de pleurer en regardant une pub ?", en: "Who is most likely to cry watching a commercial?", de: "Wer würde am ehesten bei einer Werbung weinen?" },
    { fr: "Qui est le plus susceptible de garder un secret pendant exactement 5 minutes ?", en: "Who is most likely to keep a secret for exactly 5 minutes?", de: "Wer würde am ehesten ein Geheimnis genau 5 Minuten bewahren?" },
    { fr: "Qui est le plus susceptible de faire une blague que personne ne comprend ?", en: "Who is most likely to make a joke that nobody gets?", de: "Wer würde am ehesten einen Witz machen, den niemand versteht?" },
    { fr: "Qui est le plus susceptible d'oublier pourquoi il est entré dans une pièce ?", en: "Who is most likely to forget why they walked into a room?", de: "Wer würde am ehesten vergessen, warum er einen Raum betreten hat?" },
    { fr: "Qui est le plus susceptible de trébucher sur ses propres pieds ?", en: "Who is most likely to trip over their own feet?", de: "Wer würde am ehesten über die eigenen Füße stolpern?" },
    { fr: "Qui est le plus susceptible de porter un vêtement à l'envers toute la journée ?", en: "Who is most likely to wear clothes inside out all day?", de: "Wer würde am ehesten den ganzen Tag Kleidung auf links tragen?" },
    { fr: "Qui est le plus susceptible de crier dans une maison hantée ?", en: "Who is most likely to scream in a haunted house?", de: "Wer würde am ehesten in einem Spukhaus schreien?" },
    { fr: "Qui est le plus susceptible de devenir obsédé par une chanson et l'écouter en boucle ?", en: "Who is most likely to get obsessed with a song and play it on repeat?", de: "Wer würde am ehesten von einem Lied besessen sein und es in Dauerschleife hören?" },
    { fr: "Qui est le plus susceptible de faire un monologue quand personne ne l'écoute ?", en: "Who is most likely to give a monologue when nobody's listening?", de: "Wer würde am ehesten einen Monolog halten, wenn niemand zuhört?" },
    { fr: "Qui est le plus susceptible de rire à son propre blague ?", en: "Who is most likely to laugh at their own joke?", de: "Wer würde am ehesten über den eigenen Witz lachen?" },
    { fr: "Qui est le plus susceptible de faire du karaoké sans connaître les paroles ?", en: "Who is most likely to do karaoke without knowing the lyrics?", de: "Wer würde am ehesten Karaoke singen, ohne den Text zu kennen?" },
    { fr: "Qui est le plus susceptible de poser une question stupide en public ?", en: "Who is most likely to ask a stupid question in public?", de: "Wer würde am ehesten in der Öffentlichkeit eine dumme Frage stellen?" },
    { fr: "Qui est le plus susceptible d'avoir peur d'un papillon ?", en: "Who is most likely to be scared of a butterfly?", de: "Wer würde am ehesten Angst vor einem Schmetterling haben?" },
    { fr: "Qui est le plus susceptible de manger un truc périmé sans vérifier la date ?", en: "Who is most likely to eat expired food without checking the date?", de: "Wer würde am ehesten abgelaufenes Essen essen, ohne das Datum zu prüfen?" },
    { fr: "Qui est le plus susceptible de faire un achat impulsif à 3h du matin ?", en: "Who is most likely to make an impulse purchase at 3 AM?", de: "Wer würde am ehesten um 3 Uhr morgens einen Impulskauf machen?" },
    { fr: "Qui est le plus susceptible de croire en l'horoscope ?", en: "Who is most likely to believe in horoscopes?", de: "Wer würde am ehesten an Horoskope glauben?" },
    { fr: "Qui est le plus susceptible de tomber amoureux d'un personnage de fiction ?", en: "Who is most likely to fall in love with a fictional character?", de: "Wer würde am ehesten sich in eine fiktive Figur verlieben?" },
    { fr: "Qui est le plus susceptible de faire une sieste de 4 heures par accident ?", en: "Who is most likely to accidentally nap for 4 hours?", de: "Wer würde am ehesten versehentlich 4 Stunden Mittagsschlaf machen?" },
    { fr: "Qui est le plus susceptible de confondre un inconnu avec quelqu'un qu'il connaît ?", en: "Who is most likely to mistake a stranger for someone they know?", de: "Wer würde am ehesten einen Fremden mit einem Bekannten verwechseln?" },
    // Replacements for removed weak questions — edgier
    { fr: "Qui est le plus susceptible de rejoindre une secte sans s'en rendre compte ?", en: "Who is most likely to join a cult without realizing it?", de: "Wer würde am ehesten einer Sekte beitreten, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible de devenir complotiste ?", en: "Who is most likely to become a conspiracy theorist?", de: "Wer würde am ehesten zum Verschwörungstheoretiker werden?" },
    { fr: "Qui est le plus susceptible de se faire arnaquer par un faux gourou ?", en: "Who is most likely to get scammed by a fake guru?", de: "Wer würde am ehesten auf einen falschen Guru hereinfallen?" },
    { fr: "Qui est le plus susceptible de disparaître de la civilisation pour vivre en ermite ?", en: "Who is most likely to disappear from civilization to live as a hermit?", de: "Wer würde am ehesten aus der Zivilisation verschwinden und als Einsiedler leben?" },
    { fr: "Qui est le plus susceptible de se filmer en train de faire un truc illégal et le poster en ligne ?", en: "Who is most likely to film themselves doing something illegal and post it online?", de: "Wer würde am ehesten sich beim Begehen von etwas Illegalem filmen und es online posten?" },
  ],

  friends: [
    { fr: "Qui est le plus susceptible de donner les meilleurs conseils ?", en: "Who is most likely to give the best advice?", de: "Wer würde am ehesten die besten Ratschläge geben?" },
    { fr: "Qui est le plus susceptible de faire une surprise inoubliable à un ami ?", en: "Who is most likely to throw an unforgettable surprise for a friend?", de: "Wer würde am ehesten einem Freund eine unvergessliche Überraschung bereiten?" },
    { fr: "Qui est le plus susceptible de convaincre le groupe de faire un truc fou ?", en: "Who is most likely to convince the group to do something crazy?", de: "Wer würde am ehesten die Gruppe überzeugen, etwas Verrücktes zu tun?" },
    { fr: "Qui est le plus susceptible de se souvenir de chaque détail d'une conversation ?", en: "Who is most likely to remember every detail of a conversation?", de: "Wer würde am ehesten sich an jedes Detail eines Gesprächs erinnern?" },
    { fr: "Qui est le plus susceptible de devenir le DJ officiel de toutes les soirées ?", en: "Who is most likely to become the official DJ of every party?", de: "Wer würde am ehesten der offizielle DJ jeder Party werden?" },
    { fr: "Qui est le plus susceptible de s'inviter quelque part sans être invité ?", en: "Who is most likely to show up somewhere uninvited?", de: "Wer würde am ehesten uneingeladen irgendwo auftauchen?" },
    { fr: "Qui est le plus susceptible d'envoyer un vocal de 10 minutes ?", en: "Who is most likely to send a 10-minute voice message?", de: "Wer würde am ehesten eine 10-minütige Sprachnachricht senden?" },
    { fr: "Qui est le plus susceptible de commencer une bagarre de nourriture ?", en: "Who is most likely to start a food fight?", de: "Wer würde am ehesten eine Essensschlacht anfangen?" },
    { fr: "Qui est le plus susceptible de pleurer quand un ami déménage ?", en: "Who is most likely to cry when a friend moves away?", de: "Wer würde am ehesten weinen, wenn ein Freund wegzieht?" },
    { fr: "Qui est le plus susceptible de créer un surnom ridicule pour tout le monde ?", en: "Who is most likely to create ridiculous nicknames for everyone?", de: "Wer würde am ehesten jedem einen lächerlichen Spitznamen geben?" },
    { fr: "Qui est le plus susceptible de toujours oublier de répondre aux messages ?", en: "Who is most likely to always forget to reply to messages?", de: "Wer würde am ehesten immer vergessen, auf Nachrichten zu antworten?" },
    { fr: "Qui est le plus susceptible de vouloir toujours avoir le dernier mot ?", en: "Who is most likely to always want the last word?", de: "Wer würde am ehesten immer das letzte Wort haben wollen?" },
    { fr: "Qui est le plus susceptible d'organiser un brunch le dimanche ?", en: "Who is most likely to organize a Sunday brunch?", de: "Wer würde am ehesten einen Sonntagsbrunch organisieren?" },
    { fr: "Qui est le plus susceptible de dire 'j'arrive dans 5 minutes' et arriver 30 minutes après ?", en: "Who is most likely to say 'I'll be there in 5 minutes' and arrive 30 minutes later?", de: "Wer würde am ehesten sagen 'Bin in 5 Minuten da' und 30 Minuten später kommen?" },
    { fr: "Qui est le plus susceptible de rappeler une dette de 2 euros ?", en: "Who is most likely to remind someone about a 2 euro debt?", de: "Wer würde am ehesten an eine 2-Euro-Schuld erinnern?" },
    { fr: "Qui est le plus susceptible de dormir le premier en soirée ?", en: "Who is most likely to fall asleep first at a party?", de: "Wer würde am ehesten als Erster auf einer Party einschlafen?" },
    { fr: "Qui est le plus susceptible de ne jamais rendre les trucs qu'il emprunte ?", en: "Who is most likely to never return borrowed things?", de: "Wer würde am ehesten geliehene Sachen nie zurückgeben?" },
    { fr: "Qui est le plus susceptible de raconter la même histoire 10 fois ?", en: "Who is most likely to tell the same story 10 times?", de: "Wer würde am ehesten die gleiche Geschichte 10 Mal erzählen?" },
    { fr: "Qui est le plus susceptible d'être le premier à danser sur la piste ?", en: "Who is most likely to be the first on the dance floor?", de: "Wer würde am ehesten als Erster auf die Tanzfläche gehen?" },
    { fr: "Qui est le plus susceptible de pleurer de rire ?", en: "Who is most likely to cry from laughing?", de: "Wer würde am ehesten vor Lachen weinen?" },
    { fr: "Qui est le plus susceptible d'être le plus bruyant dans un restaurant ?", en: "Who is most likely to be the loudest in a restaurant?", de: "Wer würde am ehesten der Lauteste im Restaurant sein?" },
    { fr: "Qui est le plus susceptible de préparer le meilleur cadeau ?", en: "Who is most likely to prepare the best gift?", de: "Wer würde am ehesten das beste Geschenk vorbereiten?" },
    { fr: "Qui est le plus susceptible de devenir ami avec n'importe qui en 5 minutes ?", en: "Who is most likely to become friends with anyone in 5 minutes?", de: "Wer würde am ehesten in 5 Minuten mit jedem befreundet sein?" },
    { fr: "Qui est le plus susceptible de vouloir toujours payer l'addition ?", en: "Who is most likely to always want to pay the bill?", de: "Wer würde am ehesten immer die Rechnung bezahlen wollen?" },
    { fr: "Qui est le plus susceptible de réagir de manière excessive à une bonne nouvelle ?", en: "Who is most likely to overreact to good news?", de: "Wer würde am ehesten bei guten Nachrichten übertrieben reagieren?" },
    { fr: "Qui est le plus susceptible de devenir nostalgique en regardant de vieilles photos ?", en: "Who is most likely to get nostalgic looking at old photos?", de: "Wer würde am ehesten nostalgisch werden beim Anschauen alter Fotos?" },
    { fr: "Qui est le plus susceptible de proposer un karaoké à chaque soirée ?", en: "Who is most likely to suggest karaoke at every party?", de: "Wer würde am ehesten bei jeder Party Karaoke vorschlagen?" },
    { fr: "Qui est le plus susceptible de se porter volontaire pour tout ?", en: "Who is most likely to volunteer for everything?", de: "Wer würde am ehesten sich für alles freiwillig melden?" },
    { fr: "Qui est le plus susceptible de connaître tout le monde dans un bar ?", en: "Who is most likely to know everyone in a bar?", de: "Wer würde am ehesten jeden in einer Bar kennen?" },
    { fr: "Qui est le plus susceptible de toujours trouver la bonne excuse ?", en: "Who is most likely to always find the right excuse?", de: "Wer würde am ehesten immer die richtige Ausrede finden?" },
    { fr: "Qui est le plus susceptible de faire un discours émouvant à un mariage ?", en: "Who is most likely to give a moving speech at a wedding?", de: "Wer würde am ehesten bei einer Hochzeit eine bewegende Rede halten?" },
    { fr: "Qui est le plus susceptible de taguer tout le monde sur des memes ?", en: "Who is most likely to tag everyone in memes?", de: "Wer würde am ehesten jeden in Memes markieren?" },
    { fr: "Qui est le plus susceptible de lancer un défi ridicule au groupe ?", en: "Who is most likely to challenge the group with a ridiculous dare?", de: "Wer würde am ehesten der Gruppe eine lächerliche Mutprobe stellen?" },
    { fr: "Qui est le plus susceptible de se mettre la honte en boîte de nuit ?", en: "Who is most likely to embarrass themselves at a nightclub?", de: "Wer würde am ehesten sich im Nachtclub blamieren?" },
    { fr: "Qui est le plus susceptible de lancer un podcast avec ses amis ?", en: "Who is most likely to start a podcast with their friends?", de: "Wer würde am ehesten einen Podcast mit Freunden starten?" },
    { fr: "Qui est le plus susceptible de devenir le parrain ou la marraine de l'enfant d'un ami ?", en: "Who is most likely to become the godparent of a friend's child?", de: "Wer würde am ehesten Pate des Kindes eines Freundes werden?" },
    { fr: "Qui est le plus susceptible de toujours avoir des snacks dans son sac ?", en: "Who is most likely to always have snacks in their bag?", de: "Wer würde am ehesten immer Snacks in der Tasche haben?" },
    { fr: "Qui est le plus susceptible de faire rire tout le monde dans un moment tendu ?", en: "Who is most likely to make everyone laugh in a tense moment?", de: "Wer würde am ehesten alle in einem angespannten Moment zum Lachen bringen?" },
    { fr: "Qui est le plus susceptible de se souvenir d'une promesse faite il y a 5 ans ?", en: "Who is most likely to remember a promise made 5 years ago?", de: "Wer würde am ehesten sich an ein Versprechen von vor 5 Jahren erinnern?" },
    // Replacements — edgier friendship questions
    { fr: "Qui est le plus susceptible de choisir son partenaire plutôt que ses amis à chaque fois ?", en: "Who is most likely to always choose their partner over their friends?", de: "Wer würde am ehesten immer den Partner statt die Freunde wählen?" },
    { fr: "Qui est le plus susceptible de briser le groupe en choisissant un camp ?", en: "Who is most likely to split the group by choosing sides?", de: "Wer würde am ehesten die Gruppe spalten, indem er Partei ergreift?" },
    { fr: "Qui est le plus susceptible de devenir toxique dans une amitié sans s'en rendre compte ?", en: "Who is most likely to become toxic in a friendship without realizing it?", de: "Wer würde am ehesten in einer Freundschaft toxisch werden, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible de te remplacer par un nouvel ami ?", en: "Who is most likely to replace you with a new friend?", de: "Wer würde am ehesten dich durch einen neuen Freund ersetzen?" },
    { fr: "Qui est le plus susceptible de couper les ponts du jour au lendemain ?", en: "Who is most likely to cut you off overnight?", de: "Wer würde am ehesten von heute auf morgen den Kontakt abbrechen?" },
    { fr: "Qui est le plus susceptible d'être ami avec tout le monde mais proche de personne ?", en: "Who is most likely to be friends with everyone but close to nobody?", de: "Wer würde am ehesten mit allen befreundet sein, aber niemandem nahestehen?" },
    { fr: "Qui est le plus susceptible de ne venir qu'aux soirées où il y a de l'alcool gratuit ?", en: "Who is most likely to only come to parties with free drinks?", de: "Wer würde am ehesten nur zu Partys mit Gratisgetränken kommen?" },
    { fr: "Qui est le plus susceptible de disparaître du groupe pendant 6 mois et revenir comme si de rien n'était ?", en: "Who is most likely to disappear from the group for 6 months and come back like nothing happened?", de: "Wer würde am ehesten 6 Monate aus der Gruppe verschwinden und zurückkommen, als wäre nichts gewesen?" },
    { fr: "Qui est le plus susceptible de publier une photo de groupe sans demander la permission ?", en: "Who is most likely to post a group photo without asking permission?", de: "Wer würde am ehesten ein Gruppenfoto posten, ohne um Erlaubnis zu fragen?" },
    { fr: "Qui est le plus susceptible de créer des sous-groupes en cachette ?", en: "Who is most likely to secretly create sub-groups?", de: "Wer würde am ehesten heimlich Untergruppen bilden?" },
    { fr: "Qui est le plus susceptible de comparer ses amis entre eux ?", en: "Who is most likely to compare their friends to each other?", de: "Wer würde am ehesten seine Freunde miteinander vergleichen?" },
  ],

  family: [
    { fr: "Qui est le plus susceptible de devenir le baby-sitter officiel de la famille ?", en: "Who is most likely to become the family's official babysitter?", de: "Wer würde am ehesten der offizielle Babysitter der Familie werden?" },
    { fr: "Qui est le plus susceptible de lancer un débat politique au repas de famille ?", en: "Who is most likely to start a political debate at a family dinner?", de: "Wer würde am ehesten beim Familienessen eine politische Debatte starten?" },
    { fr: "Qui est le plus susceptible de vouloir toujours choisir la musique en voiture ?", en: "Who is most likely to always want to choose the music in the car?", de: "Wer würde am ehesten im Auto immer die Musik aussuchen wollen?" },
    { fr: "Qui est le plus susceptible de manger les restes de tout le monde ?", en: "Who is most likely to eat everyone's leftovers?", de: "Wer würde am ehesten die Reste von allen essen?" },
    { fr: "Qui est le plus susceptible de faire pleurer quelqu'un avec un cadeau ?", en: "Who is most likely to make someone cry with a gift?", de: "Wer würde am ehesten jemanden mit einem Geschenk zum Weinen bringen?" },
    { fr: "Qui est le plus susceptible de toujours prendre le parti des parents ?", en: "Who is most likely to always side with the parents?", de: "Wer würde am ehesten immer die Seite der Eltern ergreifen?" },
    { fr: "Qui est le plus susceptible de raconter les mêmes blagues que son père ?", en: "Who is most likely to tell the same jokes as their dad?", de: "Wer würde am ehesten die gleichen Witze wie der Vater erzählen?" },
    { fr: "Qui est le plus susceptible de devenir le premier à avoir des enfants ?", en: "Who is most likely to be the first to have kids?", de: "Wer würde am ehesten als Erster Kinder bekommen?" },
    { fr: "Qui est le plus susceptible de faire brûler un plat au four ?", en: "Who is most likely to burn a dish in the oven?", de: "Wer würde am ehesten ein Gericht im Ofen anbrennen lassen?" },
    { fr: "Qui est le plus susceptible de se disputer avec un cousin au repas de Noël ?", en: "Who is most likely to argue with a cousin at Christmas dinner?", de: "Wer würde am ehesten sich mit einem Cousin beim Weihnachtsessen streiten?" },
    { fr: "Qui est le plus susceptible de devenir le gardien des traditions familiales ?", en: "Who is most likely to become the keeper of family traditions?", de: "Wer würde am ehesten der Hüter der Familientraditionen werden?" },
    { fr: "Qui est le plus susceptible de toujours défendre le petit frère ou la petite sœur ?", en: "Who is most likely to always defend the younger sibling?", de: "Wer würde am ehesten immer das jüngere Geschwisterkind verteidigen?" },
    { fr: "Qui est le plus susceptible de retrouver un album photo et de le montrer à tout le monde ?", en: "Who is most likely to find a photo album and show it to everyone?", de: "Wer würde am ehesten ein Fotoalbum finden und es allen zeigen?" },
    { fr: "Qui est le plus susceptible de faire la grasse matinée quand toute la famille est debout ?", en: "Who is most likely to sleep in while the whole family is up?", de: "Wer würde am ehesten ausschlafen, während die ganze Familie schon wach ist?" },
    { fr: "Qui est le plus susceptible de devenir le meilleur oncle ou la meilleure tante ?", en: "Who is most likely to become the best uncle or aunt?", de: "Wer würde am ehesten der beste Onkel oder die beste Tante werden?" },
    { fr: "Qui est le plus susceptible de tout dire à sa mère ?", en: "Who is most likely to tell their mom everything?", de: "Wer würde am ehesten der Mutter alles erzählen?" },
    { fr: "Qui est le plus susceptible de se battre pour la dernière part de pizza ?", en: "Who is most likely to fight over the last slice of pizza?", de: "Wer würde am ehesten um das letzte Stück Pizza kämpfen?" },
    { fr: "Qui est le plus susceptible de devenir le médiateur des conflits familiaux ?", en: "Who is most likely to become the mediator of family conflicts?", de: "Wer würde am ehesten zum Vermittler bei Familienkonflikten werden?" },
    { fr: "Qui est le plus susceptible de faire un arbre généalogique ?", en: "Who is most likely to make a family tree?", de: "Wer würde am ehesten einen Stammbaum erstellen?" },
    { fr: "Qui est le plus susceptible de pleurer au mariage d'un membre de la famille ?", en: "Who is most likely to cry at a family member's wedding?", de: "Wer würde am ehesten bei der Hochzeit eines Familienmitglieds weinen?" },
    { fr: "Qui est le plus susceptible de se perdre lors d'une sortie en famille ?", en: "Who is most likely to get lost during a family outing?", de: "Wer würde am ehesten sich bei einem Familienausflug verlaufen?" },
    { fr: "Qui est le plus susceptible de faire un discours gênant à un dîner de famille ?", en: "Who is most likely to give an embarrassing speech at a family dinner?", de: "Wer würde am ehesten eine peinliche Rede beim Familienessen halten?" },
    { fr: "Qui est le plus susceptible de toujours vouloir jouer à des jeux de société ?", en: "Who is most likely to always want to play board games?", de: "Wer würde am ehesten immer Brettspiele spielen wollen?" },
    { fr: "Qui est le plus susceptible de casser quelque chose chez les grands-parents ?", en: "Who is most likely to break something at the grandparents' house?", de: "Wer würde am ehesten etwas bei den Großeltern kaputt machen?" },
    { fr: "Qui est le plus susceptible de devenir fan de la recette secrète de grand-mère ?", en: "Who is most likely to become a fan of grandma's secret recipe?", de: "Wer würde am ehesten Fan von Omas Geheimrezept werden?" },
    { fr: "Qui est le plus susceptible de se plaindre pendant un voyage en voiture ?", en: "Who is most likely to complain during a road trip?", de: "Wer würde am ehesten sich während einer Autofahrt beschweren?" },
    { fr: "Qui est le plus susceptible de demander de l'argent de poche à 25 ans ?", en: "Who is most likely to ask for pocket money at 25?", de: "Wer würde am ehesten mit 25 noch nach Taschengeld fragen?" },
    { fr: "Qui est le plus susceptible de devenir végétarien et de l'annoncer au dîner de famille ?", en: "Who is most likely to go vegetarian and announce it at family dinner?", de: "Wer würde am ehesten Vegetarier werden und es beim Familienessen verkünden?" },
    { fr: "Qui est le plus susceptible de raconter des blagues nulles à table ?", en: "Who is most likely to tell terrible jokes at the dinner table?", de: "Wer würde am ehesten am Esstisch schlechte Witze erzählen?" },
    { fr: "Qui est le plus susceptible de vouloir organiser les vacances pour toute la famille ?", en: "Who is most likely to want to organize the vacation for the whole family?", de: "Wer würde am ehesten den Urlaub für die ganze Familie organisieren wollen?" },
    { fr: "Qui est le plus susceptible de paniquer pour un petit bobo ?", en: "Who is most likely to panic over a small boo-boo?", de: "Wer würde am ehesten bei einem kleinen Wehwehchen in Panik geraten?" },
    { fr: "Qui est le plus susceptible de se lever le premier le jour de Noël ?", en: "Who is most likely to wake up first on Christmas Day?", de: "Wer würde am ehesten am Weihnachtsmorgen als Erster aufstehen?" },
    { fr: "Qui est le plus susceptible d'envoyer des photos de famille dans le groupe WhatsApp ?", en: "Who is most likely to send family photos in the WhatsApp group?", de: "Wer würde am ehesten Familienfotos in die WhatsApp-Gruppe senden?" },
    { fr: "Qui est le plus susceptible de faire un discours à chaque anniversaire ?", en: "Who is most likely to give a speech at every birthday?", de: "Wer würde am ehesten bei jedem Geburtstag eine Rede halten?" },
    { fr: "Qui est le plus susceptible de pleurer en regardant les vidéos de son enfance ?", en: "Who is most likely to cry watching their childhood videos?", de: "Wer würde am ehesten beim Anschauen von Kindheitsvideos weinen?" },
    { fr: "Qui est le plus susceptible de refuser de sortir les poubelles ?", en: "Who is most likely to refuse to take out the trash?", de: "Wer würde am ehesten sich weigern, den Müll rauszubringen?" },
    { fr: "Qui est le plus susceptible de toujours finir les courses avec des trucs pas sur la liste ?", en: "Who is most likely to always buy things not on the grocery list?", de: "Wer würde am ehesten beim Einkaufen immer Sachen kaufen, die nicht auf der Liste stehen?" },
    // Replacements — edgier family questions
    { fr: "Qui est le plus susceptible de couper les ponts avec un membre de la famille ?", en: "Who is most likely to cut ties with a family member?", de: "Wer würde am ehesten den Kontakt zu einem Familienmitglied abbrechen?" },
    { fr: "Qui est le plus susceptible de cacher un secret de famille pendant des années ?", en: "Who is most likely to hide a family secret for years?", de: "Wer würde am ehesten ein Familiengeheimnis jahrelang verbergen?" },
    { fr: "Qui est le plus susceptible de déshériter quelqu'un de la famille ?", en: "Who is most likely to disinherit a family member?", de: "Wer würde am ehesten ein Familienmitglied enterben?" },
    { fr: "Qui est le plus susceptible de mentir à toute la famille pour éviter un repas ?", en: "Who is most likely to lie to the whole family to avoid a dinner?", de: "Wer würde am ehesten die ganze Familie anlügen, um einem Essen zu entgehen?" },
    { fr: "Qui est le plus susceptible de provoquer un divorce dans la famille ?", en: "Who is most likely to cause a divorce in the family?", de: "Wer würde am ehesten eine Scheidung in der Familie verursachen?" },
    { fr: "Qui est le plus susceptible de préférer secrètement un frère ou une sœur ?", en: "Who is most likely to secretly have a favorite sibling?", de: "Wer würde am ehesten heimlich ein Lieblingsgeschwisterkind haben?" },
    { fr: "Qui est le plus susceptible de ne jamais rendre visite à ses parents en maison de retraite ?", en: "Who is most likely to never visit their parents in a nursing home?", de: "Wer würde am ehesten die Eltern im Altersheim nie besuchen?" },
    { fr: "Qui est le plus susceptible de révéler un secret de famille après quelques verres ?", en: "Who is most likely to spill a family secret after a few drinks?", de: "Wer würde am ehesten nach ein paar Gläsern ein Familiengeheimnis ausplaudern?" },
    { fr: "Qui est le plus susceptible de se disputer pour l'héritage ?", en: "Who is most likely to fight over the inheritance?", de: "Wer würde am ehesten sich ums Erbe streiten?" },
    { fr: "Qui est le plus susceptible de ramener quelqu'un que la famille déteste à Noël ?", en: "Who is most likely to bring someone the family hates to Christmas?", de: "Wer würde am ehesten jemanden zu Weihnachten mitbringen, den die Familie hasst?" },
    { fr: "Qui est le plus susceptible de fuir la maison familiale le plus tôt possible ?", en: "Who is most likely to leave the family home as soon as possible?", de: "Wer würde am ehesten so schnell wie möglich von zu Hause ausziehen?" },
    { fr: "Qui est le plus susceptible de critiquer l'éducation de ses parents ?", en: "Who is most likely to criticize their parents' parenting?", de: "Wer würde am ehesten die Erziehung der Eltern kritisieren?" },
    { fr: "Qui est le plus susceptible de toujours rappeler les erreurs passées d'un membre de la famille ?", en: "Who is most likely to always bring up a family member's past mistakes?", de: "Wer würde am ehesten immer die vergangenen Fehler eines Familienmitglieds erwähnen?" },
  ],

  job: [
    { fr: "Qui est le plus susceptible de démissionner avec style ?", en: "Who is most likely to quit their job in style?", de: "Wer würde am ehesten mit Stil kündigen?" },
    { fr: "Qui est le plus susceptible de devenir patron avant 30 ans ?", en: "Who is most likely to become a boss before 30?", de: "Wer würde am ehesten vor 30 Chef werden?" },
    { fr: "Qui est le plus susceptible de faire une présentation sans préparation ?", en: "Who is most likely to give a presentation without preparation?", de: "Wer würde am ehesten eine Präsentation ohne Vorbereitung halten?" },
    { fr: "Qui est le plus susceptible de toujours être en réunion Zoom en pyjama en bas ?", en: "Who is most likely to always be in Zoom meetings wearing pajama bottoms?", de: "Wer würde am ehesten bei Zoom-Meetings immer unten eine Schlafanzughose tragen?" },
    { fr: "Qui est le plus susceptible de répondre à des emails professionnels à 23h ?", en: "Who is most likely to reply to work emails at 11 PM?", de: "Wer würde am ehesten um 23 Uhr auf Arbeits-E-Mails antworten?" },
    { fr: "Qui est le plus susceptible de se faire une sieste cachée au travail ?", en: "Who is most likely to sneak a nap at work?", de: "Wer würde am ehesten sich bei der Arbeit ein heimliches Nickerchen gönnen?" },
    { fr: "Qui est le plus susceptible de devenir le leader naturel d'une équipe ?", en: "Who is most likely to become the natural leader of a team?", de: "Wer würde am ehesten der natürliche Anführer eines Teams werden?" },
    { fr: "Qui est le plus susceptible de faire des heures sup sans qu'on le demande ?", en: "Who is most likely to work overtime without being asked?", de: "Wer würde am ehesten Überstunden machen, ohne dass man es verlangt?" },
    { fr: "Qui est le plus susceptible d'avoir le bureau le plus bordélique ?", en: "Who is most likely to have the messiest desk?", de: "Wer würde am ehesten den unordentlichsten Schreibtisch haben?" },
    { fr: "Qui est le plus susceptible de prendre 2h de pause déjeuner ?", en: "Who is most likely to take a 2-hour lunch break?", de: "Wer würde am ehesten 2 Stunden Mittagspause machen?" },
    { fr: "Qui est le plus susceptible d'écrire un livre un jour ?", en: "Who is most likely to write a book someday?", de: "Wer würde am ehesten eines Tages ein Buch schreiben?" },
    { fr: "Qui est le plus susceptible de devenir digital nomad ?", en: "Who is most likely to become a digital nomad?", de: "Wer würde am ehesten digitaler Nomade werden?" },
    { fr: "Qui est le plus susceptible de tout procrastiner puis tout faire la dernière nuit ?", en: "Who is most likely to procrastinate everything then do it all the last night?", de: "Wer würde am ehesten alles aufschieben und dann alles in der letzten Nacht erledigen?" },
    { fr: "Qui est le plus susceptible de créer un side hustle ?", en: "Who is most likely to start a side hustle?", de: "Wer würde am ehesten ein Nebenprojekt starten?" },
    { fr: "Qui est le plus susceptible d'inventer un produit révolutionnaire ?", en: "Who is most likely to invent a revolutionary product?", de: "Wer würde am ehesten ein revolutionäres Produkt erfinden?" },
    { fr: "Qui est le plus susceptible de rater un entretien d'embauche à cause d'une gaffe ?", en: "Who is most likely to fail a job interview because of a blunder?", de: "Wer würde am ehesten ein Vorstellungsgespräch wegen eines Fauxpas vermasseln?" },
    { fr: "Qui est le plus susceptible de travailler dans un café plutôt qu'au bureau ?", en: "Who is most likely to work in a café rather than the office?", de: "Wer würde am ehesten lieber in einem Café als im Büro arbeiten?" },
    { fr: "Qui est le plus susceptible de devenir le roi ou la reine du networking ?", en: "Who is most likely to become the king or queen of networking?", de: "Wer würde am ehesten der König oder die Königin des Networkings werden?" },
    { fr: "Qui est le plus susceptible de tout automatiser pour ne rien faire ?", en: "Who is most likely to automate everything so they don't have to do anything?", de: "Wer würde am ehesten alles automatisieren, um nichts tun zu müssen?" },
    { fr: "Qui est le plus susceptible de devenir mentor pour les nouveaux ?", en: "Who is most likely to become a mentor for newcomers?", de: "Wer würde am ehesten Mentor für Neulinge werden?" },
    { fr: "Qui est le plus susceptible de se faire remarquer par un chasseur de têtes ?", en: "Who is most likely to get noticed by a headhunter?", de: "Wer würde am ehesten von einem Headhunter entdeckt werden?" },
    { fr: "Qui est le plus susceptible d'oublier un meeting important ?", en: "Who is most likely to forget an important meeting?", de: "Wer würde am ehesten ein wichtiges Meeting vergessen?" },
    { fr: "Qui est le plus susceptible de partir vivre à l'étranger pour le travail ?", en: "Who is most likely to move abroad for work?", de: "Wer würde am ehesten fürs Arbeiten ins Ausland ziehen?" },
    { fr: "Qui est le plus susceptible de prendre un congé sabbatique ?", en: "Who is most likely to take a sabbatical?", de: "Wer würde am ehesten ein Sabbatjahr nehmen?" },
    { fr: "Qui est le plus susceptible de ramener du gâteau pour toute l'équipe ?", en: "Who is most likely to bring cake for the whole team?", de: "Wer würde am ehesten Kuchen für das ganze Team mitbringen?" },
    { fr: "Qui est le plus susceptible de faire un burn-out ?", en: "Who is most likely to experience burnout?", de: "Wer würde am ehesten ein Burnout erleben?" },
    { fr: "Qui est le plus susceptible de monter sa boîte et la revendre des millions ?", en: "Who is most likely to build a company and sell it for millions?", de: "Wer würde am ehesten ein Unternehmen aufbauen und für Millionen verkaufen?" },
    { fr: "Qui est le plus susceptible de créer une chaîne YouTube ?", en: "Who is most likely to start a YouTube channel?", de: "Wer würde am ehesten einen YouTube-Kanal starten?" },
    { fr: "Qui est le plus susceptible de travailler en freelance ?", en: "Who is most likely to work freelance?", de: "Wer würde am ehesten als Freelancer arbeiten?" },
    { fr: "Qui est le plus susceptible de se faire payer en crypto ?", en: "Who is most likely to get paid in crypto?", de: "Wer würde am ehesten in Krypto bezahlt werden?" },
    { fr: "Qui est le plus susceptible de quitter tout et ouvrir un restaurant ?", en: "Who is most likely to quit everything and open a restaurant?", de: "Wer würde am ehesten alles aufgeben und ein Restaurant eröffnen?" },
    { fr: "Qui est le plus susceptible de travailler dans un domaine totalement imprévu ?", en: "Who is most likely to work in a completely unexpected field?", de: "Wer würde am ehesten in einem völlig unerwarteten Bereich arbeiten?" },
    // Replacements — edgier job questions
    { fr: "Qui est le plus susceptible de dénoncer son entreprise pour des pratiques illégales ?", en: "Who is most likely to blow the whistle on their company for illegal practices?", de: "Wer würde am ehesten sein Unternehmen wegen illegaler Praktiken anzeigen?" },
    { fr: "Qui est le plus susceptible de mentir en entretien et se faire démasquer ?", en: "Who is most likely to lie in a job interview and get exposed?", de: "Wer würde am ehesten im Vorstellungsgespräch lügen und auffliegen?" },
    { fr: "Qui est le plus susceptible de se faire manipuler par son patron ?", en: "Who is most likely to get manipulated by their boss?", de: "Wer würde am ehesten von seinem Chef manipuliert werden?" },
    { fr: "Qui est le plus susceptible de devenir riche grâce à un coup de chance ?", en: "Who is most likely to get rich by sheer luck?", de: "Wer würde am ehesten durch pures Glück reich werden?" },
    { fr: "Qui est le plus susceptible de se faire virer et le mériter ?", en: "Who is most likely to get fired and deserve it?", de: "Wer würde am ehesten gefeuert werden und es verdienen?" },
    { fr: "Qui est le plus susceptible de voler des fournitures au bureau ?", en: "Who is most likely to steal office supplies?", de: "Wer würde am ehesten Büromaterial klauen?" },
    { fr: "Qui est le plus susceptible de saboter un collègue pour une promotion ?", en: "Who is most likely to sabotage a colleague for a promotion?", de: "Wer würde am ehesten einen Kollegen für eine Beförderung sabotieren?" },
    { fr: "Qui est le plus susceptible de devenir corrompu s'il avait le pouvoir ?", en: "Who is most likely to become corrupt if given power?", de: "Wer würde am ehesten korrupt werden, wenn er Macht hätte?" },
    { fr: "Qui est le plus susceptible de finir en procès avec son employeur ?", en: "Who is most likely to end up in a lawsuit with their employer?", de: "Wer würde am ehesten in einem Rechtsstreit mit dem Arbeitgeber landen?" },
    { fr: "Qui est le plus susceptible de devenir le pire patron du monde ?", en: "Who is most likely to become the worst boss in the world?", de: "Wer würde am ehesten der schlechteste Chef der Welt werden?" },
    { fr: "Qui est le plus susceptible d'exploiter un stagiaire ?", en: "Who is most likely to exploit an intern?", de: "Wer würde am ehesten einen Praktikanten ausbeuten?" },
    { fr: "Qui est le plus susceptible de s'attribuer le mérite du travail d'équipe ?", en: "Who is most likely to take credit for teamwork?", de: "Wer würde am ehesten sich die Teamarbeit zuschreiben?" },
    { fr: "Qui est le plus susceptible de sacrifier sa vie personnelle pour sa carrière ?", en: "Who is most likely to sacrifice their personal life for their career?", de: "Wer würde am ehesten sein Privatleben für die Karriere opfern?" },
    { fr: "Qui est le plus susceptible de devenir un micro-manager insupportable ?", en: "Who is most likely to become an unbearable micromanager?", de: "Wer würde am ehesten ein unerträglicher Mikromanager werden?" },
    { fr: "Qui est le plus susceptible de trahir une clause de confidentialité ?", en: "Who is most likely to breach a confidentiality agreement?", de: "Wer würde am ehesten eine Vertraulichkeitsklausel brechen?" },
    { fr: "Qui est le plus susceptible de harceler quelqu'un au travail sans s'en rendre compte ?", en: "Who is most likely to unintentionally harass someone at work?", de: "Wer würde am ehesten jemanden bei der Arbeit unabsichtlich belästigen?" },
    { fr: "Qui est le plus susceptible de se faire des ennemis au bureau ?", en: "Who is most likely to make enemies at the office?", de: "Wer würde am ehesten sich Feinde im Büro machen?" },
    { fr: "Qui est le plus susceptible de finir par travailler pour un concurrent ?", en: "Who is most likely to end up working for a competitor?", de: "Wer würde am ehesten bei der Konkurrenz landen?" },
  ],

  hot: [
    { fr: "Qui est le plus susceptible de regarder le profil de son ex à 2h du matin ?", en: "Who is most likely to check their ex's profile at 2 AM?", de: "Wer würde am ehesten um 2 Uhr nachts das Profil des Ex checken?" },
    { fr: "Qui est le plus susceptible d'avoir un crush qu'il n'avouera jamais ?", en: "Who is most likely to have a crush they'll never admit?", de: "Wer würde am ehesten einen Schwarm haben, den er nie zugeben würde?" },
    { fr: "Qui est le plus susceptible de faire le premier pas ?", en: "Who is most likely to make the first move?", de: "Wer würde am ehesten den ersten Schritt machen?" },
    { fr: "Qui est le plus susceptible de rester ami avec tous ses ex ?", en: "Who is most likely to stay friends with all their exes?", de: "Wer würde am ehesten mit allen Ex-Partnern befreundet bleiben?" },
    { fr: "Qui est le plus susceptible de tomber amoureux après un seul rendez-vous ?", en: "Who is most likely to fall in love after just one date?", de: "Wer würde am ehesten sich nach nur einem Date verlieben?" },
    { fr: "Qui est le plus susceptible de préparer un dîner aux chandelles ?", en: "Who is most likely to prepare a candlelit dinner?", de: "Wer würde am ehesten ein Abendessen bei Kerzenschein vorbereiten?" },
    { fr: "Qui est le plus susceptible de se marier à Las Vegas ?", en: "Who is most likely to get married in Las Vegas?", de: "Wer würde am ehesten in Las Vegas heiraten?" },
    { fr: "Qui est le plus susceptible de draguer le serveur ou la serveuse ?", en: "Who is most likely to flirt with the waiter or waitress?", de: "Wer würde am ehesten mit dem Kellner oder der Kellnerin flirten?" },
    { fr: "Qui est le plus susceptible d'envoyer un message embarrassant à la mauvaise personne ?", en: "Who is most likely to send an embarrassing message to the wrong person?", de: "Wer würde am ehesten eine peinliche Nachricht an die falsche Person senden?" },
    { fr: "Qui est le plus susceptible d'avoir le plus de matchs sur une appli de rencontre ?", en: "Who is most likely to have the most matches on a dating app?", de: "Wer würde am ehesten die meisten Matches auf einer Dating-App haben?" },
    { fr: "Qui est le plus susceptible de faire un grand geste romantique en public ?", en: "Who is most likely to make a big romantic gesture in public?", de: "Wer würde am ehesten eine große romantische Geste in der Öffentlichkeit machen?" },
    { fr: "Qui est le plus susceptible de retomber amoureux de son ex ?", en: "Who is most likely to fall back in love with their ex?", de: "Wer würde am ehesten sich wieder in den Ex verlieben?" },
    { fr: "Qui est le plus susceptible de cacher une relation pendant des mois ?", en: "Who is most likely to hide a relationship for months?", de: "Wer würde am ehesten eine Beziehung monatelang verheimlichen?" },
    { fr: "Qui est le plus susceptible de faire un duo TikTok romantique ?", en: "Who is most likely to make a romantic TikTok duet?", de: "Wer würde am ehesten ein romantisches TikTok-Duett machen?" },
    { fr: "Qui est le plus susceptible de tomber amoureux de quelqu'un sur internet ?", en: "Who is most likely to fall in love with someone online?", de: "Wer würde am ehesten sich online in jemanden verlieben?" },
    { fr: "Qui est le plus susceptible de parler de son ex en soirée ?", en: "Who is most likely to talk about their ex at a party?", de: "Wer würde am ehesten auf einer Party über den Ex reden?" },
    { fr: "Qui est le plus susceptible de se fiancer après 3 mois de relation ?", en: "Who is most likely to get engaged after 3 months of dating?", de: "Wer würde am ehesten sich nach 3 Monaten Beziehung verloben?" },
    { fr: "Qui est le plus susceptible de faire une playlist romantique pour quelqu'un ?", en: "Who is most likely to make a romantic playlist for someone?", de: "Wer würde am ehesten eine romantische Playlist für jemanden erstellen?" },
    { fr: "Qui est le plus susceptible d'offrir des fleurs sans raison ?", en: "Who is most likely to give flowers for no reason?", de: "Wer würde am ehesten grundlos Blumen schenken?" },
    { fr: "Qui est le plus susceptible de chanter une chanson d'amour à quelqu'un ?", en: "Who is most likely to sing a love song to someone?", de: "Wer würde am ehesten jemandem ein Liebeslied singen?" },
    { fr: "Qui est le plus susceptible de se marier avec son meilleur ami ?", en: "Who is most likely to marry their best friend?", de: "Wer würde am ehesten den besten Freund heiraten?" },
    { fr: "Qui est le plus susceptible de tout plaquer pour l'amour ?", en: "Who is most likely to drop everything for love?", de: "Wer würde am ehesten alles für die Liebe aufgeben?" },
    { fr: "Qui est le plus susceptible de créer un profil de rencontre hilarant ?", en: "Who is most likely to create a hilarious dating profile?", de: "Wer würde am ehesten ein urkomisches Dating-Profil erstellen?" },
    { fr: "Qui est le plus susceptible de flirter sans s'en rendre compte ?", en: "Who is most likely to flirt without realizing it?", de: "Wer würde am ehesten flirten, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible de se réconcilier le jour même d'une dispute ?", en: "Who is most likely to make up the same day as a fight?", de: "Wer würde am ehesten sich am selben Tag eines Streits versöhnen?" },
    { fr: "Qui est le plus susceptible de planifier le mariage parfait depuis des années ?", en: "Who is most likely to have been planning the perfect wedding for years?", de: "Wer plant am ehesten schon seit Jahren die perfekte Hochzeit?" },
    { fr: "Qui est le plus susceptible de demander un rendez-vous avec un mot écrit à la main ?", en: "Who is most likely to ask someone out with a handwritten note?", de: "Wer würde am ehesten jemanden mit einem handgeschriebenen Zettel um ein Date bitten?" },
    { fr: "Qui est le plus susceptible de finir en couple avec quelqu'un du groupe ?", en: "Who is most likely to end up dating someone from the group?", de: "Wer würde am ehesten mit jemandem aus der Gruppe zusammenkommen?" },
    { fr: "Qui est le plus susceptible de bloquer quelqu'un et le débloquer le lendemain ?", en: "Who is most likely to block someone and unblock them the next day?", de: "Wer würde am ehesten jemanden blockieren und am nächsten Tag wieder entblocken?" },
    { fr: "Qui est le plus susceptible de dire 'on est juste amis' alors que c'est faux ?", en: "Who is most likely to say 'we're just friends' when it's not true?", de: "Wer würde am ehesten sagen 'wir sind nur Freunde', obwohl es nicht stimmt?" },
    // Replacements — spicier hot questions
    { fr: "Qui est le plus susceptible de tromper son ou sa partenaire ?", en: "Who is most likely to cheat on their partner?", de: "Wer würde am ehesten seinen Partner betrügen?" },
    { fr: "Qui est le plus susceptible d'avoir une relation toxique et de ne pas s'en sortir ?", en: "Who is most likely to stay in a toxic relationship?", de: "Wer würde am ehesten in einer toxischen Beziehung bleiben?" },
    { fr: "Qui est le plus susceptible de se marier et divorcer dans l'année ?", en: "Who is most likely to get married and divorced within a year?", de: "Wer würde am ehesten innerhalb eines Jahres heiraten und sich scheiden lassen?" },
    { fr: "Qui est le plus susceptible d'avoir une double vie sentimentale ?", en: "Who is most likely to live a double love life?", de: "Wer würde am ehesten ein sentimentales Doppelleben führen?" },
    { fr: "Qui est le plus susceptible de tomber amoureux de quelqu'un de totalement inapproprié ?", en: "Who is most likely to fall for someone completely inappropriate?", de: "Wer würde am ehesten sich in jemanden völlig Unpassenden verlieben?" },
    { fr: "Qui est le plus susceptible de stalker le nouveau ou la nouvelle de son ex ?", en: "Who is most likely to stalk their ex's new partner?", de: "Wer würde am ehesten den neuen Partner des Ex stalken?" },
    { fr: "Qui est le plus susceptible de faire une folie pour un anniversaire de couple ?", en: "Who is most likely to go all out for a relationship anniversary?", de: "Wer würde am ehesten für einen Beziehungsjahrestag alles geben?" },
    { fr: "Qui est le plus susceptible de faire une scène de film pour déclarer sa flamme ?", en: "Who is most likely to make a movie scene to declare their love?", de: "Wer würde am ehesten eine Filmszene nachspielen, um seine Liebe zu erklären?" },
    { fr: "Qui est le plus susceptible de pardonner une infidélité ?", en: "Who is most likely to forgive infidelity?", de: "Wer würde am ehesten Untreue verzeihen?" },
    { fr: "Qui est le plus susceptible de ruiner une relation par jalousie ?", en: "Who is most likely to ruin a relationship through jealousy?", de: "Wer würde am ehesten eine Beziehung durch Eifersucht ruinieren?" },
    { fr: "Qui est le plus susceptible de coucher avec quelqu'un juste pour oublier son ex ?", en: "Who is most likely to sleep with someone just to get over their ex?", de: "Wer würde am ehesten mit jemandem schlafen, nur um den Ex zu vergessen?" },
    { fr: "Qui est le plus susceptible d'être un cauchemar en couple ?", en: "Who is most likely to be a nightmare partner?", de: "Wer wäre am ehesten ein Alptraum als Partner?" },
    { fr: "Qui est le plus susceptible de mentir sur le nombre de ses ex ?", en: "Who is most likely to lie about the number of exes they've had?", de: "Wer würde am ehesten über die Anzahl seiner Ex-Partner lügen?" },
    { fr: "Qui est le plus susceptible de revenir avec un ex que tout le monde déteste ?", en: "Who is most likely to get back with an ex everyone hates?", de: "Wer würde am ehesten mit einem Ex zusammenkommen, den alle hassen?" },
    { fr: "Qui est le plus susceptible de raconter les détails intimes de sa relation à ses amis ?", en: "Who is most likely to share intimate relationship details with friends?", de: "Wer würde am ehesten intime Beziehungsdetails mit Freunden teilen?" },
    { fr: "Qui est le plus susceptible de changer de personnalité selon la personne qu'il drague ?", en: "Who is most likely to change their personality depending on who they're flirting with?", de: "Wer würde am ehesten seine Persönlichkeit ändern, je nachdem wen er anflirtet?" },
    { fr: "Qui est le plus susceptible de tomber amoureux de quelqu'un en couple ?", en: "Who is most likely to fall in love with someone who's already in a relationship?", de: "Wer würde am ehesten sich in jemanden verlieben, der schon in einer Beziehung ist?" },
    { fr: "Qui est le plus susceptible de faire du lovebombing sans s'en rendre compte ?", en: "Who is most likely to lovebomb someone without realizing it?", de: "Wer würde am ehesten jemanden lovebomben, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible d'utiliser l'amour comme excuse pour contrôler l'autre ?", en: "Who is most likely to use love as an excuse to control the other person?", de: "Wer würde am ehesten Liebe als Vorwand nutzen, um den anderen zu kontrollieren?" },
    { fr: "Qui est le plus susceptible de ghosther quelqu'un après un super rendez-vous ?", en: "Who is most likely to ghost someone after a great date?", de: "Wer würde am ehesten jemanden nach einem tollen Date ghosten?" },
  ],

  normal: [
    { fr: "Qui est le plus susceptible de vérifier 3 fois s'il a bien fermé la porte ?", en: "Who is most likely to check 3 times if they locked the door?", de: "Wer würde am ehesten 3 Mal prüfen, ob die Tür abgeschlossen ist?" },
    { fr: "Qui est le plus susceptible de recharger son téléphone 5 fois par jour ?", en: "Who is most likely to charge their phone 5 times a day?", de: "Wer würde am ehesten sein Handy 5 Mal am Tag aufladen?" },
    { fr: "Qui est le plus susceptible de commencer un livre et ne jamais le finir ?", en: "Who is most likely to start a book and never finish it?", de: "Wer würde am ehesten ein Buch anfangen und es nie beenden?" },
    { fr: "Qui est le plus susceptible d'arriver en avance partout ?", en: "Who is most likely to arrive early everywhere?", de: "Wer würde am ehesten überall zu früh ankommen?" },
    { fr: "Qui est le plus susceptible de dormir avec 15 alarmes ?", en: "Who is most likely to sleep with 15 alarms set?", de: "Wer würde am ehesten mit 15 Weckern schlafen?" },
    { fr: "Qui est le plus susceptible de porter la même tenue 3 jours de suite ?", en: "Who is most likely to wear the same outfit 3 days in a row?", de: "Wer würde am ehesten 3 Tage hintereinander das gleiche Outfit tragen?" },
    { fr: "Qui est le plus susceptible de googler chaque question qu'on lui pose ?", en: "Who is most likely to Google every question they're asked?", de: "Wer würde am ehesten jede Frage googeln, die man ihm stellt?" },
    { fr: "Qui est le plus susceptible de faire la queue 2 heures pour un restaurant hype ?", en: "Who is most likely to wait in line 2 hours for a trendy restaurant?", de: "Wer würde am ehesten 2 Stunden für ein trendiges Restaurant anstehen?" },
    { fr: "Qui est le plus susceptible de parler à Siri ou Alexa comme à un ami ?", en: "Who is most likely to talk to Siri or Alexa like a friend?", de: "Wer würde am ehesten mit Siri oder Alexa wie mit einem Freund reden?" },
    { fr: "Qui est le plus susceptible de se couper les cheveux et le regretter ?", en: "Who is most likely to cut their hair and regret it?", de: "Wer würde am ehesten sich die Haare schneiden und es bereuen?" },
    { fr: "Qui est le plus susceptible de manger un snack en cachette la nuit ?", en: "Who is most likely to sneak a snack at night?", de: "Wer würde am ehesten nachts heimlich naschen?" },
    { fr: "Qui est le plus susceptible d'apprendre une chorégraphie TikTok ?", en: "Who is most likely to learn a TikTok dance?", de: "Wer würde am ehesten eine TikTok-Choreografie lernen?" },
    { fr: "Qui est le plus susceptible de lire les avis avant d'acheter quoi que ce soit ?", en: "Who is most likely to read reviews before buying anything?", de: "Wer würde am ehesten Bewertungen lesen, bevor er etwas kauft?" },
    { fr: "Qui est le plus susceptible de passer 1 heure aux toilettes avec son téléphone ?", en: "Who is most likely to spend 1 hour in the bathroom with their phone?", de: "Wer würde am ehesten 1 Stunde mit dem Handy auf der Toilette verbringen?" },
    { fr: "Qui est le plus susceptible de tout ranger par couleur ?", en: "Who is most likely to organize everything by color?", de: "Wer würde am ehesten alles nach Farbe sortieren?" },
    { fr: "Qui est le plus susceptible de chanter faux sans s'en rendre compte ?", en: "Who is most likely to sing off-key without realizing it?", de: "Wer würde am ehesten falsch singen, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible de se perdre dans ses pensées en pleine conversation ?", en: "Who is most likely to zone out in the middle of a conversation?", de: "Wer würde am ehesten mitten im Gespräch in Gedanken versinken?" },
    { fr: "Qui est le plus susceptible de se mettre au sport et arrêter après une semaine ?", en: "Who is most likely to start working out and quit after a week?", de: "Wer würde am ehesten mit Sport anfangen und nach einer Woche aufhören?" },
    { fr: "Qui est le plus susceptible de mélanger les noms de tout le monde ?", en: "Who is most likely to mix up everyone's names?", de: "Wer würde am ehesten die Namen aller durcheinander bringen?" },
    { fr: "Qui est le plus susceptible de passer des heures dans un magasin sans rien acheter ?", en: "Who is most likely to spend hours in a store without buying anything?", de: "Wer würde am ehesten Stunden in einem Laden verbringen, ohne etwas zu kaufen?" },
    { fr: "Qui est le plus susceptible de prendre le mauvais bus ou métro ?", en: "Who is most likely to take the wrong bus or subway?", de: "Wer würde am ehesten den falschen Bus oder die falsche U-Bahn nehmen?" },
    { fr: "Qui est le plus susceptible de collectionner des trucs inutiles ?", en: "Who is most likely to collect useless things?", de: "Wer würde am ehesten nutzlose Dinge sammeln?" },
    { fr: "Qui est le plus susceptible de s'endormir devant la télé ?", en: "Who is most likely to fall asleep in front of the TV?", de: "Wer würde am ehesten vor dem Fernseher einschlafen?" },
    { fr: "Qui est le plus susceptible de prendre un parapluie et de l'oublier quelque part ?", en: "Who is most likely to take an umbrella and forget it somewhere?", de: "Wer würde am ehesten einen Regenschirm mitnehmen und ihn irgendwo vergessen?" },
    { fr: "Qui est le plus susceptible de toujours avoir une batterie externe ?", en: "Who is most likely to always carry a portable charger?", de: "Wer würde am ehesten immer eine Powerbank dabei haben?" },
    { fr: "Qui est le plus susceptible de se tromper de jour pour un rendez-vous ?", en: "Who is most likely to show up on the wrong day for an appointment?", de: "Wer würde am ehesten am falschen Tag zu einem Termin erscheinen?" },
    { fr: "Qui est le plus susceptible de cuisiner le même plat toute la semaine ?", en: "Who is most likely to cook the same dish all week?", de: "Wer würde am ehesten die ganze Woche das gleiche Gericht kochen?" },
    { fr: "Qui est le plus susceptible de garder des vêtements qu'il ne porte plus ?", en: "Who is most likely to keep clothes they no longer wear?", de: "Wer würde am ehesten Kleidung behalten, die er nicht mehr trägt?" },
    { fr: "Qui est le plus susceptible de tout faire au dernier moment ?", en: "Who is most likely to do everything at the last minute?", de: "Wer würde am ehesten alles auf den letzten Drücker erledigen?" },
    { fr: "Qui est le plus susceptible de passer son dimanche entier en pyjama ?", en: "Who is most likely to spend the entire Sunday in pajamas?", de: "Wer würde am ehesten den ganzen Sonntag im Schlafanzug verbringen?" },
    { fr: "Qui est le plus susceptible de finir ses courses avec juste des snacks ?", en: "Who is most likely to finish grocery shopping with only snacks?", de: "Wer würde am ehesten nur mit Snacks vom Einkaufen zurückkommen?" },
    { fr: "Qui est le plus susceptible de répondre aux messages des heures plus tard ?", en: "Who is most likely to reply to messages hours later?", de: "Wer würde am ehesten Stunden später auf Nachrichten antworten?" },
    { fr: "Qui est le plus susceptible de regarder les mêmes vidéos YouTube en boucle ?", en: "Who is most likely to rewatch the same YouTube videos on repeat?", de: "Wer würde am ehesten die gleichen YouTube-Videos in Dauerschleife schauen?" },
    { fr: "Qui est le plus susceptible de faire une to-do list et ne rien cocher ?", en: "Who is most likely to make a to-do list and check nothing off?", de: "Wer würde am ehesten eine To-Do-Liste machen und nichts abhaken?" },
    { fr: "Qui est le plus susceptible de se rappeler de la musique d'un jeu vidéo ?", en: "Who is most likely to remember the music from a video game?", de: "Wer würde am ehesten sich an die Musik eines Videospiels erinnern?" },
    { fr: "Qui est le plus susceptible de se plaindre du froid en été ?", en: "Who is most likely to complain about the cold in summer?", de: "Wer würde am ehesten sich im Sommer über Kälte beschweren?" },
    { fr: "Qui est le plus susceptible de boire 5 cafés par jour ?", en: "Who is most likely to drink 5 coffees a day?", de: "Wer würde am ehesten 5 Kaffee am Tag trinken?" },
    { fr: "Qui est le plus susceptible de ranger sa chambre uniquement quand il attend de la visite ?", en: "Who is most likely to clean their room only when expecting visitors?", de: "Wer würde am ehesten sein Zimmer nur aufräumen, wenn Besuch kommt?" },
    { fr: "Qui est le plus susceptible de se plaindre qu'il n'y a rien à manger alors que le frigo est plein ?", en: "Who is most likely to complain there's nothing to eat when the fridge is full?", de: "Wer würde am ehesten sich beschweren, es gäbe nichts zu essen, obwohl der Kühlschrank voll ist?" },
    { fr: "Qui est le plus susceptible de connaître le nom de chaque chien du quartier ?", en: "Who is most likely to know the name of every dog in the neighborhood?", de: "Wer würde am ehesten den Namen jedes Hundes in der Nachbarschaft kennen?" },
    // Replacements — edgier normal questions
    { fr: "Qui est le plus susceptible de se faire manipuler par la publicité ?", en: "Who is most likely to be manipulated by advertising?", de: "Wer würde am ehesten sich von Werbung manipulieren lassen?" },
    { fr: "Qui est le plus susceptible de croire tout ce qu'il lit sur internet ?", en: "Who is most likely to believe everything they read online?", de: "Wer würde am ehesten alles glauben, was er im Internet liest?" },
    { fr: "Qui est le plus susceptible de devenir accro à son téléphone au point de ne plus pouvoir s'en passer ?", en: "Who is most likely to become so addicted to their phone they can't live without it?", de: "Wer würde am ehesten so handysüchtig werden, dass er nicht mehr ohne kann?" },
    { fr: "Qui est le plus susceptible de se laisser influencer par les réseaux sociaux dans ses choix de vie ?", en: "Who is most likely to let social media influence their life choices?", de: "Wer würde am ehesten sich von sozialen Medien in seinen Lebensentscheidungen beeinflussen lassen?" },
    { fr: "Qui est le plus susceptible de lire les messages de quelqu'un par-dessus son épaule ?", en: "Who is most likely to read someone's messages over their shoulder?", de: "Wer würde am ehesten jemandem über die Schulter schauen und seine Nachrichten lesen?" },
    { fr: "Qui est le plus susceptible de mentir sur ses habitudes alimentaires ?", en: "Who is most likely to lie about their eating habits?", de: "Wer würde am ehesten über seine Essgewohnheiten lügen?" },
    { fr: "Qui est le plus susceptible de dépenser tout son salaire en 3 jours ?", en: "Who is most likely to spend their entire paycheck in 3 days?", de: "Wer würde am ehesten sein ganzes Gehalt in 3 Tagen ausgeben?" },
    { fr: "Qui est le plus susceptible d'avoir une addiction secrète ?", en: "Who is most likely to have a secret addiction?", de: "Wer hätte am ehesten eine geheime Sucht?" },
    { fr: "Qui est le plus susceptible de changer complètement de personnalité selon les gens autour de lui ?", en: "Who is most likely to completely change their personality depending on who's around?", de: "Wer würde am ehesten seine Persönlichkeit komplett ändern, je nachdem wer um ihn herum ist?" },
    { fr: "Qui est le plus susceptible de ne jamais aller voter ?", en: "Who is most likely to never go vote?", de: "Wer würde am ehesten nie wählen gehen?" },
  ],

  problemes: [
    { fr: "Qui est le plus susceptible de flirter avec le crush de quelqu'un d'autre ?", en: "Who is most likely to flirt with someone else's crush?", de: "Wer würde am ehesten mit dem Schwarm eines anderen flirten?" },
    { fr: "Qui est le plus susceptible de balancer des infos privées quand il est bourré ?", en: "Who is most likely to spill private info when drunk?", de: "Wer würde am ehesten private Infos verraten, wenn er betrunken ist?" },
    { fr: "Qui est le plus susceptible de ruiner une surprise ?", en: "Who is most likely to ruin a surprise?", de: "Wer würde am ehesten eine Überraschung verderben?" },
    { fr: "Qui est le plus susceptible de se servir dans le portefeuille de quelqu'un ?", en: "Who is most likely to help themselves to someone's wallet?", de: "Wer würde am ehesten sich aus jemandes Geldbeutel bedienen?" },
    { fr: "Qui est le plus susceptible de faire croire qu'il est expert alors qu'il n'y connaît rien ?", en: "Who is most likely to pretend to be an expert when they know nothing?", de: "Wer würde am ehesten so tun, als wäre er Experte, obwohl er keine Ahnung hat?" },
    { fr: "Qui est le plus susceptible de ne jamais rendre un service en retour ?", en: "Who is most likely to never return a favor?", de: "Wer würde am ehesten nie einen Gefallen erwidern?" },
    { fr: "Qui est le plus susceptible de prendre le dernier morceau sans demander ?", en: "Who is most likely to take the last piece without asking?", de: "Wer würde am ehesten das letzte Stück nehmen, ohne zu fragen?" },
    { fr: "Qui est le plus susceptible de refuser de s'excuser par fierté ?", en: "Who is most likely to refuse to apologize out of pride?", de: "Wer würde am ehesten sich aus Stolz weigern, sich zu entschuldigen?" },
    { fr: "Qui est le plus susceptible de se moquer de la passion de quelqu'un ?", en: "Who is most likely to mock someone's passion?", de: "Wer würde am ehesten sich über die Leidenschaft eines anderen lustig machen?" },
    { fr: "Qui est le plus susceptible de faire un faux compliment ?", en: "Who is most likely to give a fake compliment?", de: "Wer würde am ehesten ein falsches Kompliment machen?" },
    { fr: "Qui est le plus susceptible de changer de camp selon qui est dans la pièce ?", en: "Who is most likely to switch sides depending on who's in the room?", de: "Wer würde am ehesten die Seite wechseln, je nachdem wer im Raum ist?" },
    { fr: "Qui est le plus susceptible de créer un faux profil pour espionner ?", en: "Who is most likely to create a fake profile to spy?", de: "Wer würde am ehesten ein Fake-Profil erstellen, um zu spionieren?" },
    { fr: "Qui est le plus susceptible de dire 'je rigolais' après avoir blessé quelqu'un ?", en: "Who is most likely to say 'I was joking' after hurting someone?", de: "Wer würde am ehesten 'war nur ein Spaß' sagen, nachdem er jemanden verletzt hat?" },
    { fr: "Qui est le plus susceptible de jouer la victime pour avoir de l'attention ?", en: "Who is most likely to play the victim for attention?", de: "Wer würde am ehesten das Opfer spielen, um Aufmerksamkeit zu bekommen?" },
    { fr: "Qui est le plus susceptible de comparer les gens entre eux ?", en: "Who is most likely to compare people to each other?", de: "Wer würde am ehesten Menschen miteinander vergleichen?" },
    { fr: "Qui est le plus susceptible de screenshot une conversation privée ?", en: "Who is most likely to screenshot a private conversation?", de: "Wer würde am ehesten einen Screenshot eines privaten Chats machen?" },
    { fr: "Qui est le plus susceptible de tester la loyauté de ses amis ?", en: "Who is most likely to test their friends' loyalty?", de: "Wer würde am ehesten die Loyalität seiner Freunde testen?" },
    { fr: "Qui est le plus susceptible de se faire des amis juste pour les avantages ?", en: "Who is most likely to make friends just for the benefits?", de: "Wer würde am ehesten Freundschaften nur wegen der Vorteile schließen?" },
    { fr: "Qui est le plus susceptible de nier avoir dit quelque chose même avec preuve ?", en: "Who is most likely to deny saying something even with proof?", de: "Wer würde am ehesten leugnen, etwas gesagt zu haben, selbst mit Beweis?" },
    { fr: "Qui est le plus susceptible de faire passer ses intérêts en premier toujours ?", en: "Who is most likely to always put their interests first?", de: "Wer würde am ehesten immer seine eigenen Interessen zuerst stellen?" },
    { fr: "Qui est le plus susceptible de couper les ponts sans explication ?", en: "Who is most likely to cut ties without explanation?", de: "Wer würde am ehesten ohne Erklärung den Kontakt abbrechen?" },
    { fr: "Qui est le plus susceptible de rire du malheur des autres ?", en: "Who is most likely to laugh at others' misfortune?", de: "Wer würde am ehesten über das Unglück anderer lachen?" },
    { fr: "Qui est le plus susceptible de créer un problème et jouer l'innocent ?", en: "Who is most likely to create a problem and play innocent?", de: "Wer würde am ehesten ein Problem verursachen und den Unschuldigen spielen?" },
    { fr: "Qui est le plus susceptible de trouver une excuse pour tout ?", en: "Who is most likely to find an excuse for everything?", de: "Wer würde am ehesten für alles eine Ausrede finden?" },
    { fr: "Qui est le plus susceptible d'être toxique sans s'en rendre compte ?", en: "Who is most likely to be toxic without realizing it?", de: "Wer würde am ehesten toxisch sein, ohne es zu merken?" },
    { fr: "Qui est le plus susceptible de gaslighter quelqu'un ?", en: "Who is most likely to gaslight someone?", de: "Wer würde am ehesten jemanden gaslighten?" },
    { fr: "Qui est le plus susceptible de dénigrer quelqu'un par jalousie ?", en: "Who is most likely to put someone down out of jealousy?", de: "Wer würde am ehesten jemanden aus Eifersucht herabsetzen?" },
    { fr: "Qui est le plus susceptible de s'inviter chez quelqu'un et de manger tout ?", en: "Who is most likely to invite themselves over and eat everything?", de: "Wer würde am ehesten sich selbst einladen und alles aufessen?" },
    { fr: "Qui est le plus susceptible de provoquer une dispute juste pour l'adrénaline ?", en: "Who is most likely to start a fight just for the adrenaline?", de: "Wer würde am ehesten einen Streit anfangen, nur wegen des Adrenalins?" },
    { fr: "Qui est le plus susceptible de raconter les problèmes des autres au reste du groupe ?", en: "Who is most likely to tell the rest of the group about someone's problems?", de: "Wer würde am ehesten die Probleme anderer dem Rest der Gruppe erzählen?" },
    // Political / difficult / hard-hitting replacements
    { fr: "Qui est le plus susceptible de sacrifier ses principes pour de l'argent ?", en: "Who is most likely to sacrifice their principles for money?", de: "Wer würde am ehesten seine Prinzipien für Geld opfern?" },
    { fr: "Qui est le plus susceptible de devenir un tyran si on lui donnait le pouvoir ?", en: "Who is most likely to become a tyrant if given power?", de: "Wer würde am ehesten zum Tyrannen werden, wenn man ihm Macht gäbe?" },
    { fr: "Qui est le plus susceptible d'utiliser une cause sociale juste pour l'image ?", en: "Who is most likely to use a social cause just for image?", de: "Wer würde am ehesten eine soziale Sache nur fürs Image nutzen?" },
    { fr: "Qui est le plus susceptible de critiquer le système tout en en profitant ?", en: "Who is most likely to criticize the system while benefiting from it?", de: "Wer würde am ehesten das System kritisieren und gleichzeitig davon profitieren?" },
    { fr: "Qui est le plus susceptible de ne pas voter et se plaindre du résultat ?", en: "Who is most likely to not vote and then complain about the result?", de: "Wer würde am ehesten nicht wählen gehen und sich dann über das Ergebnis beschweren?" },
    { fr: "Qui est le plus susceptible de propager de la désinformation sans le savoir ?", en: "Who is most likely to spread misinformation without knowing it?", de: "Wer würde am ehesten Desinformation verbreiten, ohne es zu wissen?" },
    { fr: "Qui est le plus susceptible de trahir ses valeurs sous pression ?", en: "Who is most likely to betray their values under pressure?", de: "Wer würde am ehesten unter Druck seine Werte verraten?" },
    { fr: "Qui est le plus susceptible de cacher quelque chose de grave à tout le monde ?", en: "Who is most likely to hide something serious from everyone?", de: "Wer würde am ehesten etwas Schwerwiegendes vor allen verheimlichen?" },
    { fr: "Qui est le plus susceptible de se radicaliser à cause d'internet ?", en: "Who is most likely to get radicalized because of the internet?", de: "Wer würde am ehesten sich durch das Internet radikalisieren?" },
    { fr: "Qui est le plus susceptible de faire semblant d'être engagé pour une cause juste pour plaire ?", en: "Who is most likely to pretend to care about a cause just to fit in?", de: "Wer würde am ehesten so tun, als würde ihn eine Sache interessieren, nur um dazuzugehören?" },
    { fr: "Qui est le plus susceptible de devenir influenceur politique sans rien y connaître ?", en: "Who is most likely to become a political influencer knowing nothing about politics?", de: "Wer würde am ehesten politischer Influencer werden, ohne Ahnung von Politik zu haben?" },
    { fr: "Qui est le plus susceptible de couper les ponts avec un ami pour des raisons politiques ?", en: "Who is most likely to end a friendship over politics?", de: "Wer würde am ehesten eine Freundschaft wegen politischer Meinungen beenden?" },
    { fr: "Qui est le plus susceptible de changer de convictions pour plaire à quelqu'un ?", en: "Who is most likely to change their beliefs to please someone?", de: "Wer würde am ehesten seine Überzeugungen ändern, um jemandem zu gefallen?" },
    { fr: "Qui est le plus susceptible de défendre quelque chose qu'il sait être faux ?", en: "Who is most likely to defend something they know is wrong?", de: "Wer würde am ehesten etwas verteidigen, von dem er weiß, dass es falsch ist?" },
    { fr: "Qui est le plus susceptible de nier le réchauffement climatique ?", en: "Who is most likely to deny climate change?", de: "Wer würde am ehesten den Klimawandel leugnen?" },
    { fr: "Qui est le plus susceptible de prendre une décision qui affecte tout le monde sans consulter personne ?", en: "Who is most likely to make a decision affecting everyone without consulting anyone?", de: "Wer würde am ehesten eine Entscheidung treffen, die alle betrifft, ohne jemanden zu fragen?" },
    { fr: "Qui est le plus susceptible d'enregistrer une conversation en cachette ?", en: "Who is most likely to secretly record a conversation?", de: "Wer würde am ehesten heimlich ein Gespräch aufnehmen?" },
    { fr: "Qui est le plus susceptible de profiter de la situation quand quelqu'un est vulnérable ?", en: "Who is most likely to take advantage when someone is vulnerable?", de: "Wer würde am ehesten die Situation ausnutzen, wenn jemand verletzlich ist?" },
    { fr: "Qui est le plus susceptible de faire une blague méchante et dire 'c'est de l'humour' ?", en: "Who is most likely to make a mean joke and say 'it's just humor'?", de: "Wer würde am ehesten einen gemeinen Witz machen und sagen 'ist nur Humor'?" },
    { fr: "Qui est le plus susceptible de ne venir qu'aux soirées où il y a un intérêt personnel ?", en: "Who is most likely to only attend events when there's something in it for them?", de: "Wer würde am ehesten nur zu Veranstaltungen kommen, wenn es einen persönlichen Vorteil gibt?" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fetchCategories() {
  const snap = await getDocs(collection(db, 'CATEGORIES'));
  const cats = [];
  snap.forEach((d) => cats.push({ id: d.id, ...d.data() }));
  return cats;
}

function matchCategory(cats, key) {
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

async function main() {
  console.log('Fetching categories from Firestore...');
  const cats = await fetchCategories();
  console.log(`Found ${cats.length} categories`);

  const catIdMap = {};
  const missing = [];
  for (const key of Object.keys(QUESTIONS)) {
    const match = matchCategory(cats, key);
    if (match) { catIdMap[key] = match.id; console.log(`  ${key} → ${match.id}`); }
    else { missing.push(key); console.warn(`  ${key} → NOT FOUND`); }
  }
  if (missing.length > 0) { console.error(`Missing categories: ${missing.join(', ')}`); process.exit(1); }

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
  for (const key of Object.keys(QUESTIONS)) {
    console.log(`  ${key}: ${QUESTIONS[key].length}`);
  }

  if (dryRun) {
    console.log('\n--- DRY RUN — no writes ---');
    process.exit(0);
  }

  const BATCH_SIZE = 400;
  let written = 0;
  for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
    const chunk = allQuestions.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const q of chunk) {
      const ref = doc(collection(db, 'QUESTIONS'));
      batch.set(ref, { ...q, isDeleted: false, deletedAt: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    console.log(`Writing batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} questions)...`);
    await batch.commit();
    written += chunk.length;
    console.log(`  Done. ${written}/${allQuestions.length}`);
  }

  console.log(`\nAll ${written} questions inserted!`);
  process.exit(0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
