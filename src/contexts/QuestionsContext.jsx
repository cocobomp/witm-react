import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { fetchAllQuestions, fetchAllCategories, batchSave } from '../services/firestore';

const QuestionsContext = createContext(null);

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
}

// Generate a temporary ID for new questions
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function QuestionsProvider({ children }) {
  // Original data from Firestore (for discarding changes)
  const [originalQuestions, setOriginalQuestions] = useState(new Map());
  const [categories, setCategories] = useState(new Map());

  // Current working state
  const [questions, setQuestions] = useState(new Map());

  // Track changes
  const [dirty, setDirty] = useState(new Set()); // IDs of modified questions
  const [deleted, setDeleted] = useState(new Set()); // IDs marked for deletion
  const [created, setCreated] = useState(new Map()); // New questions with temp IDs

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Calculate if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return dirty.size > 0 || deleted.size > 0 || created.size > 0;
  }, [dirty, deleted, created]);

  // Get count of unsaved changes
  const unsavedCount = useMemo(() => {
    return dirty.size + deleted.size + created.size;
  }, [dirty, deleted, created]);

  // Load all data from Firestore
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [questionsData, categoriesData] = await Promise.all([
        fetchAllQuestions(),
        fetchAllCategories(),
      ]);

      // Convert arrays to Maps for efficient lookups
      const questionsMap = new Map(questionsData.map((q) => [q.id, q]));
      const categoriesMap = new Map(categoriesData.map((c) => [c.id, c]));

      setOriginalQuestions(new Map(questionsMap));
      setQuestions(questionsMap);
      setCategories(categoriesMap);

      // Reset change tracking
      setDirty(new Set());
      setDeleted(new Set());
      setCreated(new Map());
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a question (mark as dirty)
  const updateQuestion = useCallback((id, updates) => {
    if (id.startsWith('temp_')) {
      // Update a newly created question
      setCreated((prev) => {
        const newCreated = new Map(prev);
        const existing = newCreated.get(id);
        if (existing) {
          newCreated.set(id, { ...existing, ...updates });
        }
        return newCreated;
      });
    } else {
      // Update an existing question
      setQuestions((prev) => {
        const newQuestions = new Map(prev);
        const existing = newQuestions.get(id);
        if (existing) {
          newQuestions.set(id, { ...existing, ...updates });
        }
        return newQuestions;
      });

      // Mark as dirty
      setDirty((prev) => new Set(prev).add(id));
    }
  }, []);

  // Mark a question for deletion (soft delete)
  const deleteQuestion = useCallback((id) => {
    if (id.startsWith('temp_')) {
      // Remove newly created question entirely
      setCreated((prev) => {
        const newCreated = new Map(prev);
        newCreated.delete(id);
        return newCreated;
      });
    } else {
      // Mark existing question for deletion
      setDeleted((prev) => new Set(prev).add(id));
      // Remove from dirty if it was modified
      setDirty((prev) => {
        const newDirty = new Set(prev);
        newDirty.delete(id);
        return newDirty;
      });
    }
  }, []);

  // Restore a question that was marked for deletion
  const restoreQuestion = useCallback((id) => {
    setDeleted((prev) => {
      const newDeleted = new Set(prev);
      newDeleted.delete(id);
      return newDeleted;
    });
  }, []);

  // Create a new question
  const createQuestion = useCallback((questionData) => {
    const tempId = generateTempId();
    const newQuestion = {
      id: tempId,
      question: questionData.question || '',
      translations: questionData.translations || { en: '', fr: '', de: '' },
      catId: questionData.catId || '',
      likes: 0,
      dislikes: 0,
      isDeleted: false,
      deletedAt: null,
    };

    setCreated((prev) => new Map(prev).set(tempId, newQuestion));
    return tempId;
  }, []);

  // Save all changes to Firestore
  const saveAll = useCallback(async () => {
    if (!hasUnsavedChanges) return { success: true };

    setSaving(true);
    setError(null);

    try {
      // Prepare updates (only include dirty questions that aren't deleted)
      const updates = [];
      for (const id of dirty) {
        if (!deleted.has(id)) {
          const question = questions.get(id);
          if (question) {
            updates.push({
              id,
              question: question.question,
              translations: question.translations,
              catId: question.catId,
            });
          }
        }
      }

      // Prepare deletes
      const deletesToSave = Array.from(deleted);

      // Prepare creates
      const createsToSave = Array.from(created.values()).map(({ id, ...rest }) => rest);

      // Batch save to Firestore
      const result = await batchSave(updates, deletesToSave, createsToSave);

      // Reload data to get fresh state
      await loadAll();

      setLastSaved(new Date());
      return { success: true, ...result };
    } catch (err) {
      console.error('Error saving changes:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [hasUnsavedChanges, dirty, deleted, created, questions, loadAll]);

  // Discard all changes
  const discardChanges = useCallback(() => {
    setQuestions(new Map(originalQuestions));
    setDirty(new Set());
    setDeleted(new Set());
    setCreated(new Map());
    setError(null);
  }, [originalQuestions]);

  // Get all questions as array (for rendering)
  const getAllQuestions = useCallback(() => {
    const allQuestions = [];

    // Add existing questions (not marked for deletion)
    for (const [id, question] of questions) {
      if (!question.isDeleted) {
        allQuestions.push({
          ...question,
          _status: deleted.has(id) ? 'deleted' : dirty.has(id) ? 'modified' : 'unchanged',
        });
      }
    }

    // Add newly created questions
    for (const [id, question] of created) {
      allQuestions.push({
        ...question,
        _status: 'new',
      });
    }

    return allQuestions;
  }, [questions, created, dirty, deleted]);

  // Get all categories as array
  const getAllCategories = useCallback(() => {
    return Array.from(categories.values());
  }, [categories]);

  // Get a single question by ID
  const getQuestion = useCallback((id) => {
    if (id.startsWith('temp_')) {
      return created.get(id);
    }
    return questions.get(id);
  }, [questions, created]);

  // Get category by ID
  const getCategory = useCallback((id) => {
    return categories.get(id);
  }, [categories]);

  const value = {
    // Data
    questions,
    categories,
    getAllQuestions,
    getAllCategories,
    getQuestion,
    getCategory,

    // Actions
    loadAll,
    updateQuestion,
    deleteQuestion,
    restoreQuestion,
    createQuestion,
    saveAll,
    discardChanges,

    // State
    loading,
    saving,
    error,
    hasUnsavedChanges,
    unsavedCount,
    lastSaved,

    // Change tracking
    dirty,
    deleted,
    created,
  };

  return (
    <QuestionsContext.Provider value={value}>
      {children}
    </QuestionsContext.Provider>
  );
}

export default QuestionsContext;
