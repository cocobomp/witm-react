import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const LANGUAGES = ['en', 'fr', 'de'];
const NAMESPACES = ['common', 'home', 'legal', 'blog', 'join'];

/** « 4,8 sur 150 avis », « 4.8/5 », « 4.8 ★ », « 150 reviews », « 150 Bewertungen ». */
const RATING_CLAIM =
  /\d[.,]\d\s*(\/\s*5|★|⭐|(sur|out of|von) 5|(sur|from|aus) \d+)|\d+\s*(avis|reviews|ratings|Bewertungen)\b/i;

function load(language, namespace) {
  const url = new URL(`../../src/locales/${language}/${namespace}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}

describe('ratings in the translations', () => {
  it('recognise a rating claim', () => {
    for (const claim of ['4,8 sur 150 avis', '4.8/5', '4.8 ★', '150 reviews', '150 Bewertungen']) {
      assert.match(claim, RATING_CLAIM, claim);
    }
  });

  it('quote no store rating and no review count', () => {
    for (const language of LANGUAGES) {
      for (const namespace of NAMESPACES) {
        const text = JSON.stringify(load(language, namespace));
        assert.doesNotMatch(text, RATING_CLAIM, `${language}/${namespace}`);
      }
    }
  });

  it('give the testimonials no star rating', () => {
    for (const language of LANGUAGES) {
      for (const review of load(language, 'home').testimonials.reviews) {
        assert.ok(!('stars' in review), `${language}: ${review.name}`);
      }
    }
  });
});
