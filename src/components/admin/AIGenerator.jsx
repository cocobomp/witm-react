import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { createBatch } from '../../services/claude';
import { saveBatch } from '../../services/batchStorage';

export default function AIGenerator({ categories, onClose }) {
  const { t } = useTranslation('admin');

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [count, setCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const closeTimerRef = useRef(null);

  // Cleanup timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const getCategoryName = (catId) => {
    const category = categories.find((c) => c.id === catId);
    return category ? category.title : catId;
  };

  const handleSubmitBatch = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    setError(null);

    try {
      const categoryName = getCategoryName(selectedCategory);
      const result = await createBatch({
        category: categoryName,
        count,
        language: 'fr',
      });

      saveBatch({
        batchId: result.batchId,
        category: selectedCategory,
        categoryName,
        count,
        processingStatus: result.processingStatus,
        createdAt: result.createdAt,
        expiresAt: result.expiresAt,
        requestCounts: result.requestCounts,
        questions: null,
      });

      setSuccess(true);
      closeTimerRef.current = setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error('Batch creation error:', err);
      setError(err.message || t('generator.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('generator.title')}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{t('generator.description')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-400 text-5xl mb-4">&#10003;</div>
                <p className="text-white font-medium">{t('generator.batchSubmitted')}</p>
              </div>
            ) : (
              <>
                {/* Generation controls */}
                <div className="space-y-4 mb-6">
                  {/* Category select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('generator.category')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="" className="bg-dark-surface">
                        {t('generator.selectCategory')}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id} className="bg-dark-surface">
                          {category.icon} {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Count input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('generator.count')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={count}
                      onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Info about batch */}
                <div className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    {t('generator.batchInfo')}
                  </p>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmitBatch}
                  disabled={submitting || !selectedCategory}
                  className="w-full px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('generator.submitting')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {t('generator.submitBatch')}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
