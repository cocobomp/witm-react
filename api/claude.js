/**
 * Vercel Serverless Function for Claude API
 * Handles question generation and translation requests
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  // Only allow POST requests
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

async function handleGenerate(req, res, apiKey) {
  const { category, count = 5, language = 'fr' } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const prompt = `Tu es un assistant créatif pour le jeu WITM ("Who Is The Most" / "Qui est le plus").
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
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

  // Parse the JSON response
  try {
    // Find JSON array in the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ questions });
  } catch (parseError) {
    console.error('Parse error:', parseError, 'Content:', content);
    return res.status(500).json({ error: 'Failed to parse generated questions' });
  }
}

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
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

  // Parse the JSON response
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
