import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  copyTextFor,
  displayPin,
  entryToStoredPin,
  parseJoinPin,
} from '../../src/utils/pinFormat.js';

describe('parseJoinPin', () => {
  it('keeps a stored 3-digit PIN as it is', () => {
    assert.equal(parseJoinPin('123'), '123');
    assert.equal(parseJoinPin('042'), '042');
  });

  it('reads a 2-digit code as the short code it is', () => {
    assert.equal(parseJoinPin('42'), '042');
    assert.equal(parseJoinPin('07'), '007');
  });

  it('refuses codes that are too short or too long, like the app', () => {
    for (const code of ['', '1', '1234', '12345678']) {
      assert.equal(parseJoinPin(code), null, code);
    }
  });

  it('refuses anything that is not only digits, like the app', () => {
    for (const code of ['abc', '1a3', ' 42', '42 ', '4-2', '٤٢', '42.']) {
      assert.equal(parseJoinPin(code), null, code);
    }
  });

  it('refuses a missing code (the bare /j route)', () => {
    assert.equal(parseJoinPin(undefined), null);
    assert.equal(parseJoinPin(null), null);
  });
});

describe('displayPin', () => {
  it('shows a short-space PIN as 2 digits, the way the lobby does', () => {
    assert.equal(displayPin('042'), '42');
    assert.equal(displayPin('007'), '07');
  });

  it('leaves every other PIN untouched', () => {
    assert.equal(displayPin('123'), '123');
    assert.equal(displayPin('42'), '42');
  });
});

describe('entryToStoredPin', () => {
  it('puts the implicit leading zero back on a 2-digit entry', () => {
    assert.equal(entryToStoredPin('42'), '042');
  });

  it('keeps a 3-digit entry', () => {
    assert.equal(entryToStoredPin('420'), '420');
  });

  it('round-trips with displayPin for every stored PIN', () => {
    for (let value = 0; value < 1000; value += 1) {
      const stored = String(value).padStart(3, '0');
      assert.equal(entryToStoredPin(displayPin(stored)), stored);
    }
  });
});

describe('copyTextFor', () => {
  it('copies « WITM 42 », which the app pastes as a certain code', () => {
    assert.equal(copyTextFor('042'), 'WITM 42');
    assert.equal(copyTextFor('123'), 'WITM 123');
  });

  it('matches the app pattern for branded codes', () => {
    // PastedJoinCode._brandedCode in the app (lib/src/features/rooms).
    const appPattern = /^WITM\s*:?\s*(\d{2,3})$/i;
    for (const pin of ['042', '123', '007']) {
      const match = appPattern.exec(copyTextFor(pin));
      assert.ok(match, pin);
      assert.equal(entryToStoredPin(match[1]), pin);
    }
  });
});
