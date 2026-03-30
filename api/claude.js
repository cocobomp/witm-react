/**
 * Vercel Serverless Function for AI question generation
 * Uses Groq API (OpenAI-compatible) with Llama 3.3 70B
 * Handles question generation (batch + sync), translation, and batch management
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const ALLOWED_ORIGINS = [
  'https://whoisthemost.com',
  'https://www.whoisthemost.com',
  'https://witm-react.vercel.app',
  'http://localhost:5173',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function checkAdminAuth(req) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return true; // skip auth if not configured
  const provided = req.headers['x-admin-key'];
  return provided === adminSecret;
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body;

  // Health check does not require auth
  if (action === 'health') {
    return res.status(200).json({ status: 'ok' });
  }

  // Check admin authentication
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing X-Admin-Key' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    switch (action) {
      case 'generate':
        return await handleGenerate(req, res, apiKey);

      case 'batch-create':
        return await handleBatchCreate(req, res, apiKey);

      case 'batch-status':
        return await handleBatchStatus(req, res);

      case 'batch-results':
        return await handleBatchResults(req, res);

      case 'translate':
        return await handleTranslate(req, res, apiKey);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

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

function parseQuestionsFromText(content) {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found in response');
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * Call the Groq chat completions API
 */
async function callGroq(apiKey, messages, maxTokens = 2000, temperature = 0.8) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// --- Synchronous generation ---

async function handleGenerate(req, res, apiKey) {
  const { category, count = 5 } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const prompt = buildGenerationPrompt(category, count);

  const content = await callGroq(apiKey, [
    { role: 'system', content: 'You are a creative assistant for a party game. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ]);

  try {
    const questions = parseQuestionsFromText(content);
    return res.status(200).json({ questions });
  } catch (parseError) {
    console.error('Parse error:', parseError, 'Content:', content);
    return res.status(500).json({ error: 'Failed to parse generated questions' });
  }
}

// --- Batch operations (simulated via sequential calls) ---
// Groq does not have a batch API, so batch-create runs the generation
// synchronously and returns results immediately with status "ended".

async function handleBatchCreate(req, res, apiKey) {
  const { category, count = 5 } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const prompt = buildGenerationPrompt(category, count);
  const batchId = `groq_batch_${Date.now()}`;
  const createdAt = new Date().toISOString();

  try {
    const content = await callGroq(apiKey, [
      { role: 'system', content: 'You are a creative assistant for a party game. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ]);

    const questions = parseQuestionsFromText(content);

    // Return immediately as completed since Groq processes synchronously
    return res.status(200).json({
      batchId,
      processingStatus: 'ended',
      createdAt,
      expiresAt: null,
      requestCounts: {
        processing: 0,
        succeeded: 1,
        errored: 0,
        canceled: 0,
        expired: 0,
      },
      // Include questions directly so batch-results can return them
      questions,
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    return res.status(200).json({
      batchId,
      processingStatus: 'errored',
      createdAt,
      expiresAt: null,
      requestCounts: {
        processing: 0,
        succeeded: 0,
        errored: 1,
        canceled: 0,
        expired: 0,
      },
      error: error.message,
    });
  }
}

async function handleBatchStatus(req, res) {
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ error: 'batchId is required' });
  }

  // Since Groq processes synchronously, batches are always completed
  return res.status(200).json({
    batchId,
    processingStatus: 'ended',
    createdAt: null,
    endedAt: new Date().toISOString(),
    expiresAt: null,
    requestCounts: {
      processing: 0,
      succeeded: 1,
      errored: 0,
      canceled: 0,
      expired: 0,
    },
  });
}

async function handleBatchResults(req, res) {
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ error: 'batchId is required' });
  }

  // Since batch-create now returns questions directly in the response,
  // the frontend stores them via saveBatch. If the frontend calls
  // batch-results, it means it needs the questions re-fetched.
  // Without server-side storage, return an empty set and let the
  // frontend use the questions already stored from batch-create.
  return res.status(200).json({ questions: [] });
}

// --- Translation ---

async function handleTranslate(req, res, apiKey) {
  const { text, targetLanguages = ['en', 'fr', 'de'] } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const prompt = `Translate the following question for the party game "Who Is The Most" into ${targetLanguages.join(', ')}.
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

  const content = await callGroq(
    apiKey,
    [
      { role: 'system', content: 'You are a translator. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    500,
    0.3,
  );

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const translations = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ translations });
  } catch (parseError) {
    console.error('Parse error:', parseError, 'Content:', content);
    return res.status(500).json({ error: 'Failed to parse translations' });
  }
}
