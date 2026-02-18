import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import useLangPrefix from '../../hooks/useLangPrefix';
import { INSTAGRAM_URL, TIKTOK_URL } from '../../constants/links';
import StoreBadges from '../ui/StoreBadges';

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
            <StoreBadges className="flex-col" variant="dark" />
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
              <span className="mx-2 text-gray-600">&middot;</span>
              <span>
                {t('footer.madeBy', 'Developed by')}{' '}
                <a
                  href="https://bompard.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-400 transition-colors"
                >
                  Bompard Digital
                </a>
              </span>
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
