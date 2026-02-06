import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/seo/SEO';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useLangPrefix from '../hooks/useLangPrefix';

const STEPS = [
  { key: 'signIn', icon: '1' },
  { key: 'confirm', icon: '2' },
  { key: 'deleted', icon: '3' },
];

export default function DeleteAccount() {
  const { t, i18n } = useTranslation('legal');
  const { user, loading, error, signInWithGoogle, deleteAccount } =
    useFirebaseAuth();
  const [deleted, setDeleted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const langPrefix = useLangPrefix();

  // Determine current step (0-indexed)
  const currentStep = deleted ? 2 : user ? 1 : 0;

  const handleDelete = async () => {
    const success = await deleteAccount();
    if (success) {
      setDeleted(true);
      setConfirming(false);
    }
  };

  return (
    <>
      <SEO
        title={t('deleteAccount.metaTitle')}
        description={t('deleteAccount.intro')}
        lang={i18n.language}
        canonical="https://whoisthemost.com/delete-account"
      />

      <Section>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to={langPrefix || '/'} className="hover:text-primary transition-colors">
            Home
          </Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">{t('deleteAccount.breadcrumb')}</span>
        </nav>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('deleteAccount.pageTitle')}
          </h1>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 my-10">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      index <= currentStep ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {index === 0 ? 'Sign in' : index === 1 ? 'Confirm' : 'Done'}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-[2px] mx-3 mb-5 rounded-full transition-colors duration-300 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {deleted ? (
              <motion.div
                key="deleted"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-800 font-semibold text-lg mb-2">
                  Account deleted successfully.
                </p>
                <p className="text-green-600 text-sm mb-6">
                  All your data has been permanently removed.
                </p>
                <Link
                  to={langPrefix || '/'}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="flow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Warning Card */}
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-6 mb-8 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-amber-800 leading-relaxed text-sm">
                    {t('deleteAccount.intro')}
                  </p>
                </div>

                {/* Permanent Deletion Info */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('deleteAccount.permanentTitle')}
                  </h2>
                  <ul className="space-y-3">
                    {['item1', 'item2', 'item3'].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center mt-0.5 shrink-0">
                          <svg
                            className="w-3 h-3 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-sm leading-relaxed">{t(`deleteAccount.permanentItems.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="mb-10">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('deleteAccount.instructionsTitle')}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    {t('deleteAccount.instructionsIntro')}
                  </p>
                  <ul className="space-y-2 text-gray-500 text-sm">
                    {['item1', 'item2', 'item3'].map((key) => (
                      <li key={key} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="leading-relaxed">{t(`deleteAccount.instructionsItems.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Delete Card */}
                <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('deleteAccount.cardTitle')}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                    {t('deleteAccount.cardDescription')}
                  </p>

                  {/* Error display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 text-sm text-left">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!user ? (
                    <button
                      onClick={signInWithGoogle}
                      disabled={loading}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Google logo */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {loading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                  ) : confirming ? (
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Deleting...
                          </span>
                        ) : (
                          t('deleteAccount.confirmButton')
                        )}
                      </button>
                      <Button
                        variant="ghost"
                        onClick={() => setConfirming(false)}
                      >
                        {t('deleteAccount.cancelButton')}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Signed in as <span className="font-medium text-gray-700">{user.email}</span>
                      </p>
                      <button
                        onClick={() => setConfirming(true)}
                        className="px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {t('deleteAccount.confirmButton')}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </>
  );
}
