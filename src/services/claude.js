/**
 * AI API client service
 * Communicates with Vercel serverless function to access Groq API.
 * Every call except the health check carries the signed-in admin's Firebase
 * ID token; the function rejects anything else (401/403).
 */
import { auth } from '../firebase';

const API_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/claude`
  : '/api/claude';

const NOT_SIGNED_IN_MESSAGE = 'You must be signed in with an admin account to use the AI tools.';

async function buildAuthHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error(NOT_SIGNED_IN_MESSAGE);
  }
  // getIdToken() returns the cached token and refreshes it when it is about to expire.
  const idToken = await user.getIdToken();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` };
}

async function readErrorMessage(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}));
  if (typeof body.error === 'string') {
    return body.error;
  }
  return body.error?.message || body.message || fallbackMessage;
}

async function postAuthenticated(payload, failureMessage) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: await buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `${failureMessage}: ${response.status}`));
  }

  return response.json();
}

/**
 * Generate new questions using AI (synchronous fallback)
 * @param {Object} options - Generation options
 * @param {string} options.category - Category name for context
 * @param {number} options.count - Number of questions to generate
 * @param {string} options.language - Primary language (fr, en, de)
 * @returns {Promise<Array>} Array of generated questions with translations
 */
export async function generateQuestions({ category, count = 5, language = 'fr' }) {
  const data = await postAuthenticated(
    { action: 'generate', category, count, language },
    'Failed to generate questions',
  );
  return data.questions || [];
}

/**
 * Create a batch generation request
 * @param {Object} options - { category, count, language }
 * @returns {Promise<Object>} Batch metadata with batchId
 */
export async function createBatch({ category, count = 5, language = 'fr' }) {
  return postAuthenticated({ action: 'batch-create', category, count, language }, 'Failed to create batch');
}

/**
 * Check batch processing status
 * @param {string} batchId
 * @returns {Promise<Object>} Batch status info
 */
export async function checkBatchStatus(batchId) {
  return postAuthenticated({ action: 'batch-status', batchId }, 'Failed to check batch status');
}

/**
 * Retrieve batch results (parsed questions)
 * @param {string} batchId
 * @returns {Promise<Object>} { questions: [...] }
 */
export async function fetchBatchResults(batchId) {
  return postAuthenticated({ action: 'batch-results', batchId }, 'Failed to fetch batch results');
}

/**
 * Translate a question to all supported languages using AI
 * @param {string} text - The text to translate
 * @param {string} sourceLanguage - Source language code (optional)
 * @returns {Promise<Object>} Object with translations { en, fr, de }
 */
export async function translateQuestion(text, sourceLanguage = null) {
  return postAuthenticated(
    { action: 'translate', text, sourceLanguage, targetLanguages: ['en', 'fr', 'de'] },
    'Failed to translate',
  );
}

/**
 * Check if the AI API is available (public, no token needed)
 * @returns {Promise<boolean>} True if API is available
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'health',
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
