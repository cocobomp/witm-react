import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import {
  createFirebaseIdTokenVerifier,
  FIREBASE_PROJECT_ID,
  GOOGLE_SECURE_TOKEN_JWKS_URL,
  InvalidIdTokenError,
} from '../../server/firebase-id-token.js';
import { createTestTokenFactory, SECONDS_PER_HOUR, secondsFromNow } from '../helpers/firebase-tokens.js';

describe('createFirebaseIdTokenVerifier', () => {
  let tokens;
  let verifyWithProductionSettings;

  before(async () => {
    tokens = await createTestTokenFactory();
    // Same wiring as api/claude.js, except the local key set.
    verifyWithProductionSettings = createFirebaseIdTokenVerifier({ keySet: tokens.keySet });
  });

  it('targets the qelpbackend project and Google secure-token keys by default', () => {
    assert.equal(FIREBASE_PROJECT_ID, 'qelpbackend');
    assert.equal(
      GOOGLE_SECURE_TOKEN_JWKS_URL,
      'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    );
  });

  it('accepts a qelpbackend token with the default project settings', async () => {
    const payload = await verifyWithProductionSettings(await tokens.signIdToken());
    assert.equal(payload.sub, 'admin-uid');
  });

  it('rejects another project with the default project settings', async () => {
    const token = await tokens.signIdToken({
      issuer: 'https://securetoken.google.com/another-project',
      audience: 'another-project',
    });
    await assert.rejects(verifyWithProductionSettings(token), InvalidIdTokenError);
  });

  it('rejects a token issued in the future', async () => {
    const issuedAt = secondsFromNow(SECONDS_PER_HOUR);
    const token = await tokens.signIdToken({
      issuedAt,
      expiresAt: issuedAt + SECONDS_PER_HOUR,
      claims: { auth_time: secondsFromNow(0) },
    });
    await assert.rejects(verifyWithProductionSettings(token), InvalidIdTokenError);
  });

  it('rejects a token without auth_time', async () => {
    const token = await tokens.signIdToken({ claims: { auth_time: undefined } });
    await assert.rejects(verifyWithProductionSettings(token), InvalidIdTokenError);
  });

  it('rejects an auth_time in the future', async () => {
    const token = await tokens.signIdToken({ claims: { auth_time: secondsFromNow(SECONDS_PER_HOUR) } });
    await assert.rejects(verifyWithProductionSettings(token), InvalidIdTokenError);
  });

  it('accepts an auth_time from an earlier sign-in', async () => {
    const token = await tokens.signIdToken({ claims: { auth_time: secondsFromNow(-24 * SECONDS_PER_HOUR) } });
    const payload = await verifyWithProductionSettings(token);
    assert.equal(payload.sub, 'admin-uid');
  });
});
