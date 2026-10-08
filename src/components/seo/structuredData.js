import {
  BRAND_ALTERNATE_NAMES,
  BRAND_NAME,
  storeNameFor,
} from '../../constants/brand.js';
import { INSTAGRAM_URL, TIKTOK_URL } from '../../constants/links.js';

export const SITE_URL = 'https://whoisthemost.com';

// schema.org's inLanguage wants a BCP 47 tag.
const SCHEMA_LANGUAGES = { en: 'en', fr: 'fr', de: 'de' };
const DEFAULT_APP_DESCRIPTION = 'The party game that reveals what your friends really think!';

/**
 * The page's JSON-LD graph.
 *
 * The app carries no aggregateRating: the stores hold too few ratings to
 * quote, and search engines show a page's claimed rating as if it were real.
 *
 * @param {object} page
 * @param {string} page.lang  en, fr or de
 * @param {string} page.siteName  the site's name in that language
 * @param {string} [page.description]
 * @param {string} [page.canonical]
 * @param {{title: string, date: string, author: string}} [page.article]
 */
export function buildStructuredData({ lang, siteName, description, canonical, article }) {
  const schemas = [
    {
      '@type': 'Organization',
      name: BRAND_NAME,
      alternateName: BRAND_ALTERNATE_NAMES,
      url: SITE_URL,
      logo: `${SITE_URL}/img/logo.png`,
      sameAs: [INSTAGRAM_URL, TIKTOK_URL],
    },
    {
      '@type': 'WebSite',
      name: BRAND_NAME,
      alternateName: [siteName, ...BRAND_ALTERNATE_NAMES],
      url: SITE_URL,
      inLanguage: SCHEMA_LANGUAGES[lang] || 'en',
    },
    {
      '@type': 'SoftwareApplication',
      name: storeNameFor(lang),
      alternateName: [BRAND_NAME, ...BRAND_ALTERNATE_NAMES],
      applicationCategory: 'GameApplication',
      operatingSystem: 'iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CHF',
      },
      description: description || DEFAULT_APP_DESCRIPTION,
    },
  ];

  if (article) {
    schemas.push({
      '@type': 'Article',
      headline: article.title,
      datePublished: article.date,
      author: { '@type': 'Person', name: article.author },
      publisher: { '@type': 'Organization', name: BRAND_NAME },
      mainEntityOfPage: canonical,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}
