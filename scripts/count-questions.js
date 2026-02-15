import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
const env = {};
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const [key, ...v] = t.split('=');
  env[key.trim()] = v.join('=').trim();
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const cats = {};
const catSnap = await getDocs(collection(db, 'CATEGORIES'));
catSnap.forEach(d => { cats[d.id] = d.data().title || d.data().name || d.id; });

const counts = {};
let total = 0;
const qSnap = await getDocs(collection(db, 'QUESTIONS'));
qSnap.forEach(d => {
  const data = d.data();
  if (data.isDeleted) return;
  const catName = cats[data.catId] || data.catId || 'unknown';
  counts[catName] = (counts[catName] || 0) + 1;
  total++;
});

for (const [cat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + cat.padEnd(15) + count);
}
console.log('  ─────────────────');
console.log('  ' + 'TOTAL'.padEnd(15) + total);
process.exit(0);
