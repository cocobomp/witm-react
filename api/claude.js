/**
 * Vercel Serverless Function for AI question generation (Groq, Llama 3.3 70B):
 * question generation, simulated batches and translation for the web admin.
 *
 * Every action except `health` requires `Authorization: Bearer <Firebase ID
 * token>` from a verified admin email; see server/claude-handler.js.
 * Environment: GROQ_API_KEY (required), ADMIN_EMAILS (optional,
 * comma-separated; defaults to src/constants/adminEmails.js).
 */
import { createClaudeHandler } from '../server/claude-handler.js';
import { createFirebaseIdTokenVerifier } from '../server/firebase-id-token.js';

export default createClaudeHandler({
  verifyIdToken: createFirebaseIdTokenVerifier(),
  fetchFn: (url, init) => fetch(url, init),
  env: process.env,
});
