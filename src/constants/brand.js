/**
 * The app's public name. « QELP » (from « Qui Est Le Plus ») replaced
 * « WITM » in every language with app 3.5.3; the domain, the routes and the
 * store links did not change.
 */
export const BRAND_NAME = 'QELP';

/**
 * The name the app had before 3.5.3. It stays in titles, descriptions,
 * keywords and structured data so that people who search for it still land
 * on this site.
 */
export const FORMER_BRAND_NAME = 'WITM';

/** The descriptive half of the store name, per site language. */
export const BRAND_TAGLINES = {
  en: 'Who is the most?',
  fr: 'Qui est le plus ?',
  de: 'Wer ist am meisten?',
};

/** The other names people know the app by, for search engines. */
export const BRAND_ALTERNATE_NAMES = [
  FORMER_BRAND_NAME,
  BRAND_TAGLINES.fr,
  BRAND_TAGLINES.en,
  BRAND_TAGLINES.de,
];

/** The app's name on the App Store and Google Play, per site language. */
export const STORE_NAMES = {
  en: `${BRAND_NAME}: ${BRAND_TAGLINES.en}`,
  fr: `${BRAND_NAME} : ${BRAND_TAGLINES.fr}`,
  de: `${BRAND_NAME}: ${BRAND_TAGLINES.de}`,
};

const DEFAULT_LANGUAGE = 'en';

/** « QELP – Qui est le plus ? »: the site name, in the page's language. */
export function siteNameFor(language) {
  const tagline = BRAND_TAGLINES[language] ?? BRAND_TAGLINES[DEFAULT_LANGUAGE];
  return `${BRAND_NAME} – ${tagline}`;
}

/** « QELP : Qui est le plus ? »: the store name, in the page's language. */
export function storeNameFor(language) {
  return STORE_NAMES[language] ?? STORE_NAMES[DEFAULT_LANGUAGE];
}
