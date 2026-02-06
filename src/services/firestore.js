import {
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const QUESTIONS_COLLECTION = 'QUESTIONS';
const CATEGORIES_COLLECTION = 'CATEGORIES';

/**
 * Fetch all questions from Firestore (excluding soft-deleted)
 * @returns {Promise<Array>} Array of question objects with id
 */
export async function fetchAllQuestions() {
  try {
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    // Get all questions (we'll filter soft-deleted on client side for flexibility)
    const snapshot = await getDocs(questionsRef);

    const questions = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        ...data,
        // Normalize the data structure
        question: data.question || '',
        translations: data.translations || { en: '', fr: '', de: '' },
        catId: data.catId || '',
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        isDeleted: data.isDeleted || false,
        deletedAt: data.deletedAt || null,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      });
    });

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Fetch all categories from Firestore
 * @returns {Promise<Array>} Array of category objects with id
 */
export async function fetchAllCategories() {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(categoriesRef);

    const categories = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        title: data.title || '',
        icon: data.icon || '',
        ...data,
      });
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Batch save all changes to Firestore
 * Uses writeBatch for atomic operations to minimize API calls
 *
 * @param {Array} updates - Array of { id, ...fields } for questions to update
 * @param {Array} deletes - Array of question IDs to soft-delete
 * @param {Array} creates - Array of new question objects (without id)
 * @returns {Promise<Object>} Result with created IDs
 */
export async function batchSave(updates = [], deletes = [], creates = []) {
  const batch = writeBatch(db);
  const createdIds = [];

  try {
    // Process updates
    for (const update of updates) {
      const { id, ...fields } = update;
      const docRef = doc(db, QUESTIONS_COLLECTION, id);
      batch.update(docRef, {
        ...fields,
        updatedAt: serverTimestamp(),
      });
    }

    // Process soft deletes
    for (const questionId of deletes) {
      const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
      batch.update(docRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Process creates - we need to add docs outside of batch for new IDs
    // Firestore writeBatch doesn't support addDoc, so we use set with auto-generated ID
    for (const question of creates) {
      const newDocRef = doc(collection(db, QUESTIONS_COLLECTION));
      batch.set(newDocRef, {
        ...question,
        isDeleted: false,
        deletedAt: null,
        likes: question.likes || 0,
        dislikes: question.dislikes || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      createdIds.push(newDocRef.id);
    }

    // Commit all changes atomically
    await batch.commit();

    return {
      success: true,
      updatedCount: updates.length,
      deletedCount: deletes.length,
      createdCount: creates.length,
      createdIds,
    };
  } catch (error) {
    console.error('Error in batch save:', error);
    throw error;
  }
}

/**
 * Restore a soft-deleted question
 * @param {string} questionId - The ID of the question to restore
 */
export async function restoreQuestion(questionId) {
  const batch = writeBatch(db);
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);

  batch.update(docRef, {
    isDeleted: false,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Permanently delete a question (use with caution)
 * @param {string} questionId - The ID of the question to permanently delete
 */
export async function permanentlyDeleteQuestion(questionId) {
  const { deleteDoc } = await import('firebase/firestore');
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  await deleteDoc(docRef);
}
