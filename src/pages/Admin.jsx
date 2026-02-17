import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { QuestionsProvider, useQuestions } from '../contexts/QuestionsContext';
import QuestionList from '../components/admin/QuestionList';
import QuestionEditor from '../components/admin/QuestionEditor';
import CategoryFilter from '../components/admin/CategoryFilter';
import SaveBar from '../components/admin/SaveBar';
import AIGenerator from '../components/admin/AIGenerator';
import BatchPanel from '../components/admin/BatchPanel';

function AdminDashboard() {
  const { t, i18n } = useTranslation('admin');
  const { user, signOut } = useAuth();
  const {
    loadAll,
    loading,
    error,
    getAllQuestions,
    getAllCategories,
    unsavedCount,
  } = useQuestions();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const questions = getAllQuestions();
  const categories = getAllCategories();

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    // Filter by category
    if (selectedCategory !== 'all' && q.catId !== selectedCategory) {
      return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQuestion = q.question?.toLowerCase().includes(query);
      const matchesEn = q.translations?.en?.toLowerCase().includes(query);
      const matchesFr = q.translations?.fr?.toLowerCase().includes(query);
      const matchesDe = q.translations?.de?.toLowerCase().includes(query);
      return matchesQuestion || matchesEn || matchesFr || matchesDe;
    }
    return true;
  });

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-dark-surface border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">
                <span className="gradient-text">WITM</span>
                <span className="text-gray-400 ml-2 text-sm font-normal">
                  {t('title')}
                </span>
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language switcher */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                {['en', 'fr', 'de'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      i18n.language?.startsWith(lang)
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* User info */}
              <div className="flex items-center gap-3">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={`${user.email || 'User'} profile photo`}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-400 text-sm hidden sm:block">
                  {user?.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {t('header.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <p className="text-gray-400 text-sm">{t('stats.totalQuestions')}</p>
            <p className="text-3xl font-bold text-white mt-1">
              {questions.filter((q) => q._status !== 'deleted').length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <p className="text-gray-400 text-sm">{t('stats.categories')}</p>
            <p className="text-3xl font-bold text-white mt-1">{categories.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <p className="text-gray-400 text-sm">{t('stats.pendingChanges')}</p>
            <p className={`text-3xl font-bold mt-1 ${unsavedCount > 0 ? 'text-yellow-400' : 'text-white'}`}>
              {unsavedCount}
            </p>
          </motion.div>
        </div>

        {/* Pending Batches */}
        <BatchPanel categories={categories} />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{t('errors.loadFailed')}</p>
            <button
              onClick={loadAll}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('questions.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Category filter */}
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerator(true)}
              className="px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">AI Generate</span>
            </button>
            <button
              onClick={() => setEditingQuestion({ isNew: true })}
              className="px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{t('questions.add')}</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          /* Question list */
          <QuestionList
            questions={filteredQuestions}
            categories={categories}
            onEdit={(question) => setEditingQuestion(question)}
          />
        )}
      </main>

      {/* Save bar */}
      <SaveBar />

      {/* Question editor modal */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion.isNew ? null : editingQuestion}
          categories={categories}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* AI Generator modal */}
      {showGenerator && (
        <AIGenerator
          categories={categories}
          onClose={() => setShowGenerator(false)}
        />
      )}
    </div>
  );
}

// Wrap with QuestionsProvider
export default function Admin() {
  return (
    <QuestionsProvider>
      <AdminDashboard />
    </QuestionsProvider>
  );
}
