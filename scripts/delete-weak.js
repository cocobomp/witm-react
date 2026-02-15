/**
 * Deletes weak/duplicate questions from Firebase (batch 1).
 * Matches by exact French question text and soft-deletes them.
 *
 * Usage:
 *   node scripts/delete-weak.js              # delete
 *   node scripts/delete-weak.js --dry-run    # preview only
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

// Questions to delete from batch 1 (weak, duplicated, or too mild)
const TO_DELETE = [
  // wtf — too universal / redundant
  "Qui est le plus susceptible de chanter sous la douche à tue-tête ?",
  "Qui est le plus susceptible de se perdre dans un centre commercial ?",
  "Qui est le plus susceptible de parler à son téléphone comme si c'était une personne ?",

  // friends — weaker duplicate
  "Qui est le plus susceptible de toujours arriver en retard au rendez-vous ?",

  // family — duplicate
  "Qui est le plus susceptible de toujours demander 'on mange quoi ce soir ?' ?",

  // job — duplicates with batch 2 better versions
  "Qui est le plus susceptible de dormir au bureau ?",
  "Qui est le plus susceptible de créer sa propre entreprise ?",
  "Qui est le plus susceptible de devenir le boss un jour ?",
  "Qui est le plus susceptible de travailler pendant les vacances ?",
  "Qui est le plus susceptible de négocier le meilleur salaire ?",

  // hot — duplicates
  "Qui est le plus susceptible de tomber amoureux au premier regard ?",
  "Qui est le plus susceptible d'avoir un rencard catastrophique ?",
  "Qui est le plus susceptible d'écrire des lettres d'amour ?",
  "Qui est le plus susceptible de faire une demande en mariage complètement folle ?",
  "Qui est le plus susceptible de se faire surprendre en train de stalker le profil de son crush ?",

  // normal — duplicates
  "Qui est le plus susceptible de connaître toutes les paroles d'une chanson ?",
  "Qui est le plus susceptible de commander le même plat au restaurant à chaque fois ?",
  "Qui est le plus susceptible de rater son réveil ?",
  "Qui est le plus susceptible de se souvenir de détails que personne ne retient ?",

  // problemes — duplicates, too mild, political risk
  "Qui est le plus susceptible de voter pour le pire candidat ?",
  "Qui est le plus susceptible de ne jamais rembourser une dette ?",
  "Qui est le plus susceptible de faire un scandale en public ?",
  "Qui est le plus susceptible de faire un caprice au restaurant ?",
  "Qui est le plus susceptible de lire les messages privés de quelqu'un d'autre ?",
  "Qui est le plus susceptible de critiquer quelqu'un et faire la même chose après ?",
  "Qui est le plus susceptible d'exagérer une histoire pour impressionner ?",
  "Qui est le plus susceptible de parler dans le dos des autres ?",
  "Qui est le plus susceptible de faire payer les autres pour lui ?",
];

async function main() {
  console.log(`Looking for ${TO_DELETE.length} questions to delete...`);

  const snap = await getDocs(collection(db, 'QUESTIONS'));
  const toDeleteSet = new Set(TO_DELETE);
  const matched = [];

  snap.forEach((d) => {
    const data = d.data();
    if (data.question && toDeleteSet.has(data.question) && !data.isDeleted) {
      matched.push({ id: d.id, question: data.question });
    }
  });

  console.log(`Found ${matched.length}/${TO_DELETE.length} matching questions in Firestore.`);

  if (matched.length === 0) {
    console.log('Nothing to delete.');
    process.exit(0);
  }

  for (const m of matched) {
    console.log(`  - [${m.id}] ${m.question.substring(0, 60)}...`);
  }

  if (dryRun) {
    console.log('\n--- DRY RUN — no deletes ---');
    process.exit(0);
  }

  // Soft-delete in batches
  const BATCH_SIZE = 400;
  let deleted = 0;
  for (let i = 0; i < matched.length; i += BATCH_SIZE) {
    const chunk = matched.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const m of chunk) {
      batch.update(doc(db, 'QUESTIONS', m.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    deleted += chunk.length;
    console.log(`Deleted ${deleted}/${matched.length}`);
  }

  console.log(`\nDone! Soft-deleted ${deleted} questions.`);
  process.exit(0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
