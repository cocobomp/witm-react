/**
 * Claude API client service
 * Communicates with Vercel serverless function to access Claude API
 */

const API_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/claude`
  : '/api/claude';

/**
 * Generate new questions using Claude AI (synchronous fallback)
 * @param {Object} options - Generation options
 * @param {string} options.category - Category name for context
 * @param {number} options.count - Number of questions to generate
 * @param {string} options.language - Primary language (fr, en, de)
 * @returns {Promise<Array>} Array of generated questions with translations
 */
export async function generateQuestions({ category, count = 5, language = 'fr' }) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate',
        category,
        count,
        language,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to generate questions: ${response.status}`);
    }

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Create a batch generation request
 * @param {Object} options - { category, count, language }
 * @returns {Promise<Object>} Batch metadata with batchId
 */
export async function createBatch({ category, count = 5, language = 'fr' }) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'batch-create',
      category,
      count,
      language,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to create batch: ${response.status}`);
  }

  return response.json();
}

/**
 * Check batch processing status
 * @param {string} batchId
 * @returns {Promise<Object>} Batch status info
 */
export async function checkBatchStatus(batchId) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'batch-status',
      batchId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to check batch status: ${response.status}`);
  }

  return response.json();
}

/**
 * Retrieve batch results (parsed questions)
 * @param {string} batchId
 * @returns {Promise<Object>} { questions: [...] }
 */
export async function fetchBatchResults(batchId) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'batch-results',
      batchId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to fetch batch results: ${response.status}`);
  }

  return response.json();
}

/**
 * Translate a question to all supported languages using Claude AI
 * @param {string} text - The text to translate
 * @param {string} sourceLanguage - Source language code (optional)
 * @returns {Promise<Object>} Object with translations { en, fr, de }
 */
export async function translateQuestion(text, sourceLanguage = null) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'translate',
        text,
        sourceLanguage,
        targetLanguages: ['en', 'fr', 'de'],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to translate: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error translating question:', error);
    throw error;
  }
}

/**
 * Check if the Claude API is available
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
