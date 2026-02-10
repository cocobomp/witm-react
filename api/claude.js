/**
 * Vercel Serverless Function for Claude API
 * Handles question generation (batch + sync), translation, and batch management
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_BATCH_URL = 'https://api.anthropic.com/v1/messages/batches';

const ALLOWED_ORIGINS = [
  'https://whoisthemost.com',
  'https://www.whoisthemost.com',
  'http://localhost:5173',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { action } = req.body;

  try {
    switch (action) {
      case 'health':
        return res.status(200).json({ status: 'ok' });

      case 'generate':
        return await handleGenerate(req, res, apiKey);

      case 'batch-create':
        return await handleBatchCreate(req, res, apiKey);

      case 'batch-status':
        return await handleBatchStatus(req, res, apiKey);

      case 'batch-results':
        return await handleBatchResults(req, res, apiKey);

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

// --- Synchronous generation (fallback) ---

async function handleGenerate(req, res, apiKey) {
  const { category, count = 5 } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const prompt = buildGenerationPrompt(category, count);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

  try {
    const questions = parseQuestionsFromText(content);
    return res.status(200).json({ questions });
  } catch (parseError) {
    console.error('Parse error:', parseError, 'Content:', content);
    return res.status(500).json({ error: 'Failed to parse generated questions' });
  }
}

// --- Batch API ---

async function handleBatchCreate(req, res, apiKey) {
  const { category, count = 5 } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const prompt = buildGenerationPrompt(category, count);

  const batchRequests = [
    {
      custom_id: `generate_${Date.now()}`,
      params: {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      },
    },
  ];

  const response = await fetch(ANTHROPIC_BATCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ requests: batchRequests }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Batch creation failed: ${response.status}`);
  }

  const batch = await response.json();
  return res.status(200).json({
    batchId: batch.id,
    processingStatus: batch.processing_status,
    createdAt: batch.created_at,
    expiresAt: batch.expires_at,
    requestCounts: batch.request_counts,
  });
}

async function handleBatchStatus(req, res, apiKey) {
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ error: 'batchId is required' });
  }

  const response = await fetch(`${ANTHROPIC_BATCH_URL}/${batchId}`, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Status check failed: ${response.status}`);
  }

  const batch = await response.json();
  return res.status(200).json({
    batchId: batch.id,
    processingStatus: batch.processing_status,
    createdAt: batch.created_at,
    endedAt: batch.ended_at,
    expiresAt: batch.expires_at,
    requestCounts: batch.request_counts,
  });
}

async function handleBatchResults(req, res, apiKey) {
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ error: 'batchId is required' });
  }

  const response = await fetch(`${ANTHROPIC_BATCH_URL}/${batchId}/results`, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Results fetch failed: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.trim().split('\n').filter(Boolean);
  const allQuestions = [];

  for (const line of lines) {
    const result = JSON.parse(line);
    if (result.result?.type === 'succeeded') {
      const content = result.result.message.content?.[0]?.text || '';
      try {
        const questions = parseQuestionsFromText(content);
        allQuestions.push(...questions);
      } catch (parseError) {
        console.error('Parse error for batch result:', result.custom_id, parseError);
      }
    }
  }

  return res.status(200).json({ questions: allQuestions });
}

// --- Translation (stays synchronous) ---

async function handleTranslate(req, res, apiKey) {
  const { text, sourceLanguage, targetLanguages = ['en', 'fr', 'de'] } = req.body;

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

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

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
