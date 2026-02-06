import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enLegal from './locales/en/legal.json'
import enBlog from './locales/en/blog.json'
import enAdmin from './locales/en/admin.json'

import frCommon from './locales/fr/common.json'
import frHome from './locales/fr/home.json'
import frLegal from './locales/fr/legal.json'
import frBlog from './locales/fr/blog.json'
import frAdmin from './locales/fr/admin.json'

import deCommon from './locales/de/common.json'
import deHome from './locales/de/home.json'
import deLegal from './locales/de/legal.json'
import deBlog from './locales/de/blog.json'
import deAdmin from './locales/de/admin.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, home: enHome, legal: enLegal, blog: enBlog, admin: enAdmin },
      fr: { common: frCommon, home: frHome, legal: frLegal, blog: frBlog, admin: frAdmin },
      de: { common: deCommon, home: deHome, legal: deLegal, blog: deBlog, admin: deAdmin },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'de'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['path', 'navigator'],
      lookupFromPathIndex: 0,
    },
  })

export default i18n
