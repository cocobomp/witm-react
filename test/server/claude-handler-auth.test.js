import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { SignJWT } from 'jose';

import {
  createTestTokenFactory,
  generateForeignSigningKey,
  SECONDS_PER_HOUR,
  secondsFromNow,
  TEST_PROJECT_ID,
} from '../helpers/firebase-tokens.js';
import {
  ALLOWED_ORIGIN,
  assertErrorShape,
  bearer,
  buildTestHandler,
  GROQ_COMPLETIONS_URL,
  TEST_API_KEY,
} from '../helpers/handler-fixture.js';
import { captureConsoleErrors, invokeHandler } from '../helpers/mock-http.js';

const GENERATE_BODY = { action: 'generate', category: 'Soirée', count: 5, language: 'fr' };

describe('AI proxy authentication', () => {
  let tokens;
  let fixture;

  before(async () => {
    tokens = await createTestTokenFactory();
  });

  async function callWithHeaders(headers, body = GENERATE_BODY, env) {
    fixture = buildTestHandler({ keySet: tokens.keySet, env });
    return invokeHandler(fixture.handler, { headers, body });
  }

  async function callWithToken(token, body, env) {
    return callWithHeaders(bearer(token), body, env);
  }

  function assertUpstreamNotCalled() {
    assert.equal(fixture.upstream.calls.length, 0, 'the Groq API must not be reached');
  }

  describe('public endpoints', () => {
    it('answers the CORS preflight without a token and allows the Authorization header', async () => {
      fixture = buildTestHandler({ keySet: tokens.keySet });
      const res = await invokeHandler(fixture.handler, {
        method: 'OPTIONS',
        headers: { Origin: ALLOWED_ORIGIN },
      });
      assert.equal(res.statusCode, 204);
      assert.equal(res.headers['access-control-allow-origin'], ALLOWED_ORIGIN);
      assert.match(res.headers['access-control-allow-headers'], /Authorization/);
      assert.doesNotMatch(res.headers['access-control-allow-headers'], /X-Admin-Key/);
      assertUpstreamNotCalled();
    });

    it('still allows the admin served from the Vercel domain', async () => {
      fixture = buildTestHandler({ keySet: tokens.keySet });
      const res = await invokeHandler(fixture.handler, {
        method: 'OPTIONS',
        headers: { Origin: 'https://witm-react.vercel.app' },
      });
      assert.equal(res.headers['access-control-allow-origin'], 'https://witm-react.vercel.app');
    });

    it('does not echo a foreign origin in CORS headers', async () => {
      fixture = buildTestHandler({ keySet: tokens.keySet });
      const res = await invokeHandler(fixture.handler, {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil.example' },
      });
      assert.equal(res.headers['access-control-allow-origin'], undefined);
    });

    it('keeps the health check public', async () => {
      const res = await callWithHeaders({}, { action: 'health' });
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { status: 'ok' });
      assertUpstreamNotCalled();
    });

    it('rejects methods other than POST with the JSON error shape', async () => {
      fixture = buildTestHandler({ keySet: tokens.keySet });
      const res = await invokeHandler(fixture.handler, { method: 'GET' });
      assertErrorShape(assert, res, 405, 'METHOD_NOT_ALLOWED');
    });
  });

  describe('401 for a missing or invalid token', () => {
    it('rejects a request without an Authorization header', async () => {
      const res = await callWithHeaders({ Origin: ALLOWED_ORIGIN });
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assert.equal(res.headers['www-authenticate'], 'Bearer');
      assert.equal(res.headers['access-control-allow-origin'], ALLOWED_ORIGIN);
      assertUpstreamNotCalled();
    });

    it('no longer accepts the shared X-Admin-Key secret on its own', async () => {
      const res = await callWithHeaders({ 'X-Admin-Key': 'shared-secret' }, GENERATE_BODY, { ADMIN_SECRET: 'shared-secret' });
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a non-Bearer scheme', async () => {
      const res = await callWithHeaders({ Authorization: `Basic ${TEST_API_KEY}` });
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects an empty bearer token', async () => {
      const res = await callWithHeaders({ Authorization: 'Bearer ' });
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a malformed token', async () => {
      const res = await callWithToken('not.a.jwt');
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a token signed by a key outside the Google key set', async () => {
      const forged = await tokens.signIdToken({ signingKey: await generateForeignSigningKey() });
      const res = await callWithToken(forged);
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a token using a symmetric algorithm', async () => {
      const hmacToken = await new SignJWT({ email: 'admin@example.com', email_verified: true })
        .setProtectedHeader({ alg: 'HS256', kid: 'test-key' })
        .setSubject('admin-uid')
        .setIssuer(`https://securetoken.google.com/${TEST_PROJECT_ID}`)
        .setAudience(TEST_PROJECT_ID)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode('a-shared-secret-of-at-least-32-bytes!!'));
      const res = await callWithToken(hmacToken);
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a token issued for another Firebase project (aud)', async () => {
      const res = await callWithToken(await tokens.signIdToken({ audience: 'another-project' }));
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a token from another issuer (iss)', async () => {
      const token = await tokens.signIdToken({ issuer: 'https://securetoken.google.com/another-project' });
      const res = await callWithToken(token);
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects an expired token', async () => {
      const token = await tokens.signIdToken({
        issuedAt: secondsFromNow(-2 * SECONDS_PER_HOUR),
        expiresAt: secondsFromNow(-SECONDS_PER_HOUR),
      });
      const res = await callWithToken(token);
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a token that never expires', async () => {
      const res = await callWithToken(await tokens.signIdToken({ omitExpiration: true }));
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('rejects a token without a subject', async () => {
      const res = await callWithToken(await tokens.signIdToken({ subject: '' }));
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
      assertUpstreamNotCalled();
    });

    it('answers 401 to an anonymous caller even for an unknown action', async () => {
      const res = await callWithHeaders({}, { action: 'drop-everything' });
      assertErrorShape(assert, res, 401, 'UNAUTHENTICATED');
    });
  });

  describe('403 for a valid token that is not an admin', () => {
    it('rejects an admin email that is not verified', async () => {
      const token = await tokens.signIdToken({ claims: { email_verified: false } });
      const res = await callWithToken(token);
      assertErrorShape(assert, res, 403, 'FORBIDDEN');
      assertUpstreamNotCalled();
    });

    it('rejects a token without an email', async () => {
      const token = await tokens.signIdToken({ claims: { email: undefined } });
      const res = await callWithToken(token);
      assertErrorShape(assert, res, 403, 'FORBIDDEN');
      assertUpstreamNotCalled();
    });

    it('rejects a verified user who is not on the admin list', async () => {
      const token = await tokens.signIdToken({ claims: { email: 'player@example.com' } });
      const res = await callWithToken(token);
      assertErrorShape(assert, res, 403, 'FORBIDDEN');
      assertUpstreamNotCalled();
    });

    it('honours the ADMIN_EMAILS environment override', async () => {
      const token = await tokens.signIdToken();
      const res = await callWithToken(token, GENERATE_BODY, { ADMIN_EMAILS: 'someone-else@example.com' });
      assertErrorShape(assert, res, 403, 'FORBIDDEN');
      assertUpstreamNotCalled();
    });
  });

  describe('admins reach the action', () => {
    it('generates questions for a verified admin, matching the email case-insensitively', async () => {
      const token = await tokens.signIdToken({ claims: { email: 'Admin@Example.COM' } });
      const res = await callWithToken(token);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.questions.length, 1);
      assert.equal(fixture.upstream.calls.length, 1);
      const [call] = fixture.upstream.calls;
      assert.equal(call.url, GROQ_COMPLETIONS_URL);
      assert.equal(call.init.method, 'POST');
      assert.equal(call.init.headers.Authorization, `Bearer ${TEST_API_KEY}`);
    });

    it('answers 503 and logs the cause when the signing keys cannot be fetched', async () => {
      const outage = new TypeError('fetch failed');
      fixture = buildTestHandler({
        verifyIdToken: async () => {
          throw outage;
        },
      });
      let res;
      const logged = await captureConsoleErrors(async () => {
        res = await invokeHandler(fixture.handler, { headers: bearer('any'), body: GENERATE_BODY });
      });
      assertErrorShape(assert, res, 503, 'AUTH_UNAVAILABLE');
      assertUpstreamNotCalled();
      assert.equal(logged.length, 1, 'the outage must be logged once');
      assert.equal(logged[0][1].cause, outage);
    });
  });
});
