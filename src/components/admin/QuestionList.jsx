import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '../../contexts/QuestionsContext';

export default function QuestionList({ questions, categories, onEdit }) {
  const { t, i18n } = useTranslation('admin');
  const { deleteQuestion, restoreQuestion } = useQuestions();

  // Get category by ID
  const getCategoryName = (catId) => {
    const category = categories.find((c) => c.id === catId);
    return category ? `${category.icon} ${category.title}` : catId;
  };

  // Get the display text for the current language
  const getDisplayText = (question) => {
    const lang = i18n.language?.split('-')[0] || 'en';
    if (lang === 'fr') {
      return question.question || question.translations?.fr || '';
    }
    return question.translations?.[lang] || question.translations?.en || question.question || '';
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500 text-6xl mb-4">📭</div>
        <p className="text-gray-400">{t('questions.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.02 }}
            className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all ${
              question._status === 'deleted'
                ? 'border-red-500/30 opacity-60'
                : question._status === 'modified'
                ? 'border-yellow-500/30'
                : question._status === 'new'
                ? 'border-green-500/30'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Status indicator */}
              <div className="flex-shrink-0 mt-1">
                {question._status === 'deleted' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                    {t('questions.deleted')}
                  </span>
                )}
                {question._status === 'modified' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    {t('questions.modified')}
                  </span>
                )}
                {question._status === 'new' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                    {t('questions.new')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-white font-medium ${question._status === 'deleted' ? 'line-through' : ''}`}>
                  {getDisplayText(question)}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                  <span className="bg-white/5 px-2 py-0.5 rounded">
                    {getCategoryName(question.catId)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {question.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    {question.dislikes || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {question._status === 'deleted' ? (
                  <button
                    onClick={() => restoreQuestion(question.id)}
                    className="px-3 py-1.5 text-sm text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                  >
                    {t('questions.restore')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(question)}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {t('questions.edit')}
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {t('questions.delete')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
