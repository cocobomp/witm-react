import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import useLangPrefix from '../../hooks/useLangPrefix';
import { APP_STORE_URL, GOOGLE_PLAY_URL, INSTAGRAM_URL, TIKTOK_URL } from '../../constants/links';

export default function Footer() {
  const { t } = useTranslation('common');
  const langPrefix = useLangPrefix();

  const navLinks = [
    { label: t('footer.home'), to: `${langPrefix}/` },
    { label: t('footer.about'), to: `${langPrefix}/#about` },
    { label: t('footer.privacy'), to: `${langPrefix}/privacy-policy` },
    { label: t('footer.terms'), to: `${langPrefix}/terms` },
    { label: t('footer.deleteAccount'), to: `${langPrefix}/delete-account` },
  ];

  return (
    <footer className="bg-dark text-white relative">
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #6366f1, #8b5cf6, #6366f1, transparent)',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
          {/* Column 1: Brand + Contact */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src="/img/logo.png" alt="WITM" className="h-10 w-10" />
              <span className="font-bold text-xl tracking-tight">WITM</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t('footer.brandTagline')}
            </p>

            <div className="space-y-2 text-gray-400 text-sm mb-8">
              <p>{t('footer.address')}</p>
              <p>{t('footer.city')}</p>
              <p>
                {t('footer.emailLabel')}{' '}
                <a
                  href={`mailto:${t('footer.email')}`}
                  className="text-primary-light hover:text-white transition-colors"
                >
                  {t('footer.email')}
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-surface flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-surface flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all duration-200"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.78a8.18 8.18 0 003.76.92V6.27a4.83 4.83 0 01-3.77.42z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-5">
              {t('footer.pages')}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Download + App */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-5">
              {t('footer.downloadTitle')}
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('footer.downloadDescription')}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-dark-surface hover:bg-gray-700 transition-colors duration-200 rounded-xl px-5 py-3 w-fit"
              >
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none">Download on the</div>
                  <div className="text-sm font-semibold text-white leading-tight">App Store</div>
                </div>
              </a>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-dark-surface hover:bg-gray-700 transition-colors duration-200 rounded-xl px-5 py-3 w-fit"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.68c.17.16.38.24.63.24.13 0 .25-.03.36-.07l11.33-5.71-3.2-3.2L3.18 23.68zM.32 1.34A1.32 1.32 0 000 2.2v19.6c0 .35.11.65.32.86l11.02-11.02L.32 1.34zM23.16 10.5l-3.63-2.05-3.8 3.8 3.8 3.57 3.63-1.84c.56-.28.84-.7.84-1.24s-.28-.96-.84-1.24zM15.67 7.7L4.5.38C4.28.22 4.07.17 3.81.17l11.14 11.14 .72-.72L15.67 7.7z" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none">Get it on</div>
                  <div className="text-sm font-semibold text-white leading-tight">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} WITM {t('footer.allRightsReserved')}
              <Link
                to="/admin"
                className="ml-3 text-gray-600 hover:text-gray-400 transition-colors"
                title="Admin"
              >
                &bull;
              </Link>
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
