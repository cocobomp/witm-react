import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import Section from '../components/ui/Section';
import useLangPrefix from '../hooks/useLangPrefix';

const SECTIONS = [
  { id: 'info-collected', key: 'infoCollected' },
  { id: 'how-used', key: 'howUsed' },
  { id: 'data-sharing', key: 'dataSharing' },
  { id: 'your-rights', key: 'rights' },
  { id: 'security', key: 'security' },
  { id: 'changes', key: 'changes' },
  { id: 'contact', key: 'contact' },
];

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation('legal');
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const langPrefix = useLangPrefix();

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <SEO
        title={t('privacyPolicy.metaTitle')}
        description={t('privacyPolicy.intro')}
        lang={i18n.language}
        canonical="https://whoisthemost.com/privacy-policy"
      />

      <Section>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to={langPrefix || '/'} className="hover:text-primary transition-colors">
            Home
          </Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">{t('privacyPolicy.breadcrumb')}</span>
        </nav>

        {/* Title area */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('privacyPolicy.pageTitle')}
          </h1>
          <p className="text-sm text-gray-400 mb-5">
            Last updated: January 15, 2025
          </p>
          <p className="text-gray-500 leading-relaxed text-lg">
            {t('privacyPolicy.intro')}
          </p>
        </div>

        <div className="flex gap-12 lg:gap-16">
          {/* Sidebar Navigation (sticky on desktop) */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                On this page
              </p>
              <ul className="space-y-1 border-l border-gray-200">
                {SECTIONS.map(({ id, key }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToSection(id)}
                      className={`block w-full text-left text-sm py-1.5 pl-4 -ml-px border-l-2 transition-all duration-200 ${
                        activeId === id
                          ? 'border-primary text-primary font-medium'
                          : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t(`privacyPolicy.${key}.title`)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Information Collected */}
            <div id="info-collected" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.infoCollected.title')}
              </h2>
              <div className="space-y-5">
                {['personalInfo', 'usageData', 'deviceInfo', 'locationData'].map(
                  (key) => (
                    <div key={key}>
                      <h3 className="font-medium text-gray-800 mb-1">
                        {t(`privacyPolicy.infoCollected.${key}.label`)}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {t(`privacyPolicy.infoCollected.${key}.text`)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* How We Use */}
            <div id="how-used" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.howUsed.title')}
              </h2>
              <ul className="space-y-3 text-gray-500">
                {['item1', 'item2', 'item3', 'item4', 'item5'].map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="leading-relaxed">{t(`privacyPolicy.howUsed.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Sharing */}
            <div id="data-sharing" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.dataSharing.title')}
              </h2>
              <p className="text-gray-500 mb-4 leading-relaxed">
                {t('privacyPolicy.dataSharing.intro')}
              </p>
              <ul className="space-y-3 text-gray-500">
                {['item1', 'item2', 'item3'].map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="leading-relaxed">{t(`privacyPolicy.dataSharing.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Your Rights */}
            <div id="your-rights" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.rights.title')}
              </h2>
              <p className="text-gray-500 mb-4 leading-relaxed">
                {t('privacyPolicy.rights.intro')}
              </p>
              <ul className="space-y-3 text-gray-500">
                {['item1', 'item2', 'item3'].map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="leading-relaxed">{t(`privacyPolicy.rights.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 mt-4 leading-relaxed">
                {t('privacyPolicy.rights.retention')}
              </p>
            </div>

            {/* Security */}
            <div id="security" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.security.title')}
              </h2>
              <p className="text-gray-500 leading-relaxed">
                {t('privacyPolicy.security.text')}
              </p>
            </div>

            {/* Changes */}
            <div id="changes" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.changes.title')}
              </h2>
              <p className="text-gray-500 leading-relaxed">
                {t('privacyPolicy.changes.text')}
              </p>
            </div>

            {/* Contact */}
            <div id="contact" className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {t('privacyPolicy.contact.title')}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-3">
                {t('privacyPolicy.contact.text')}
              </p>
              <a
                href={`mailto:${t('privacyPolicy.contact.email')}`}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {t('privacyPolicy.contact.email')}
              </a>
              <p className="text-gray-500 mt-3 leading-relaxed">
                {t('privacyPolicy.contact.closing')}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
