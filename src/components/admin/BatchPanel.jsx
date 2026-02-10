import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '../../contexts/QuestionsContext';
import { checkBatchStatus, fetchBatchResults } from '../../services/claude';
import {
  getPendingBatches,
  updateBatchStatus,
  removeBatch,
} from '../../services/batchStorage';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function BatchPanel({ categories }) {
  const { t } = useTranslation('admin');
  const { createQuestion } = useQuestions();

  const [batches, setBatches] = useState(() => getPendingBatches());
  const [expandedBatchId, setExpandedBatchId] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [loadingResults, setLoadingResults] = useState(null);
  const pollIntervalRef = useRef(null);

  // Poll for status updates on in_progress batches
  useEffect(() => {
    const inProgressCount = batches.filter(
      (b) => b.processingStatus === 'in_progress'
    ).length;

    if (inProgressCount === 0) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const pollBatches = async () => {
      const current = getPendingBatches();
      const inProgress = current.filter((b) => b.processingStatus === 'in_progress');

      for (const batch of inProgress) {
        try {
          const status = await checkBatchStatus(batch.batchId);
          updateBatchStatus(batch.batchId, {
            processingStatus: status.processingStatus,
            endedAt: status.endedAt,
            requestCounts: status.requestCounts,
          });
        } catch (err) {
          console.error('Failed to poll batch:', batch.batchId, err);
        }
      }

      setBatches(getPendingBatches());
    };

    pollBatches();
    pollIntervalRef.current = setInterval(pollBatches, 15000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [batches.filter((b) => b.processingStatus === 'in_progress').length]);

  const handleFetchResults = useCallback(async (batchId) => {
    setLoadingResults(batchId);
    try {
      const data = await fetchBatchResults(batchId);
      updateBatchStatus(batchId, { questions: data.questions });
      setBatches(getPendingBatches());
      setExpandedBatchId(batchId);
      setSelectedQuestions(new Set(data.questions.map((_, i) => i)));
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoadingResults(null);
    }
  }, []);

  const handleImport = useCallback(
    (batch) => {
      const questionsToImport = (batch.questions || []).filter((_, i) =>
        selectedQuestions.has(i)
      );

      for (const q of questionsToImport) {
        createQuestion({
          question: q.fr || q.question,
          translations: {
            en: q.en || '',
            fr: q.fr || q.question || '',
            de: q.de || '',
          },
          catId: batch.category,
        });
      }

      removeBatch(batch.batchId);
      setBatches(getPendingBatches());
      setExpandedBatchId(null);
      setSelectedQuestions(new Set());
    },
    [selectedQuestions, createQuestion]
  );

  const handleDismiss = useCallback((batchId) => {
    removeBatch(batchId);
    setBatches(getPendingBatches());
    setExpandedBatchId(null);
  }, []);

  const toggleQuestion = (index) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? `${cat.icon} ${cat.title}` : catId;
  };

  if (batches.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        {t('batch.title')}
      </h3>

      <div className="space-y-3">
        <AnimatePresence>
          {batches.map((batch) => (
            <motion.div
              key={batch.batchId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Batch header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Status indicator */}
                  {batch.processingStatus === 'in_progress' ? (
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                    </div>
                  ) : batch.processingStatus === 'ended' ? (
                    <div className="flex h-3 w-3">
                      <span className="inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </div>
                  ) : (
                    <div className="flex h-3 w-3">
                      <span className="inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </div>
                  )}

                  <div>
                    <p className="text-white font-medium text-sm">
                      {getCategoryName(batch.category)}
                      <span className="text-gray-500 ml-2">({batch.count} questions)</span>
                    </p>
                    <p className="text-gray-500 text-xs">
                      {batch.processingStatus === 'in_progress'
                        ? t('batch.inProgress')
                        : batch.processingStatus === 'ended'
                          ? t('batch.ended')
                          : batch.processingStatus}
                      {' · '}
                      {batch.createdAt && timeAgo(batch.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {batch.processingStatus === 'ended' && !batch.questions && (
                    <button
                      onClick={() => handleFetchResults(batch.batchId)}
                      disabled={loadingResults === batch.batchId}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingResults === batch.batchId
                        ? t('batch.fetchingResults')
                        : t('batch.viewResults')}
                    </button>
                  )}
                  {batch.questions && expandedBatchId !== batch.batchId && (
                    <button
                      onClick={() => {
                        setExpandedBatchId(batch.batchId);
                        setSelectedQuestions(new Set(batch.questions.map((_, i) => i)));
                      }}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('batch.viewResults')} ({batch.questions.length})
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(batch.batchId)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    title={t('batch.dismiss')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded results */}
              <AnimatePresence>
                {expandedBatchId === batch.batchId && batch.questions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Select controls */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-400 text-sm">
                          {t('batch.questionsReady', { count: batch.questions.length })}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedQuestions(new Set(batch.questions.map((_, i) => i)))
                            }
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            {t('batch.selectAll')}
                          </button>
                          <span className="text-gray-600">|</span>
                          <button
                            onClick={() => setSelectedQuestions(new Set())}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            {t('batch.deselectAll')}
                          </button>
                        </div>
                      </div>

                      {/* Question list */}
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {batch.questions.map((question, index) => (
                          <div
                            key={index}
                            onClick={() => toggleQuestion(index)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedQuestions.has(index)
                                ? 'bg-primary/10 border-primary/30'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  selectedQuestions.has(index)
                                    ? 'bg-primary border-primary'
                                    : 'border-gray-500'
                                }`}
                              >
                                {selectedQuestions.has(index) && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 text-sm">
                                <p className="text-white">{question.fr || question.question}</p>
                                {question.en && (
                                  <p className="text-gray-500 text-xs mt-0.5">{question.en}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Import button */}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => setExpandedBatchId(null)}
                          className="px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                        >
                          {t('batch.dismiss')}
                        </button>
                        <button
                          onClick={() => handleImport(batch)}
                          disabled={selectedQuestions.size === 0}
                          className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('batch.importSelected')} ({selectedQuestions.size})
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
