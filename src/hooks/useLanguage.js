import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export default function useLanguage() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const langFromPath = pathParts[0];

    if (langFromPath === 'fr' || langFromPath === 'de') {
      if (i18n.language !== langFromPath) {
        i18n.changeLanguage(langFromPath);
      }
    } else {
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
    }
  }, [location.pathname, i18n]);

  const switchLanguage = (lang) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentLangPrefix = ['fr', 'de'].includes(pathParts[0])
      ? pathParts[0]
      : null;

    let pathWithoutLang = currentLangPrefix
      ? '/' + pathParts.slice(1).join('/')
      : location.pathname;

    if (pathWithoutLang === '/') pathWithoutLang = '';

    const newPath =
      lang === 'en'
        ? pathWithoutLang || '/'
        : `/${lang}${pathWithoutLang}`;

    i18n.changeLanguage(lang);
    navigate(newPath);
  };

  return {
    currentLanguage: i18n.language,
    switchLanguage,
  };
}
