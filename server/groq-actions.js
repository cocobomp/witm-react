import { HttpError } from './http-error.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GENERATION_MAX_TOKENS = 2000;
const GENERATION_TEMPERATURE = 0.8;
const TRANSLATION_MAX_TOKENS = 500;
const TRANSLATION_TEMPERATURE = 0.3;
const BATCH_ID_PREFIX = 'groq_batch_';
const UPSTREAM_ERROR_STATUS = 502;

const GENERATION_SYSTEM_PROMPT = 'You are a creative assistant for a party game. Always respond with valid JSON only.';
const TRANSLATION_SYSTEM_PROMPT = 'You are a translator. Always respond with valid JSON only.';

function buildGenerationPrompt(category, count) {
  return `Tu es un assistant créatif pour le jeu WITM ("Who Is The Most" / "Qui est le plus").
Ce jeu est un jeu de soirée où les joueurs votent pour la personne qui correspond le mieux à une question du type "Qui est le plus susceptible de...".

Génère ${count} questions originales, amusantes et engageantes pour la catégorie "${category}".

IMPORTANT:
- Les questions doivent commencer par "Qui est le plus" ou "Qui serait le plus" en français
- Elles doivent être appropriées pour un jeu entre amis (18+) mais pas vulgaires
- Elles doivent être amusantes et provoquer des discussions
- Fournis les traductions en anglais et allemand

Retourne UNIQUEMENT un tableau JSON valide avec ce format exact (pas de texte avant ou après):
[
  {
    "fr": "Qui est le plus susceptible de...",
    "en": "Who is most likely to...",
    "de": "Wer wird am ehesten..."
  }
]`;
}

function buildTranslationPrompt(text, targetLanguages) {
  return `Translate the following question for the party game "Who Is The Most" into ${targetLanguages.join(', ')}.
The question should maintain the same meaning and tone, starting with the appropriate phrase in each language:
- French: "Qui est le plus..."
- English: "Who is most likely to..."
- German: "Wer wird am ehesten..."

Original text: "${text}"

Respond ONLY with a JSON object in this exact format (no additional text):
{
  "en": "English translation",
  "fr": "French translation",
  "de": "German translation"
}`;
}

/**
 * Extracts the JSON value matched by `pattern` from the model's answer. The
 * answer is kept on the cause for the logs, never sent to the admin.
 */
function parseJsonFromText(content, pattern, what) {
  try {
    const jsonMatch = content.match(pattern);
    if (!jsonMatch) {
      throw new Error(`No JSON ${what} found in the model answer`);
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    error.modelAnswer = content;
    throw new HttpError(UPSTREAM_ERROR_STATUS, 'UPSTREAM_INVALID_RESPONSE', `Failed to parse the generated ${what}.`, {
      cause: error,
    });
  }
}

/**
 * Calls the Groq chat completions API and returns the first answer's text. A
 * failure surfaces as a generic 502; Groq's own message only goes to the logs.
 */
async function callGroq(context, messages, { maxTokens, temperature }) {
  const response = await context.fetchFn(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${context.apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: maxTokens, temperature }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const upstreamMessage = errorData.error?.message ?? 'no message';
    throw new HttpError(UPSTREAM_ERROR_STATUS, 'UPSTREAM_ERROR', `The AI request failed (status ${response.status}).`, {
      cause: new Error(`Groq answered ${response.status}: ${upstreamMessage}`),
    });
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function generateQuestions(context, { category, count }) {
  const content = await callGroq(
    context,
    [
      { role: 'system', content: GENERATION_SYSTEM_PROMPT },
      { role: 'user', content: buildGenerationPrompt(category, count) },
    ],
    { maxTokens: GENERATION_MAX_TOKENS, temperature: GENERATION_TEMPERATURE },
  );
  return parseJsonFromText(content, /\[[\s\S]*\]/, 'questions');
}

function batchRequestCounts({ succeeded, errored }) {
  return { processing: 0, succeeded, errored, canceled: 0, expired: 0 };
}

async function generate(context, params) {
  return { questions: await generateQuestions(context, params) };
}

// Groq has no batch API: batch-create generates synchronously and returns the
// questions with status "ended", which the admin UI stores with the batch.
async function createBatch(context, params) {
  const batch = { batchId: `${BATCH_ID_PREFIX}${Date.now()}`, createdAt: new Date().toISOString(), expiresAt: null };
  try {
    const questions = await generateQuestions(context, params);
    return { ...batch, processingStatus: 'ended', requestCounts: batchRequestCounts({ succeeded: 1, errored: 0 }), questions };
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== UPSTREAM_ERROR_STATUS) {
      throw error;
    }
    // The admin UI records failed batches as "errored"; this is where the failure ends, so log it here.
    console.error('AI batch generation failed', error);
    return {
      ...batch,
      processingStatus: 'errored',
      requestCounts: batchRequestCounts({ succeeded: 0, errored: 1 }),
      error: error.message,
    };
  }
}

async function getBatchStatus(context, { batchId }) {
  return {
    batchId,
    processingStatus: 'ended',
    createdAt: null,
    endedAt: new Date().toISOString(),
    expiresAt: null,
    requestCounts: batchRequestCounts({ succeeded: 1, errored: 0 }),
  };
}

// Questions are returned by batch-create and stored by the admin UI; there is
// no server-side storage to read them back from.
async function getBatchResults() {
  return { questions: [] };
}

async function translate(context, { text, targetLanguages }) {
  const content = await callGroq(
    context,
    [
      { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
      { role: 'user', content: buildTranslationPrompt(text, targetLanguages) },
    ],
    { maxTokens: TRANSLATION_MAX_TOKENS, temperature: TRANSLATION_TEMPERATURE },
  );
  return { translations: parseJsonFromText(content, /\{[\s\S]*\}/, 'translations') };
}

const ACTIONS = {
  generate,
  'batch-create': createBatch,
  'batch-status': getBatchStatus,
  'batch-results': getBatchResults,
  translate,
};

/**
 * Runs one validated paid action against Groq and returns the JSON body the
 * admin UI expects. `context` is `{ apiKey, fetchFn }`.
 */
export function runAiAction(action, params, context) {
  return ACTIONS[action](context, params);
}
