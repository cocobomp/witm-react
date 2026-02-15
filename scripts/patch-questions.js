/**
 * Patch script — deletes 21 weak/duplicate questions from batch 2
 * and inserts 21 stronger replacements.
 *
 * Usage:
 *   node scripts/patch-questions.js              # apply
 *   node scripts/patch-questions.js --dry-run     # preview only
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

// ─── Questions to DELETE (weak / duplicates) ─────────────────────────────────

const TO_DELETE = [
  // WTF — too bland, belong in "normal"
  "Qui est le plus susceptible d'oublier pourquoi il est entré dans une pièce ?",
  "Qui est le plus susceptible de trébucher sur ses propres pieds ?",
  "Qui est le plus susceptible de porter un vêtement à l'envers toute la journée ?",
  "Qui est le plus susceptible de rire à son propre blague ?",
  "Qui est le plus susceptible de rêver éveillé en pleine conversation ?",

  // Friends — too mild
  "Qui est le plus susceptible de donner les meilleurs conseils ?",
  "Qui est le plus susceptible de se porter volontaire pour tout ?",
  "Qui est le plus susceptible de préparer le meilleur cadeau ?",
  "Qui est le plus susceptible de devenir le parrain ou la marraine de l'enfant d'un ami ?",
  // Friends — duplicates with problemes
  "Qui est le plus susceptible de comparer ses amis entre eux ?",
  "Qui est le plus susceptible de couper les ponts du jour au lendemain ?",
  "Qui est le plus susceptible de devenir toxique dans une amitié sans s'en rendre compte ?",

  // Family — too mild
  "Qui est le plus susceptible de devenir fan de la recette secrète de grand-mère ?",
  "Qui est le plus susceptible d'envoyer des photos de famille dans le groupe WhatsApp ?",
  "Qui est le plus susceptible de pleurer en regardant les vidéos de son enfance ?",
  "Qui est le plus susceptible de toujours vouloir jouer à des jeux de société ?",

  // Normal — duplicates
  "Qui est le plus susceptible de ne jamais aller voter ?",
  "Qui est le plus susceptible de croire tout ce qu'il lit sur internet ?",
  // Normal — too mild
  "Qui est le plus susceptible de toujours avoir une batterie externe ?",
  "Qui est le plus susceptible de connaître le nom de chaque chien du quartier ?",

  // Hot — too mild for the category
  "Qui est le plus susceptible de faire une folie pour un anniversaire de couple ?",
];

// ─── Replacement questions ───────────────────────────────────────────────────

const REPLACEMENTS = {
  wtf: [
    { fr: "Qui est le plus susceptible de se faire virer d'un parc d'attractions ?", en: "Who is most likely to get kicked out of an amusement park?", de: "Wer würde am ehesten aus einem Freizeitpark geworfen werden?" },
    { fr: "Qui est le plus susceptible de faire la une des journaux pour une raison ridicule ?", en: "Who is most likely to make the news for a ridiculous reason?", de: "Wer würde am ehesten wegen einer lächerlichen Sache in die Nachrichten kommen?" },
    { fr: "Qui est le plus susceptible de se faire bannir d'un groupe WhatsApp ?", en: "Who is most likely to get banned from a WhatsApp group?", de: "Wer würde am ehesten aus einer WhatsApp-Gruppe gebannt werden?" },
    { fr: "Qui est le plus susceptible d'appeler la police pour une raison complètement absurde ?", en: "Who is most likely to call the police for a completely absurd reason?", de: "Wer würde am ehesten die Polizei aus einem völlig absurden Grund rufen?" },
    { fr: "Qui est le plus susceptible de déclencher une alarme incendie par accident ?", en: "Who is most likely to accidentally set off a fire alarm?", de: "Wer würde am ehesten versehentlich einen Feueralarm auslösen?" },
  ],

  friends: [
    { fr: "Qui est le plus susceptible de changer de meilleur ami chaque année ?", en: "Who is most likely to change best friends every year?", de: "Wer würde am ehesten jedes Jahr den besten Freund wechseln?" },
    { fr: "Qui est le plus susceptible de rendre jaloux ses amis sans le vouloir ?", en: "Who is most likely to unintentionally make their friends jealous?", de: "Wer würde am ehesten seine Freunde unbeabsichtigt eifersüchtig machen?" },
    { fr: "Qui est le plus susceptible de mentir à ses amis pour éviter une sortie ?", en: "Who is most likely to lie to friends to avoid going out?", de: "Wer würde am ehesten seine Freunde anlügen, um nicht ausgehen zu müssen?" },
    { fr: "Qui est le plus susceptible de créer un conflit entre deux amis sans le vouloir ?", en: "Who is most likely to accidentally create a conflict between two friends?", de: "Wer würde am ehesten versehentlich einen Konflikt zwischen zwei Freunden verursachen?" },
    { fr: "Qui est le plus susceptible de faire un classement de ses amis du préféré au moins préféré ?", en: "Who is most likely to rank their friends from favorite to least favorite?", de: "Wer würde am ehesten seine Freunde vom Lieblings- zum am wenigsten Lieblingsfreund ordnen?" },
    { fr: "Qui est le plus susceptible de voler l'idée d'un ami et la présenter comme la sienne ?", en: "Who is most likely to steal a friend's idea and present it as their own?", de: "Wer würde am ehesten die Idee eines Freundes klauen und als seine eigene präsentieren?" },
    { fr: "Qui est le plus susceptible de ruiner une amitié pour un malentendu ridicule ?", en: "Who is most likely to ruin a friendship over a ridiculous misunderstanding?", de: "Wer würde am ehesten eine Freundschaft wegen eines lächerlichen Missverständnisses ruinieren?" },
  ],

  family: [
    { fr: "Qui est le plus susceptible de provoquer un malaise à table en disant une vérité que personne ne veut entendre ?", en: "Who is most likely to make everyone uncomfortable at dinner by saying a truth no one wants to hear?", de: "Wer würde am ehesten beim Essen für Unbehagen sorgen, indem er eine Wahrheit ausspricht, die niemand hören will?" },
    { fr: "Qui est le plus susceptible d'avoir honte de sa famille en public ?", en: "Who is most likely to be embarrassed by their family in public?", de: "Wer würde am ehesten sich in der Öffentlichkeit für seine Familie schämen?" },
    { fr: "Qui est le plus susceptible de répéter exactement les erreurs de ses parents ?", en: "Who is most likely to repeat their parents' exact mistakes?", de: "Wer würde am ehesten genau die Fehler seiner Eltern wiederholen?" },
    { fr: "Qui est le plus susceptible de devenir le mouton noir de la famille ?", en: "Who is most likely to become the black sheep of the family?", de: "Wer würde am ehesten das schwarze Schaf der Familie werden?" },
  ],

  normal: [
    { fr: "Qui est le plus susceptible de supprimer ses réseaux sociaux et de les recréer le lendemain ?", en: "Who is most likely to delete their social media and recreate it the next day?", de: "Wer würde am ehesten seine sozialen Medien löschen und sie am nächsten Tag neu erstellen?" },
    { fr: "Qui est le plus susceptible de parler plus à ChatGPT qu'à ses vrais amis ?", en: "Who is most likely to talk to ChatGPT more than their actual friends?", de: "Wer würde am ehesten mehr mit ChatGPT reden als mit seinen echten Freunden?" },
    { fr: "Qui est le plus susceptible de dépenser une fortune en abonnements qu'il n'utilise jamais ?", en: "Who is most likely to spend a fortune on subscriptions they never use?", de: "Wer würde am ehesten ein Vermögen für Abonnements ausgeben, die er nie nutzt?" },
    { fr: "Qui est le plus susceptible de stalker quelqu'un pendant 2 heures et liker une photo de 2019 par accident ?", en: "Who is most likely to stalk someone for 2 hours and accidentally like a photo from 2019?", de: "Wer würde am ehesten jemanden 2 Stunden stalken und versehentlich ein Foto von 2019 liken?" },
  ],

  hot: [
    { fr: "Qui est le plus susceptible de faire semblant d'être célibataire en soirée ?", en: "Who is most likely to pretend to be single at a party?", de: "Wer würde am ehesten auf einer Party so tun, als wäre er Single?" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // ── Phase 1: Delete weak/duplicate questions ──
  console.log(`\n=== PHASE 1: Delete ${TO_DELETE.length} weak/duplicate questions ===\n`);

  const snap = await getDocs(collection(db, 'QUESTIONS'));
  const toDeleteSet = new Set(TO_DELETE);
  const matched = [];

  snap.forEach((d) => {
    const data = d.data();
    if (data.question && toDeleteSet.has(data.question) && !data.isDeleted) {
      matched.push({ id: d.id, question: data.question });
    }
  });

  console.log(`Found ${matched.length}/${TO_DELETE.length} matching questions.`);
  for (const m of matched) {
    console.log(`  - [${m.id}] ${m.question.substring(0, 70)}...`);
  }

  if (dryRun) {
    console.log('\n--- DRY RUN — no changes ---');
  } else if (matched.length > 0) {
    const batch = writeBatch(db);
    for (const m of matched) {
      batch.update(doc(db, 'QUESTIONS', m.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    console.log(`Soft-deleted ${matched.length} questions.`);
  }

  // ── Phase 2: Insert replacements ──
  console.log(`\n=== PHASE 2: Insert replacement questions ===\n`);

  const cats = await fetchCategories();
  const catIdMap = {};
  for (const key of Object.keys(REPLACEMENTS)) {
    const match = matchCategory(cats, key);
    if (match) {
      catIdMap[key] = match.id;
      console.log(`  ${key} → ${match.id}`);
    } else {
      console.error(`  ${key} → NOT FOUND`);
      process.exit(1);
    }
  }

  const allReplacements = [];
  for (const [key, questions] of Object.entries(REPLACEMENTS)) {
    for (const q of questions) {
      allReplacements.push({
        question: q.fr,
        translations: { en: q.en, fr: q.fr, de: q.de },
        catId: catIdMap[key],
        likes: 0,
        dislikes: 0,
      });
    }
  }

  console.log(`\nTotal replacements to insert: ${allReplacements.length}`);
  for (const key of Object.keys(REPLACEMENTS)) {
    console.log(`  ${key}: ${REPLACEMENTS[key].length}`);
  }

  if (dryRun) {
    console.log('\n--- DRY RUN — no inserts ---');
    process.exit(0);
  }

  const insertBatch = writeBatch(db);
  for (const q of allReplacements) {
    const ref = doc(collection(db, 'QUESTIONS'));
    insertBatch.set(ref, {
      ...q,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await insertBatch.commit();
  console.log(`Inserted ${allReplacements.length} replacement questions.`);

  console.log(`\n=== Done! Deleted ${matched.length}, inserted ${allReplacements.length} ===`);
  process.exit(0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
