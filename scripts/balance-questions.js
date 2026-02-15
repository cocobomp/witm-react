/**
 * Balance script — trims every category to exactly 120 questions.
 *   • Deletes 10 weakest Problemes questions
 *   • Deletes 2 orphan "unknown" questions (no valid catId)
 *   • Inserts 19 new spicy questions across underfilled categories
 *
 * Usage:
 *   node scripts/balance-questions.js              # apply
 *   node scripts/balance-questions.js --dry-run     # preview only
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

// ─── 10 weak Problemes to DELETE (too mild for the category) ─────────────────

const PROBLEMES_TO_DELETE = [
  "Qui est le plus susceptible de piquer la nourriture dans l'assiette des autres ?",
  "Qui est le plus susceptible de rouler tout le monde au Monopoly ?",
  "Qui est le plus susceptible de prendre la plus grosse part du gâteau ?",
  "Qui est le plus susceptible de couper la parole en permanence ?",
  "Qui est le plus susceptible de se plaindre pour absolument tout ?",
  "Qui est le plus susceptible d'être le pire conducteur ?",
  "Qui est le plus susceptible de ruiner une surprise ?",
  "Qui est le plus susceptible de prendre le dernier morceau sans demander ?",
  "Qui est le plus susceptible de s'inviter chez quelqu'un et de manger tout ?",
  "Qui est le plus susceptible de trouver une excuse pour tout ?",
];

// ─── 19 new spicy questions ──────────────────────────────────────────────────

const NEW_QUESTIONS = {
  wtf: [
    { fr: "Qui est le plus susceptible de finir nu en public à cause d'un pari ?", en: "Who is most likely to end up naked in public because of a bet?", de: "Wer würde am ehesten wegen einer Wette nackt in der Öffentlichkeit landen?" },
    { fr: "Qui est le plus susceptible de se faire interdire l'entrée d'un pays étranger ?", en: "Who is most likely to get banned from a foreign country?", de: "Wer würde am ehesten Einreiseverbot in ein fremdes Land bekommen?" },
    { fr: "Qui est le plus susceptible d'être repéré par les caméras de surveillance en train de faire un truc suspect ?", en: "Who is most likely to get caught on security cameras doing something suspicious?", de: "Wer würde am ehesten von Überwachungskameras bei etwas Verdächtigem erwischt werden?" },
  ],

  friends: [
    { fr: "Qui est le plus susceptible de lire le journal intime d'un ami si personne ne regarde ?", en: "Who is most likely to read a friend's diary if no one is watching?", de: "Wer würde am ehesten das Tagebuch eines Freundes lesen, wenn niemand hinschaut?" },
  ],

  family: [
    { fr: "Qui est le plus susceptible de ramener le pire partenaire possible au dîner de famille ?", en: "Who is most likely to bring the worst possible partner to family dinner?", de: "Wer würde am ehesten den schlimmstmöglichen Partner zum Familienessen mitbringen?" },
  ],

  normal: [
    { fr: "Qui est le plus susceptible de mentir sur le fait d'avoir vu un film ou lu un livre ?", en: "Who is most likely to lie about having watched a movie or read a book?", de: "Wer würde am ehesten lügen, einen Film gesehen oder ein Buch gelesen zu haben?" },
    { fr: "Qui est le plus susceptible de se filmer dans le miroir et de l'envoyer à la mauvaise personne ?", en: "Who is most likely to film themselves in the mirror and send it to the wrong person?", de: "Wer würde am ehesten sich im Spiegel filmen und es an die falsche Person senden?" },
    { fr: "Qui est le plus susceptible de créer un faux compte pour stalker quelqu'un ?", en: "Who is most likely to create a fake account to stalk someone?", de: "Wer würde am ehesten ein Fake-Konto erstellen, um jemanden zu stalken?" },
    { fr: "Qui est le plus susceptible de promettre de se lever tôt pour le sport et de ne jamais le faire ?", en: "Who is most likely to promise to wake up early for exercise and never do it?", de: "Wer würde am ehesten versprechen, früh aufzustehen um Sport zu machen, und es nie tun?" },
  ],

  job: [
    { fr: "Qui est le plus susceptible de draguer pendant un entretien d'embauche ?", en: "Who is most likely to flirt during a job interview?", de: "Wer würde am ehesten während eines Vorstellungsgesprächs flirten?" },
    { fr: "Qui est le plus susceptible d'inventer une maladie pour avoir un jour de congé ?", en: "Who is most likely to fake an illness to get a day off?", de: "Wer würde am ehesten eine Krankheit vortäuschen, um einen freien Tag zu bekommen?" },
    { fr: "Qui est le plus susceptible de balancer son patron sur les réseaux sociaux ?", en: "Who is most likely to expose their boss on social media?", de: "Wer würde am ehesten seinen Chef in sozialen Medien bloßstellen?" },
    { fr: "Qui est le plus susceptible de se faire chopper en train de chercher un autre job au bureau ?", en: "Who is most likely to get caught job hunting at work?", de: "Wer würde am ehesten bei der Arbeit dabei erwischt werden, nach einem neuen Job zu suchen?" },
    { fr: "Qui est le plus susceptible d'accepter un pot-de-vin ?", en: "Who is most likely to accept a bribe?", de: "Wer würde am ehesten Bestechungsgeld annehmen?" },
  ],

  hot: [
    { fr: "Qui est le plus susceptible d'embrasser un inconnu en soirée ?", en: "Who is most likely to kiss a stranger at a party?", de: "Wer würde am ehesten auf einer Party einen Fremden küssen?" },
    { fr: "Qui est le plus susceptible d'envoyer un nude à la mauvaise personne ?", en: "Who is most likely to accidentally send a nude to the wrong person?", de: "Wer würde am ehesten versehentlich ein Nacktfoto an die falsche Person senden?" },
    { fr: "Qui est le plus susceptible de coucher avec quelqu'un dès le premier soir ?", en: "Who is most likely to sleep with someone on the first date?", de: "Wer würde am ehesten beim ersten Date mit jemandem schlafen?" },
    { fr: "Qui est le plus susceptible d'avoir une aventure avec le ou la meilleure ami(e) de son ex ?", en: "Who is most likely to hook up with their ex's best friend?", de: "Wer würde am ehesten etwas mit dem besten Freund des Ex anfangen?" },
    { fr: "Qui est le plus susceptible de se faire surprendre en train d'envoyer des messages coquins ?", en: "Who is most likely to get caught sending flirty texts?", de: "Wer würde am ehesten beim Versenden von Flirt-Nachrichten erwischt werden?" },
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
  const cats = await fetchCategories();
  const validCatIds = new Set(cats.map((c) => c.id));

  // ── Phase 1: Find and delete weak Problemes + orphans ──
  console.log('=== PHASE 1: Delete weak Problemes + orphan questions ===\n');

  const snap = await getDocs(collection(db, 'QUESTIONS'));
  const problemesSet = new Set(PROBLEMES_TO_DELETE);
  const toDelete = [];

  snap.forEach((d) => {
    const data = d.data();
    if (data.isDeleted) return;

    // Weak problemes
    if (data.question && problemesSet.has(data.question)) {
      toDelete.push({ id: d.id, question: data.question, reason: 'weak problemes' });
      return;
    }

    // Orphan (no valid catId)
    if (!data.catId || !validCatIds.has(data.catId)) {
      toDelete.push({ id: d.id, question: data.question || '(no question)', reason: 'orphan' });
    }
  });

  console.log(`Found ${toDelete.length} questions to delete:`);
  for (const d of toDelete) {
    console.log(`  [${d.reason}] ${d.id} — ${(d.question || '').substring(0, 60)}...`);
  }

  if (!dryRun && toDelete.length > 0) {
    const batch = writeBatch(db);
    for (const d of toDelete) {
      batch.update(doc(db, 'QUESTIONS', d.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    console.log(`\nSoft-deleted ${toDelete.length} questions.`);
  }

  // ── Phase 2: Insert new questions ──
  console.log('\n=== PHASE 2: Insert 19 new spicy questions ===\n');

  const catIdMap = {};
  for (const key of Object.keys(NEW_QUESTIONS)) {
    const match = matchCategory(cats, key);
    if (match) {
      catIdMap[key] = match.id;
      console.log(`  ${key} → ${match.id}`);
    } else {
      console.error(`  ${key} → NOT FOUND`);
      process.exit(1);
    }
  }

  const allNew = [];
  for (const [key, questions] of Object.entries(NEW_QUESTIONS)) {
    for (const q of questions) {
      allNew.push({
        question: q.fr,
        translations: { en: q.en, fr: q.fr, de: q.de },
        catId: catIdMap[key],
        likes: 0,
        dislikes: 0,
      });
    }
  }

  let totalNew = 0;
  for (const key of Object.keys(NEW_QUESTIONS)) {
    console.log(`  ${key}: +${NEW_QUESTIONS[key].length}`);
    totalNew += NEW_QUESTIONS[key].length;
  }
  console.log(`  Total: +${totalNew}`);

  if (dryRun) {
    console.log('\n--- DRY RUN — no changes applied ---');
    process.exit(0);
  }

  const insertBatch = writeBatch(db);
  for (const q of allNew) {
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
  console.log(`\nInserted ${allNew.length} new questions.`);

  console.log(`\n=== Done! Deleted ${toDelete.length}, inserted ${allNew.length} ===`);
  console.log('Target: 120 questions per category (840 total)');
  process.exit(0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
