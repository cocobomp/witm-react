import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const languages = [
  { code: 'en', label: 'EN', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'fr', label: 'FR', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'de', label: 'DE', flag: '\u{1F1E9}\u{1F1EA}' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Compute the sliding indicator position
  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = languages.findIndex((l) => l.code === i18n.language);
    const buttons = containerRef.current.querySelectorAll('[data-lang-btn]');
    if (buttons[activeIndex]) {
      const btn = buttons[activeIndex];
      setIndicatorStyle({
        width: btn.offsetWidth,
        transform: `translateX(${btn.offsetLeft}px)`,
      });
    }
  }, [i18n.language]);

  const handleSwitch = (langCode) => {
    i18n.changeLanguage(langCode);

    // Strip existing language prefix from path
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentLangPrefix = ['fr', 'de'].includes(pathParts[0])
      ? pathParts[0]
      : null;

    let pathWithoutLang = currentLangPrefix
      ? '/' + pathParts.slice(1).join('/')
      : location.pathname;

    if (pathWithoutLang === '/') pathWithoutLang = '';

    const newPath =
      langCode === 'en'
        ? pathWithoutLang || '/'
        : `/${langCode}${pathWithoutLang}`;

    navigate(newPath);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex bg-gray-100/80 rounded-full p-0.5"
    >
      {/* Sliding background indicator */}
      <div
        className="absolute top-0.5 left-0 h-[calc(100%-4px)] bg-primary rounded-full shadow-sm transition-all duration-300 ease-out"
        style={indicatorStyle}
      />

      {languages.map((lang) => {
        const isActive = i18n.language === lang.code;
        return (
          <button
            key={lang.code}
            data-lang-btn
            onClick={() => handleSwitch(lang.code)}
            className={`relative z-10 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
              isActive
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-sm leading-none">{lang.flag}</span>
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
