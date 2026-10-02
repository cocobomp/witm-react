import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildJoinDeepLink, JOIN_INVITER_PARAM } from '../../src/constants/links.js';

describe('buildJoinDeepLink', () => {
  it('opens the app on the stored 3-digit PIN, the form every app version accepts', () => {
    assert.equal(buildJoinDeepLink('042'), 'qelp://join/042');
  });

  it('hands the inviter name on in `n`, URL-encoded', () => {
    const link = buildJoinDeepLink('042', 'Léa & Tom');
    const query = new URLSearchParams(link.split('?')[1]);

    assert.ok(link.startsWith('qelp://join/042?'));
    assert.equal(JOIN_INVITER_PARAM, 'n');
    assert.equal(query.get('n'), 'Léa & Tom');
  });

  it('leaves the query out when there is no name', () => {
    assert.equal(buildJoinDeepLink('123', null), 'qelp://join/123');
    assert.equal(buildJoinDeepLink('123', ''), 'qelp://join/123');
  });
});
