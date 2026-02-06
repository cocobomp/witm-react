import { useEffect } from 'react';

export default function SEO({
  title,
  description,
  keywords,
  lang = 'en',
  canonical,
}) {
  const siteName = 'WITM - Who Is The Most';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

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
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [fullTitle, description, keywords, lang, canonical]);

  return null;
}
