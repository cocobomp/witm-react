import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Section from '../components/ui/Section';
import useLangPrefix from '../hooks/useLangPrefix';
import { INFO_EMAIL } from '../constants/links';

export default function NotFound() {
  const { t } = useTranslation('common');
  const langPrefix = useLangPrefix();

  return (
    <Section>
      <div className="text-center py-16 sm:py-24 max-w-lg mx-auto">
        {/* Animated illustration */}
        <div className="relative w-48 h-48 mx-auto mb-10">
          {/* Background circles */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/5"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-primary/5"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          {/* 404 in the center */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-7xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent select-none">
              404
            </span>
          </motion.div>
          {/* Floating dots */}
          <motion.div
            className="absolute top-4 right-8 w-3 h-3 rounded-full bg-primary/20"
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-8 left-6 w-2 h-2 rounded-full bg-accent/30"
            animate={{ y: [3, -3, 3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
          <motion.div
            className="absolute top-12 left-4 w-2 h-2 rounded-full bg-primary/15"
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('notFound.title')}
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            {t('notFound.description')}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mb-10"
        >
          <Link
            to={langPrefix || '/'}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-primary/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('notFound.backToHome')}
          </Link>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 text-sm"
        >
          <Link
            to={`${langPrefix}/blog`}
            className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {t('notFound.blog')}
          </Link>
          <Link
            to={`${langPrefix}/privacy-policy`}
            className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {t('notFound.privacy')}
          </Link>
          <a
            href={`mailto:${INFO_EMAIL}`}
            className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('notFound.contact')}
          </a>
        </motion.div>
      </div>
    </Section>
  );
}
