import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '../../contexts/QuestionsContext';
import { generateQuestions } from '../../services/claude';

export default function AIGenerator({ categories, onClose }) {
  const { t } = useTranslation('admin');
  const { createQuestion } = useQuestions();

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [error, setError] = useState(null);

  // Get category name by ID
  const getCategoryName = (catId) => {
    const category = categories.find((c) => c.id === catId);
    return category ? category.title : catId;
  };

  const handleGenerate = async () => {
    if (!selectedCategory) return;

    setGenerating(true);
    setError(null);
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());

    try {
      const categoryName = getCategoryName(selectedCategory);
      const questions = await generateQuestions({
        category: categoryName,
        count,
        language: 'fr',
      });

      setGeneratedQuestions(questions);
      // Select all by default
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || t('generator.error'));
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestion = (index) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedQuestions(new Set(generatedQuestions.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedQuestions(new Set());
  };

  const handleAddSelected = () => {
    const questionsToAdd = generatedQuestions.filter((_, i) => selectedQuestions.has(i));

    for (const q of questionsToAdd) {
      createQuestion({
        question: q.fr || q.question,
        translations: {
          en: q.en || '',
          fr: q.fr || q.question || '',
          de: q.de || '',
        },
        catId: selectedCategory,
      });
    }

    onClose();
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
          className="w-full max-w-3xl bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
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
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Generation controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Category select */}
              <div className="flex-1">
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
              <div className="w-full sm:w-32">
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

              {/* Generate button */}
              <div className="flex items-end">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !selectedCategory}
                  className="w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('generator.generating')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {t('generator.generate')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Generated questions */}
            {generatedQuestions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    {t('generator.generated')} ({generatedQuestions.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAll}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t('generator.selectAll')}
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={deselectAll}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t('generator.deselectAll')}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleQuestion(index)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedQuestions.has(index)
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            selectedQuestions.has(index)
                              ? 'bg-primary border-primary'
                              : 'border-gray-500'
                          }`}
                        >
                          {selectedQuestions.has(index) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            🇫🇷 {question.fr || question.question}
                          </p>
                          {question.en && (
                            <p className="text-gray-400 text-sm mt-1">
                              🇬🇧 {question.en}
                            </p>
                          )}
                          {question.de && (
                            <p className="text-gray-400 text-sm mt-1">
                              🇩🇪 {question.de}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!generating && generatedQuestions.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-6xl mb-4">🤖</div>
                <p className="text-gray-400">{t('generator.noQuestions')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {generatedQuestions.length > 0 && (
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {t('editor.cancel')}
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedQuestions.size === 0}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('generator.addSelected')} ({selectedQuestions.size})
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
