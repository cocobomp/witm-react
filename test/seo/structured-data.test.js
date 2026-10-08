import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildStructuredData } from '../../src/components/seo/structuredData.js';

const LANGUAGES = ['en', 'fr', 'de'];
const ARTICLE = { title: 'Title', date: '2026-10-08', author: 'QELP' };
const RATING_KEYS = /aggregateRating|AggregateRating|"review"|"Review"|ratingValue|ratingCount|reviewCount/;

function graphFor(lang, article) {
  return buildStructuredData({
    lang,
    siteName: 'QELP',
    description: 'Description',
    canonical: 'https://whoisthemost.com/',
    article,
  });
}

describe('structured data', () => {
  it('claims no rating and no review count in any language', () => {
    for (const lang of LANGUAGES) {
      for (const article of [undefined, ARTICLE]) {
        assert.doesNotMatch(JSON.stringify(graphFor(lang, article)), RATING_KEYS, lang);
      }
    }
  });

  it('still describes the app as a free game', () => {
    const app = graphFor('fr')['@graph'].find((node) => node['@type'] === 'SoftwareApplication');
    assert.equal(app.applicationCategory, 'GameApplication');
    assert.equal(app.offers.price, '0');
  });

  it('adds the article only on a blog post', () => {
    const types = (article) => graphFor('en', article)['@graph'].map((node) => node['@type']);
    assert.ok(!types(undefined).includes('Article'));
    assert.ok(types(ARTICLE).includes('Article'));
  });
});
