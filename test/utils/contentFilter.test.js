import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BLOCKED_STEMS, BLOCKED_WORDS } from '../../src/constants/contentFilterWords.js';
import { isCleanText, normaliseText } from '../../src/utils/contentFilter.js';

// Same cases as the app's test/core/moderation/content_filter_test.dart.
describe('isCleanText', () => {
  it('lets ordinary names and party questions through', () => {
    for (const text of [
      'Qui est le plus susceptible de dormir en réunion ?',
      'Who would survive a zombie apocalypse?',
      'Wer würde am ehesten den ganzen Sonntag im Schlafanzug verbringen?',
      'Tom', 'Léa', 'Scunthorpe', 'assistant', 'classe', 'Bassin',
      'Chuck Norris', 'Bob l\'éponge', 'Wilhelm Tell',
    ]) {
      assert.equal(isCleanText(text), true, text);
    }
  });

  it('rejects strong insults in the three languages', () => {
    for (const text of [
      'Qui est la plus grosse pute ?',
      'Tom est un fils de pute',
      'Who is the biggest cunt?',
      'Wer ist die größte Hure?',
    ]) {
      assert.equal(isCleanText(text), false, text);
    }
  });

  it('sees through accents, case, leetspeak and stretched letters', () => {
    for (const text of ['PÛTE', 'p.u.t.e', 'pu7e', 'puuuute', 'N1GGER', 'sal0pe']) {
      assert.equal(isCleanText(text), false, text);
    }
  });

  it('catches slurs embedded in longer words', () => {
    assert.equal(isCleanText('les niggers'), false);
    assert.equal(isCleanText('un enculédemerde'), false);
  });

  it('matches whole words only for ordinary insults', () => {
    assert.equal(isCleanText('un concours de connaissance'), true);
    assert.equal(isCleanText('quel con'), false);
  });

  it('treats empty and whitespace-only text as clean', () => {
    assert.equal(isCleanText(''), true);
    assert.equal(isCleanText('   '), true);
  });
});

describe('normaliseText', () => {
  it('normalises the way the app does', () => {
    assert.equal(normaliseText('  Léa   B.  '), 'lea b');
    assert.equal(normaliseText('p.u.t.e'), 'pute');
    assert.equal(normaliseText('Sal0pe!!'), 'salopeii');
    assert.equal(normaliseText('Straße'), 'strasse');
  });
});

describe('content filter word lists', () => {
  it('keeps every entry in normalised form, or it would never match', () => {
    for (const entry of [...BLOCKED_WORDS, ...BLOCKED_STEMS]) {
      assert.equal(normaliseText(entry), entry, entry);
    }
  });
});
