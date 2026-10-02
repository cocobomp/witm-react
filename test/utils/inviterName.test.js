import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { INVITER_NAME_MAX_LENGTH, parseInviterName } from '../../src/utils/inviterName.js';

describe('parseInviterName', () => {
  it('returns the name a link carries', () => {
    assert.equal(parseInviterName('Léa'), 'Léa');
    assert.equal(parseInviterName('Chuck Norris'), 'Chuck Norris');
  });

  it('trims surrounding spaces', () => {
    assert.equal(parseInviterName('  Léa  '), 'Léa');
  });

  it('ignores a missing or blank name', () => {
    assert.equal(parseInviterName(null), null);
    assert.equal(parseInviterName(undefined), null);
    assert.equal(parseInviterName(''), null);
    assert.equal(parseInviterName('   '), null);
  });

  it('cuts the name to 20 characters, like the app', () => {
    assert.equal(INVITER_NAME_MAX_LENGTH, 20);
    assert.equal(parseInviterName('A'.repeat(30)), 'A'.repeat(20));
  });

  it('counts an emoji as one character, like the app', () => {
    const family = '👨‍👩‍👧';
    const name = `${'B'.repeat(19)}${family}${family}`;
    assert.equal(parseInviterName(name), `${'B'.repeat(19)}${family}`);
  });

  it('trims again after the cut', () => {
    assert.equal(parseInviterName(`${'C'.repeat(19)} D`), 'C'.repeat(19));
  });

  it('ignores a name the content filter refuses', () => {
    assert.equal(parseInviterName('connard'), null);
    assert.equal(parseInviterName('Fils de pute'), null);
  });

  it('strips invisible controls and direction overrides', () => {
    assert.equal(parseInviterName('Léa‮edocnu'), 'Léaedocnu');
    assert.equal(parseInviterName('\u0000Tom\u0007'), 'Tom');
    assert.equal(parseInviterName('⁦⁩'), null);
  });

  it('keeps markup as plain text (React escapes it when rendering)', () => {
    assert.equal(parseInviterName('<b>Léa</b>'), '<b>Léa</b>');
  });
});
