/**
 * Batch storage service using localStorage
 * Persists pending batch records for the admin panel
 */

const STORAGE_KEY = 'witm_pending_batches';

/**
 * @typedef {Object} BatchRecord
 * @property {string} batchId
 * @property {string} category - Category ID
 * @property {string} categoryName - Human-readable category name
 * @property {number} count - Requested question count
 * @property {string} processingStatus - 'in_progress' | 'canceling' | 'ended'
 * @property {string} createdAt - ISO timestamp
 * @property {string|null} endedAt
 * @property {Object|null} requestCounts
 * @property {Array|null} questions - Parsed results once available
 */

export function getPendingBatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBatch(batchRecord) {
  const batches = getPendingBatches();
  const existingIndex = batches.findIndex((b) => b.batchId === batchRecord.batchId);
  if (existingIndex >= 0) {
    batches[existingIndex] = { ...batches[existingIndex], ...batchRecord };
  } else {
    batches.unshift(batchRecord);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}

export function updateBatchStatus(batchId, updates) {
  const batches = getPendingBatches();
  const index = batches.findIndex((b) => b.batchId === batchId);
  if (index >= 0) {
    batches[index] = { ...batches[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  }
}

export function removeBatch(batchId) {
  const batches = getPendingBatches().filter((b) => b.batchId !== batchId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}
