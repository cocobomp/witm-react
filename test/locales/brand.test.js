import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const LANGUAGES = ['en', 'fr', 'de'];
const NAMESPACES = ['common', 'home', 'legal', 'blog', 'join'];

/** Texts printed next to the QELP logo, where WITM may stand without it. */
const KEYS_NEXT_TO_LOGO = new Set(['hero.formerly', 'footer.brandTagline']);

function load(language, namespace) {
  const url = new URL(`../../src/locales/${language}/${namespace}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}

function entriesOf(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' ? entriesOf(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]],
  );
}

describe('brand in the translations', () => {
  it('names WITM only as the former name of QELP', () => {
    for (const language of LANGUAGES) {
      for (const namespace of NAMESPACES) {
        for (const [key, text] of entriesOf(load(language, namespace))) {
          if (typeof text !== 'string' || !text.includes('WITM')) continue;
          if (KEYS_NEXT_TO_LOGO.has(key)) continue;
          assert.ok(text.includes('QELP'), `${language}/${namespace}:${key}`);
        }
      }
    }
  });

  it('title the home page QELP and keep WITM in its title, description and keywords', () => {
    for (const language of LANGUAGES) {
      const { meta } = load(language, 'common');
      for (const field of ['siteTitle', 'siteDescription', 'siteKeywords']) {
        assert.match(meta[field], /QELP/, `${language} ${field}`);
        assert.match(meta[field], /WITM/, `${language} ${field}`);
      }
      assert.match(meta.siteTitle, /^QELP – /, language);
    }
  });

  it('have the same keys in every language for the renamed pages', () => {
    for (const namespace of ['common', 'home']) {
      const englishKeys = entriesOf(load('en', namespace)).map(([key]) => key).sort();
      for (const language of LANGUAGES) {
        const keys = entriesOf(load(language, namespace)).map(([key]) => key).sort();
        assert.deepEqual(keys, englishKeys, `${language}/${namespace}`);
      }
    }
  });
});
