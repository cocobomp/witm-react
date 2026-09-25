import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { invokeHandler } from '../helpers/mock-http.js';

const TEST_ENV = { GROQ_API_KEY: 'test-groq-key', ADMIN_SECRET: 'legacy-shared-secret' };

/**
 * Smoke test of the real Vercel entry point: it must load under Node's ESM
 * resolver with the production wiring (remote Google key set, global fetch),
 * and the paths below must never touch the network.
 */
describe('api/claude.js entry point', () => {
  let handler;
  const previousEnv = {};
  const originalFetch = globalThis.fetch;
  const networkCalls = [];

  before(async () => {
    globalThis.fetch = async (url) => {
      networkCalls.push(String(url));
      throw new Error(`Unexpected network call to ${url}`);
    };
    for (const [name, value] of Object.entries(TEST_ENV)) {
      previousEnv[name] = process.env[name];
      process.env[name] = value;
    }
    ({ default: handler } = await import('../../api/claude.js'));
  });

  after(() => {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  });

  it('exports a request handler', () => {
    assert.equal(typeof handler, 'function');
  });

  it('serves the public health check', async () => {
    const res = await invokeHandler(handler, { body: { action: 'health' } });
    assert.equal(res.statusCode, 200);
  });

  it('refuses a paid action without a token', async () => {
    const res = await invokeHandler(handler, { body: { action: 'generate', category: 'Soirée' } });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
    assert.deepEqual(networkCalls, []);
  });

  it('refuses a paid action carrying only the legacy X-Admin-Key secret', async () => {
    const res = await invokeHandler(handler, {
      headers: { 'X-Admin-Key': TEST_ENV.ADMIN_SECRET },
      body: { action: 'generate', category: 'Soirée' },
    });
    assert.equal(res.statusCode, 401);
    assert.deepEqual(networkCalls, []);
  });
});
