import { HttpError } from './http-error.js';

// Cost guards: even an admin session (or a stolen admin token) can only ask
// for bounded work. The generation cap matches the admin UI's count input.
export const SUPPORTED_LANGUAGES = Object.freeze(['en', 'fr', 'de']);
export const DEFAULT_GENERATION_COUNT = 5;
export const MIN_GENERATION_COUNT = 1;
export const MAX_GENERATION_COUNT = 20;
export const MAX_CATEGORY_LENGTH = 100;
export const MAX_TRANSLATION_TEXT_LENGTH = 500;
export const MAX_BATCH_ID_LENGTH = 128;

// Batch ids are `groq_batch_<ms>` (and `msgbatch_...` for batches the admin UI
// stored while the proxy used Anthropic). They are echoed back, so only a
// plain identifier alphabet is accepted.
const BATCH_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const GENERATION_FIELDS = ['category', 'count', 'language'];
const BATCH_LOOKUP_FIELDS = ['batchId'];
const TRANSLATION_FIELDS = ['text', 'sourceLanguage', 'targetLanguages'];

function invalid(message) {
  return new HttpError(400, 'INVALID_REQUEST', message);
}

function assertOnlyFields(body, allowedFields) {
  const unknownField = Object.keys(body).find((field) => field !== 'action' && !allowedFields.includes(field));
  if (unknownField !== undefined) {
    throw invalid(`Unknown field "${unknownField}".`);
  }
}

function requireText(value, field, maxLength) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalid(`"${field}" must be a non-empty string.`);
  }
  if (value.length > maxLength) {
    throw invalid(`"${field}" must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

function optionalLanguage(value, field) {
  if (value === undefined || value === null) {
    return null;
  }
  if (!SUPPORTED_LANGUAGES.includes(value)) {
    throw invalid(`"${field}" must be one of ${SUPPORTED_LANGUAGES.join(', ')}.`);
  }
  return value;
}

function generationCount(value) {
  if (value === undefined) {
    return DEFAULT_GENERATION_COUNT;
  }
  const isInRange = Number.isInteger(value) && value >= MIN_GENERATION_COUNT && value <= MAX_GENERATION_COUNT;
  if (!isInRange) {
    throw invalid(`"count" must be an integer between ${MIN_GENERATION_COUNT} and ${MAX_GENERATION_COUNT}.`);
  }
  return value;
}

function targetLanguages(value) {
  if (value === undefined) {
    return [...SUPPORTED_LANGUAGES];
  }
  const isValidList =
    Array.isArray(value) &&
    value.length > 0 &&
    new Set(value).size === value.length &&
    value.every((language) => SUPPORTED_LANGUAGES.includes(language));
  if (!isValidList) {
    throw invalid(`"targetLanguages" must be a non-empty list of distinct values among ${SUPPORTED_LANGUAGES.join(', ')}.`);
  }
  return value;
}

function validateGeneration(body) {
  assertOnlyFields(body, GENERATION_FIELDS);
  return {
    category: requireText(body.category, 'category', MAX_CATEGORY_LENGTH),
    count: generationCount(body.count),
    language: optionalLanguage(body.language, 'language'),
  };
}

function validateBatchLookup(body) {
  assertOnlyFields(body, BATCH_LOOKUP_FIELDS);
  const { batchId } = body;
  const isWellFormed =
    typeof batchId === 'string' && batchId.length <= MAX_BATCH_ID_LENGTH && BATCH_ID_PATTERN.test(batchId);
  if (!isWellFormed) {
    throw invalid('"batchId" must be a batch id returned by batch-create.');
  }
  return { batchId };
}

function validateTranslation(body) {
  assertOnlyFields(body, TRANSLATION_FIELDS);
  return {
    text: requireText(body.text, 'text', MAX_TRANSLATION_TEXT_LENGTH),
    sourceLanguage: optionalLanguage(body.sourceLanguage, 'sourceLanguage'),
    targetLanguages: targetLanguages(body.targetLanguages),
  };
}

const VALIDATORS = {
  generate: validateGeneration,
  'batch-create': validateGeneration,
  'batch-status': validateBatchLookup,
  'batch-results': validateBatchLookup,
  translate: validateTranslation,
};

/**
 * Validates a paid action's body and returns its normalized parameters, or
 * throws a 400 HttpError. Unknown actions and unknown fields are rejected.
 */
export function validateClaudeRequest(body) {
  const isKnownAction = typeof body.action === 'string' && Object.hasOwn(VALIDATORS, body.action);
  if (!isKnownAction) {
    throw invalid('Unknown action.');
  }
  return VALIDATORS[body.action](body);
}
