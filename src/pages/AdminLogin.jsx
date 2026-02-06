import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading, error, signInWithGoogle, clearError } = useAuth();

  // Redirect if already authenticated and is admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  // Check for unauthorized error in URL
  const urlError = searchParams.get('error');

  const handleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();
    if (result.success) {
      navigate('/admin', { replace: true });
    }
  };

  const displayError = error || urlError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-surface to-dark flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="gradient-text">WITM</span>
            </h1>
            <p className="text-gray-400 text-sm">{t('login.title', 'Admin Access')}</p>
          </div>

          {/* Error message */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <p className="text-red-400 text-sm text-center">
                {displayError === 'unauthorized'
                  ? t('login.unauthorized', 'Your email is not authorized for admin access')
                  : displayError}
              </p>
            </motion.div>
          )}

          {/* Description */}
          <p className="text-gray-400 text-center mb-8">
            {t('login.description', 'Sign in with an authorized Google account to access the admin dashboard.')}
          </p>

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('login.signIn', 'Sign in with Google')}
              </>
            )}
          </button>

          {/* Back link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              &larr; {t('login.backToSite', 'Back to website')}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
