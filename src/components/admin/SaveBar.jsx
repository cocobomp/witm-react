import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '../../contexts/QuestionsContext';

export default function SaveBar() {
  const { t } = useTranslation('admin');
  const { hasUnsavedChanges, unsavedCount, saving, saveAll, discardChanges, lastSaved, error } = useQuestions();
  const [showSaved, setShowSaved] = useState(false);

  // Show "saved" message briefly after saving
  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleSave = async () => {
    await saveAll();
  };

  const handleDiscard = () => {
    if (window.confirm(t('saveBar.discardConfirm', 'Discard all unsaved changes?'))) {
      discardChanges();
    }
  };

  return (
    <AnimatePresence>
      {(hasUnsavedChanges || showSaved) && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl p-4 backdrop-blur-xl border shadow-2xl flex items-center justify-between gap-4 ${
              showSaved && !hasUnsavedChanges
                ? 'bg-green-500/20 border-green-500/30'
                : error
                ? 'bg-red-500/20 border-red-500/30'
                : 'bg-dark-surface/95 border-white/10'
            }`}>
              {/* Status message */}
              <div className="flex items-center gap-3">
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-300">{t('saveBar.saving')}</span>
                  </>
                ) : showSaved && !hasUnsavedChanges ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">{t('saveBar.saved')}</span>
                  </>
                ) : error ? (
                  <>
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-400">{t('saveBar.error')}</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
                      {unsavedCount}
                    </span>
                    <span className="text-gray-300">
                      {t('saveBar.unsaved', { count: unsavedCount })}
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDiscard}
                    disabled={saving}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {t('saveBar.discard')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('saveBar.saving')}
                      </>
                    ) : (
                      t('saveBar.save')
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
