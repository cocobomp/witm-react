import { createClaudeHandler } from '../../server/claude-handler.js';
import { createFirebaseIdTokenVerifier } from '../../server/firebase-id-token.js';
import { TEST_ADMIN_EMAIL, TEST_PROJECT_ID } from './firebase-tokens.js';
import { createFakeFetch } from './mock-http.js';

export const TEST_API_KEY = 'test-groq-key';
export const ALLOWED_ORIGIN = 'https://whoisthemost.com';
export const GROQ_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GENERATED_QUESTIONS = [{ fr: 'Qui est le plus drôle ?', en: 'Who is the funniest?', de: 'Wer ist am lustigsten?' }];
const TRANSLATIONS = { en: 'Who is the funniest?', fr: 'Qui est le plus drôle ?', de: 'Wer ist am lustigsten?' };

/** An OpenAI-compatible chat completion whose first choice carries `content`. */
export function groqCompletion(content) {
  return { choices: [{ message: { role: 'assistant', content } }] };
}

export const GENERATION_FIXTURE = groqCompletion(JSON.stringify(GENERATED_QUESTIONS));
export const TRANSLATION_FIXTURE = groqCompletion(JSON.stringify(TRANSLATIONS));

/**
 * Wires the production handler with a local key set and a fake upstream, so
 * the whole auth → validation → upstream path runs without any network.
 */
export function buildTestHandler({ keySet, fetchFn, env, verifyIdToken } = {}) {
  const upstream = fetchFn ?? createFakeFetch({ json: GENERATION_FIXTURE });
  const handler = createClaudeHandler({
    verifyIdToken: verifyIdToken ?? createFirebaseIdTokenVerifier({ projectId: TEST_PROJECT_ID, keySet }),
    fetchFn: upstream,
    env: { GROQ_API_KEY: TEST_API_KEY, ADMIN_EMAILS: TEST_ADMIN_EMAIL, ...env },
  });
  return { handler, upstream };
}

export function bearer(token) {
  return { Authorization: `Bearer ${token}`, Origin: ALLOWED_ORIGIN };
}

export function assertErrorShape(assert, res, expectedStatus, expectedCode) {
  assert.equal(res.statusCode, expectedStatus);
  assert.equal(res.body?.error?.code, expectedCode);
  assert.equal(typeof res.body?.error?.message, 'string');
}
