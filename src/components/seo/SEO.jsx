import { useEffect } from 'react';

const LOCALE_MAP = { en: 'en_US', fr: 'fr_FR', de: 'de_DE' };

export default function SEO({
  title,
  description,
  keywords,
  lang = 'en',
  canonical,
  image = '/img/logo.png',
  article,
}) {
  const siteName = 'WITM - Who Is The Most';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = 'https://whoisthemost.com';
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

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
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', fullImage);
    setMeta('property', 'og:locale', LOCALE_MAP[lang] || 'en_US');
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
        name: 'WITM - Who Is The Most',
        url: siteUrl,
        logo: `${siteUrl}/img/logo.png`,
        sameAs: [
          'https://www.instagram.com/witm_whoisthemost',
          'https://tiktok.com/@witm_whoisthemost',
        ],
      },
      {
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        inLanguage: LOCALE_MAP[lang] || 'en_US',
      },
    ];

    if (article) {
      schemas.push({
        '@type': 'Article',
        headline: article.title,
        datePublished: article.date,
        author: { '@type': 'Person', name: article.author },
        publisher: { '@type': 'Organization', name: 'WITM' },
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
  }, [fullTitle, description, keywords, lang, canonical, fullImage, article]);

  return null;
}
