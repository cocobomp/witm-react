import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveAdminEmails } from '../../server/admin-auth.js';
import { ADMIN_EMAILS } from '../../src/constants/adminEmails.js';

describe('resolveAdminEmails', () => {
  it('falls back to the allowlist shared with the admin UI when the variable is unset', () => {
    assert.deepEqual(resolveAdminEmails(undefined), [...ADMIN_EMAILS]);
  });

  it('treats a blank variable as unset', () => {
    assert.deepEqual(resolveAdminEmails(' , ,'), [...ADMIN_EMAILS]);
  });

  it('parses a comma-separated list, trimming and lowercasing each entry', () => {
    assert.deepEqual(resolveAdminEmails(' First@Example.com ,second@example.com,, '), [
      'first@example.com',
      'second@example.com',
    ]);
  });

  it('keeps the shared allowlist lowercase so comparisons stay case-insensitive', () => {
    for (const email of ADMIN_EMAILS) {
      assert.equal(email, email.toLowerCase());
    }
  });
});
