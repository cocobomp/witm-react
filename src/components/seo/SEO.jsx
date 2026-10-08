import { useEffect } from 'react';

import {
  BRAND_ALTERNATE_NAMES,
  BRAND_NAME,
  siteNameFor,
  storeNameFor,
} from '../../constants/brand';
import { INSTAGRAM_URL, TIKTOK_URL } from '../../constants/links';

const LOCALE_MAP = { en: 'en_US', fr: 'fr_FR', de: 'de_DE' };
const SITE_URL = 'https://whoisthemost.com';

/** « Page | QELP – Qui est le plus ? », or the title alone when it is whole. */
function pageTitle(title, siteName, isFullTitle) {
  if (!title) return siteName;
  if (isFullTitle) return title;
  return `${title} | ${siteName}`;
}

/**
 * @param {boolean} isFullTitle  the title already names the site (the home
 *   page's « QELP – Qui est le plus ? (anciennement WITM) »), so it gets no
 *   « | site name » suffix
 */
export default function SEO({
  title,
  isFullTitle = false,
  description,
  keywords,
  lang = 'en',
  canonical,
  image = '/img/logo.png',
  article,
}) {
  const siteName = siteNameFor(lang);
  const fullTitle = pageTitle(title, siteName, isFullTitle);
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);

    // Open Graph tags
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', fullImage);
    setMeta('property', 'og:type', article ? 'article' : 'website');
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:locale', LOCALE_MAP[lang] || 'en_US');

    // Twitter Card tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', fullImage);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // JSON-LD structured data
    const jsonLdId = 'seo-jsonld';
    let script = document.getElementById(jsonLdId);
    if (!script) {
      script = document.createElement('script');
      script.id = jsonLdId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

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
        inLanguage: LOCALE_MAP[lang] || 'en_US',
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
        description: description || 'The party game that reveals what your friends really think!',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '150',
        },
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

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': schemas,
    });

    return () => {
      const el = document.getElementById(jsonLdId);
      if (el) el.remove();
    };
  }, [fullTitle, siteName, description, keywords, lang, canonical, fullImage, article]);

  return null;
}
