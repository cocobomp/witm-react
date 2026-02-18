import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import Section from '../components/ui/Section';
import useLangPrefix from '../hooks/useLangPrefix';

const SECTION_DEFS = [
  { id: 'acceptance', key: 'acceptance' },
  { id: 'responsibilities', key: 'responsibilities' },
  { id: 'intellectual-property', key: 'ip' },
  { id: 'liability', key: 'liability' },
  { id: 'termination', key: 'termination' },
  { id: 'governing-law', key: 'governingLaw' },
  { id: 'changes', key: 'changes' },
  { id: 'contact', key: 'contact' },
];

export default function TermsAndConditions() {
  const { t, i18n } = useTranslation('legal');
  const [activeId, setActiveId] = useState(SECTION_DEFS[0].id);

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
    SECTION_DEFS.forEach(({ id }) => {
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

  const renderSectionContent = (key) => {
    switch (key) {
      case 'responsibilities':
        return (
          <ul className="space-y-3 text-gray-500">
            {['item1', 'item2'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span className="leading-relaxed">{t(`terms.responsibilities.${item}`)}</span>
              </li>
            ))}
          </ul>
        );
      case 'contact':
        return (
          <>
            <p className="text-gray-500 leading-relaxed mb-3">{t('terms.contact.text')}</p>
            <a
              href={`mailto:${t('terms.contact.email')}`}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t('terms.contact.email')}
            </a>
          </>
        );
      default:
        return (
          <p className="text-gray-500 leading-relaxed">{t(`terms.${key}.text`)}</p>
        );
    }
  };

  return (
    <>
      <SEO
        title={t('terms.metaTitle')}
        description={t('terms.intro')}
        lang={i18n.language}
        canonical="https://whoisthemost.com/terms"
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
          <span className="text-gray-700 font-medium">{t('terms.breadcrumb')}</span>
        </nav>

        {/* Title area */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('terms.pageTitle')}
          </h1>
          <p className="text-sm text-gray-400 mb-5">
            Last updated: January 15, 2025
          </p>
          <p className="text-gray-500 leading-relaxed text-lg">
            {t('terms.intro')}
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
                {SECTION_DEFS.map(({ id, key }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToSection(id)}
                      className={`block w-full text-left text-sm py-1.5 pl-4 -ml-px border-l-2 transition-all duration-200 ${
                        activeId === id
                          ? 'border-primary text-primary font-medium'
                          : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t(`terms.${key}.title`)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {SECTION_DEFS.map(({ id, key }) => (
              <div key={id} id={id} className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  {t(`terms.${key}.title`)}
                </h2>
                {renderSectionContent(key)}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
