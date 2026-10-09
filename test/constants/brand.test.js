import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BRAND_ALTERNATE_NAMES,
  BRAND_NAME,
  FORMER_BRAND_NAME,
  siteNameFor,
  storeNameFor,
} from '../../src/constants/brand.js';

describe('brand', () => {
  it('is QELP, formerly WITM', () => {
    assert.equal(BRAND_NAME, 'QELP');
    assert.equal(FORMER_BRAND_NAME, 'WITM');
  });

  it('names the site with the descriptive half, in the page language', () => {
    assert.equal(siteNameFor('fr'), 'QELP – Qui est le plus ?');
    assert.equal(siteNameFor('en'), 'QELP – Who is the most?');
    assert.equal(siteNameFor('de'), 'QELP – Wer ist am meisten?');
  });

  it('falls back to English for a language the site does not have', () => {
    assert.equal(siteNameFor('it'), siteNameFor('en'));
    assert.equal(storeNameFor(undefined), storeNameFor('en'));
  });

  it('uses the store names of the apps', () => {
    assert.equal(storeNameFor('fr'), 'QELP : Qui est le plus ?');
    assert.equal(storeNameFor('en'), 'QELP: Who is the most?');
    assert.equal(storeNameFor('de'), 'QELP: Wer ist am meisten?');
  });

  it('keeps the old name and the descriptive names for search engines', () => {
    for (const name of ['WITM', 'Qui est le plus ?', 'Who is the most?', 'Wer ist am meisten?']) {
      assert.ok(BRAND_ALTERNATE_NAMES.includes(name), name);
    }
  });
});
