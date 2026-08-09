import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEO from '../components/seo/SEO';
import Section from '../components/ui/Section';
import StoreBadges from '../components/ui/StoreBadges';
import { buildJoinDeepLink, STORE_CAMPAIGNS } from '../constants/links';

const MIN_PIN_LENGTH = 3; // app room PINs are 3 digits
const MAX_PIN_LENGTH = 8;
const AUTO_OPEN_DELAY_MS = 800;
const COPIED_FEEDBACK_MS = 2000;

function sanitizePin(rawPin) {
  return (rawPin || '').replace(/\D/g, '').slice(0, MAX_PIN_LENGTH);
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function DownloadPanel({ title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 sm:p-10 text-left shadow-xl shadow-primary/20"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/80 mb-6 leading-relaxed">{description}</p>
      <StoreBadges campaign={STORE_CAMPAIGNS.join} />
    </motion.div>
  );
}

function PinCard({ pin, pinLabel, copyLabel, copiedLabel }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(pin);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard unavailable (permissions, insecure context) — silently ignore.
    }
  }, [pin]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="inline-flex flex-col items-center gap-3 rounded-3xl border border-gray-100 bg-white px-10 py-8 shadow-xl shadow-primary/10 mb-8"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {pinLabel}
      </span>
      <span
        aria-label={`${pinLabel}: ${pin.split('').join(' ')}`}
        className="text-5xl sm:text-6xl font-bold tracking-[0.3em] bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent select-all"
      >
        {pin}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-live="polite"
        className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold text-primary hover:bg-primary/5 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {isCopied ? copiedLabel : copyLabel}
      </button>
    </motion.div>
  );
}

function InvalidInvite({ t }) {
  return (
    <div className="text-center py-16 sm:py-24 max-w-lg mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
        {t('invalidTitle')}
      </h1>
      <p className="text-gray-500 mb-10 leading-relaxed">{t('invalidDescription')}</p>
      <DownloadPanel title={t('noAppTitle')} description={t('noAppDescription')} />
    </div>
  );
}

export default function JoinRoom() {
  const { pin: rawPin } = useParams();
  const { t, i18n } = useTranslation('join');

  const pin = sanitizePin(rawPin);
  const isValidPin = pin.length >= MIN_PIN_LENGTH;
  const deepLink = buildJoinDeepLink(pin);

  const handleOpenApp = useCallback(() => {
    window.location.href = deepLink;
  }, [deepLink]);

  useEffect(() => {
    // Best-effort auto-open on mobile. If the app is installed and the
    // universal link / App Link is verified, the OS opens the app before
    // this page even renders; this covers the custom-scheme fallback.
    if (!isValidPin || !isMobileDevice()) return undefined;
    const timer = setTimeout(() => {
      window.location.href = buildJoinDeepLink(pin);
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isValidPin, pin]);

  return (
    <Section>
      <SEO
        title={t('meta.title')}
        description={t('meta.description')}
        lang={i18n.language}
      />
      {!isValidPin ? (
        <InvalidInvite t={t} />
      ) : (
        <div className="text-center py-16 sm:py-24 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-gray-500 mb-10 leading-relaxed">{t('subtitle')}</p>
          </motion.div>

          <PinCard
            pin={pin}
            pinLabel={t('pinLabel')}
            copyLabel={t('copyPin')}
            copiedLabel={t('copied')}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-4"
          >
            <button
              type="button"
              onClick={handleOpenApp}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-primary/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t('openApp')}
            </button>
          </motion.div>

          <p className="text-sm text-gray-400 mb-12">{t('openAppHint')}</p>

          <DownloadPanel title={t('noAppTitle')} description={t('noAppDescription')} />
        </div>
      )}
    </Section>
  );
}
