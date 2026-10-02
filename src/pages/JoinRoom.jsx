import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEO from '../components/seo/SEO';
import Section from '../components/ui/Section';
import StoreBadges from '../components/ui/StoreBadges';
import {
  buildAppStoreUrl,
  buildGooglePlayUrl,
  buildJoinDeepLink,
  JOIN_INVITER_PARAM,
  STORE_CAMPAIGNS,
} from '../constants/links';
import { copyText } from '../utils/clipboard';
import { parseInviterName } from '../utils/inviterName';
import { copyTextFor, displayPin, parseJoinPin } from '../utils/pinFormat';
import { currentMobilePlatform, MOBILE_PLATFORMS } from '../utils/platform';

const AUTO_OPEN_DELAY_MS = 800;
const COPIED_FEEDBACK_MS = 2000;

function storeUrlFor(platform) {
  return platform === MOBILE_PLATFORMS.android
    ? buildGooglePlayUrl(STORE_CAMPAIGNS.join)
    : buildAppStoreUrl(STORE_CAMPAIGNS.join);
}

/**
 * Best-effort auto-open on mobile. If the app is installed and the universal
 * link / App Link is verified, the OS opens the app before this page even
 * renders; this covers the custom-scheme fallback.
 */
function useAutoOpenApp(deepLink) {
  useEffect(() => {
    if (!deepLink || !currentMobilePlatform()) return undefined;
    const timer = setTimeout(() => {
      window.location.href = deepLink;
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [deepLink]);
}

/**
 * Copies « WITM 42 » then opens this phone's store (spec 3.5 §4.4): once
 * installed, the app's « Paste the code » chip finds the code waiting.
 */
function CopyAndInstallButton({ pin, platform, label }) {
  const handleClick = useCallback(async () => {
    await copyText(copyTextFor(pin));
    window.location.href = storeUrlFor(platform);
  }, [pin, platform]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3.5 mb-5 rounded-full bg-white text-primary font-semibold shadow-lg shadow-black/10 hover:scale-[1.02] transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  );
}

function DownloadPanel({ title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 sm:p-10 text-left shadow-xl shadow-primary/20"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/80 mb-6 leading-relaxed">{description}</p>
      {children}
      <StoreBadges campaign={STORE_CAMPAIGNS.join} />
    </motion.div>
  );
}

function CodeCard({ pin, codeLabel, copyLabel, copiedLabel }) {
  const [isCopied, setIsCopied] = useState(false);
  const code = displayPin(pin);

  const handleCopy = useCallback(async () => {
    if (!(await copyText(copyTextFor(pin)))) return;
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
  }, [pin]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="inline-flex flex-col items-center gap-3 rounded-3xl border border-gray-100 bg-white px-10 py-8 shadow-xl shadow-primary/10 mb-8"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {codeLabel}
      </span>
      <span
        aria-label={`${codeLabel}: ${code.split('').join(' ')}`}
        className="text-5xl sm:text-6xl font-bold tracking-[0.3em] bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent select-all"
      >
        {code}
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

function OpenAppButton({ deepLink, label }) {
  const handleOpenApp = useCallback(() => {
    window.location.href = deepLink;
  }, [deepLink]);

  return (
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
        {label}
      </button>
    </motion.div>
  );
}

function InviteHeading({ inviterName, t }) {
  const title = inviterName ? t('titleWithInviter', { name: inviterName }) : t('title');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight break-words">
        {title}
      </h1>
      <p className="text-gray-500 mb-10 leading-relaxed">{t('subtitle')}</p>
    </motion.div>
  );
}

function ValidInvite({ pin, inviterName, deepLink, t }) {
  const platform = currentMobilePlatform();

  return (
    <div className="text-center py-16 sm:py-24 max-w-lg mx-auto">
      <InviteHeading inviterName={inviterName} t={t} />
      <CodeCard pin={pin} codeLabel={t('codeLabel')} copyLabel={t('copyCode')} copiedLabel={t('copied')} />
      <OpenAppButton deepLink={deepLink} label={t('openApp')} />
      <p className="text-sm text-gray-400 mb-12">{t('openAppHint')}</p>
      <DownloadPanel title={t('noAppTitle')} description={t('noAppDescription')}>
        {platform && <CopyAndInstallButton pin={pin} platform={platform} label={t('copyAndInstall')} />}
      </DownloadPanel>
    </div>
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

/**
 * Web fallback of the invite link `whoisthemost.com/j/<code>?n=<host>`, for
 * people without the app. Reads the link as the app 3.5 does: a 2- or 3-digit
 * code (stored PIN: 3 digits), shown as players read it in the lobby, and the
 * inviter's name when the link carries one.
 */
export default function JoinRoom() {
  const { pin: rawPin } = useParams();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation('join');

  const pin = parseJoinPin(rawPin);
  const inviterName = parseInviterName(searchParams.get(JOIN_INVITER_PARAM));
  const deepLink = pin ? buildJoinDeepLink(pin, inviterName) : null;
  useAutoOpenApp(deepLink);

  return (
    <Section>
      <SEO
        title={t('meta.title')}
        description={t('meta.description')}
        lang={i18n.language}
      />
      {pin ? (
        <ValidInvite pin={pin} inviterName={inviterName} deepLink={deepLink} t={t} />
      ) : (
        <InvalidInvite t={t} />
      )}
    </Section>
  );
}
