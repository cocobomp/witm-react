import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '../../contexts/QuestionsContext';
import { translateQuestion } from '../../services/claude';

export default function QuestionEditor({ question, categories, onClose }) {
  const { t } = useTranslation('admin');
  const { updateQuestion, createQuestion, deleteQuestion } = useQuestions();

  const isNew = !question;

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    translations: { en: '', fr: '', de: '' },
    catId: categories[0]?.id || '',
  });
  const [translating, setTranslating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Initialize form with question data
  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        translations: {
          en: question.translations?.en || '',
          fr: question.translations?.fr || '',
          de: question.translations?.de || '',
        },
        catId: question.catId || categories[0]?.id || '',
      });
    }
  }, [question, categories]);

  const handleChange = (field, value) => {
    if (field.startsWith('translations.')) {
      const lang = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        translations: { ...prev.translations, [lang]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAutoTranslate = async () => {
    // Get the source text (prefer French, then any available)
    const sourceText = formData.question || formData.translations.fr || formData.translations.en;
    if (!sourceText) return;

    setTranslating(true);
    try {
      const result = await translateQuestion(sourceText);
      if (result.translations) {
        setFormData((prev) => ({
          ...prev,
          question: result.translations.fr || prev.question,
          translations: {
            en: result.translations.en || prev.translations.en,
            fr: result.translations.fr || prev.translations.fr,
            de: result.translations.de || prev.translations.de,
          },
        }));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = () => {
    if (isNew) {
      createQuestion({
        question: formData.question,
        translations: formData.translations,
        catId: formData.catId,
      });
    } else {
      updateQuestion(question.id, {
        question: formData.question,
        translations: formData.translations,
        catId: formData.catId,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteQuestion(question.id);
      onClose();
    } else {
      setConfirmDelete(true);
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
          className="w-full max-w-2xl bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isNew ? t('editor.titleNew') : t('editor.title')}
            </h2>
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
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('editor.category')}
              </label>
              <select
                value={formData.catId}
                onChange={(e) => handleChange('catId', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-dark-surface">
                    {category.icon} {category.title}
                  </option>
                ))}
              </select>
            </div>

            {/* French question (main) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('editor.questionFr')} 🇫🇷
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => handleChange('question', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                placeholder="Qui est le plus susceptible de..."
              />
            </div>

            {/* Auto-translate button */}
            <div className="flex justify-center">
              <button
                onClick={handleAutoTranslate}
                disabled={translating || (!formData.question && !formData.translations.fr)}
                className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {translating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    {t('editor.translating')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {t('editor.autoTranslate')}
                  </>
                )}
              </button>
            </div>

            {/* English translation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('editor.translationEn')} 🇬🇧
              </label>
              <textarea
                value={formData.translations.en}
                onChange={(e) => handleChange('translations.en', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                placeholder="Who is most likely to..."
              />
            </div>

            {/* German translation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('editor.translationDe')} 🇩🇪
              </label>
              <textarea
                value={formData.translations.de}
                onChange={(e) => handleChange('translations.de', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                placeholder="Wer wird am ehesten..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div>
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    confirmDelete
                      ? 'bg-red-500 text-white'
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  {confirmDelete ? t('editor.confirmDelete') : t('editor.delete')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {t('editor.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.question && !formData.translations.fr}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('editor.save')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
