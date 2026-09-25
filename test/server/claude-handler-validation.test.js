import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import {
  MAX_BATCH_ID_LENGTH,
  MAX_CATEGORY_LENGTH,
  MAX_GENERATION_COUNT,
  MAX_TRANSLATION_TEXT_LENGTH,
} from '../../server/claude-request-validation.js';
import { createTestTokenFactory } from '../helpers/firebase-tokens.js';
import {
  assertErrorShape,
  bearer,
  buildTestHandler,
  GENERATION_FIXTURE,
  groqCompletion,
  TRANSLATION_FIXTURE,
} from '../helpers/handler-fixture.js';
import { captureConsoleErrors, createFakeFetch, invokeHandler } from '../helpers/mock-http.js';

describe('AI proxy input validation (as an authenticated admin)', () => {
  let tokens;
  let adminToken;
  let fixture;

  before(async () => {
    tokens = await createTestTokenFactory();
    adminToken = await tokens.signIdToken();
  });

  async function callAsAdmin(body, { upstreamJson, upstreamStatus, env, bodyError } = {}) {
    const fetchFn = createFakeFetch({ json: upstreamJson ?? GENERATION_FIXTURE, status: upstreamStatus });
    fixture = buildTestHandler({ keySet: tokens.keySet, fetchFn, env });
    return invokeHandler(fixture.handler, { headers: bearer(adminToken), body, bodyError });
  }

  function upstreamRequest() {
    return JSON.parse(fixture.upstream.calls[0].init.body);
  }

  function upstreamPrompt() {
    return upstreamRequest().messages.at(-1).content;
  }

  const rejectedBodies = [
    ['a body that is not an object', 'generate'],
    ['an unknown action', { action: 'models-list' }],
    ['an unknown field', { action: 'generate', category: 'Soirée', model: 'llama-3.1-405b' }],
    ['a missing category', { action: 'generate', count: 5 }],
    ['a blank category', { action: 'batch-create', category: '   ' }],
    ['an oversized category', { action: 'batch-create', category: 'x'.repeat(MAX_CATEGORY_LENGTH + 1) }],
    ['a count above the cap', { action: 'batch-create', category: 'Soirée', count: MAX_GENERATION_COUNT + 1 }],
    ['a count of zero', { action: 'generate', category: 'Soirée', count: 0 }],
    ['a fractional count', { action: 'generate', category: 'Soirée', count: 2.5 }],
    ['a count sent as a string', { action: 'generate', category: 'Soirée', count: '5' }],
    ['an unsupported language', { action: 'generate', category: 'Soirée', language: 'gsw' }],
    ['a missing batchId', { action: 'batch-status' }],
    ['a batchId with path characters', { action: 'batch-status', batchId: '../../models' }],
    ['a batchId with a query string', { action: 'batch-results', batchId: 'groq_batch_1?limit=1' }],
    ['an oversized batchId', { action: 'batch-results', batchId: `groq_batch_${'1'.repeat(MAX_BATCH_ID_LENGTH)}` }],
    ['a missing text to translate', { action: 'translate' }],
    ['an oversized text to translate', { action: 'translate', text: 'x'.repeat(MAX_TRANSLATION_TEXT_LENGTH + 1) }],
    ['an unsupported target language', { action: 'translate', text: 'Qui ?', targetLanguages: ['en', 'xx'] }],
    ['an empty target language list', { action: 'translate', text: 'Qui ?', targetLanguages: [] }],
    ['duplicated target languages', { action: 'translate', text: 'Qui ?', targetLanguages: ['en', 'en'] }],
    ['an unsupported source language', { action: 'translate', text: 'Qui ?', sourceLanguage: 'xx' }],
  ];

  for (const [description, body] of rejectedBodies) {
    it(`rejects ${description} with 400 before calling Groq`, async () => {
      const res = await callAsAdmin(body);
      assertErrorShape(assert, res, 400, 'INVALID_REQUEST');
      assert.equal(fixture.upstream.calls.length, 0);
    });
  }

  it('answers 400 to a body Vercel could not parse as JSON', async () => {
    const res = await callAsAdmin(undefined, { bodyError: new SyntaxError('Invalid JSON') });
    assertErrorShape(assert, res, 400, 'INVALID_REQUEST');
    assert.equal(fixture.upstream.calls.length, 0);
  });

  it('accepts the maximum generation count', async () => {
    const res = await callAsAdmin({ action: 'generate', category: 'Soirée', count: MAX_GENERATION_COUNT, language: 'fr' });
    assert.equal(res.statusCode, 200);
    assert.match(upstreamPrompt(), new RegExp(`Génère ${MAX_GENERATION_COUNT} questions`));
  });

  it('defaults the generation count to 5 when omitted', async () => {
    const res = await callAsAdmin({ action: 'generate', category: 'Soirée' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.questions.length, 1);
    assert.match(upstreamPrompt(), /Génère 5 questions/);
  });

  it('creates a batch that already carries its questions, as the admin UI expects', async () => {
    const res = await callAsAdmin({ action: 'batch-create', category: 'Soirée', count: 5, language: 'fr' });
    assert.equal(res.statusCode, 200);
    assert.match(res.body.batchId, /^groq_batch_\d+$/);
    assert.equal(res.body.processingStatus, 'ended');
    assert.equal(res.body.questions.length, 1);
    assert.equal(res.body.requestCounts.succeeded, 1);
  });

  it('records a failed batch without leaking the upstream message', async () => {
    let res;
    const logged = await captureConsoleErrors(async () => {
      res = await callAsAdmin(
        { action: 'batch-create', category: 'Soirée' },
        { upstreamStatus: 401, upstreamJson: { error: { message: 'Invalid API Key gsk_secret' } } },
      );
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.processingStatus, 'errored');
    assert.equal(res.body.requestCounts.errored, 1);
    assert.doesNotMatch(JSON.stringify(res.body), /gsk_|Invalid API Key/);
    assert.equal(logged.length, 1, 'the upstream failure must be logged once');
  });

  it('accepts exactly what the admin UI sends for a translation', async () => {
    const res = await callAsAdmin(
      { action: 'translate', text: 'Qui est le plus drôle ?', sourceLanguage: null, targetLanguages: ['en', 'fr', 'de'] },
      { upstreamJson: TRANSLATION_FIXTURE },
    );
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.translations.en, 'Who is the funniest?');
  });

  for (const batchId of ['groq_batch_1790000000000', 'msgbatch_01LegacyAnthropicBatch']) {
    it(`reports ${batchId.split('_')[0]} batches stored by the admin UI as ended without calling Groq`, async () => {
      const res = await callAsAdmin({ action: 'batch-status', batchId });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.batchId, batchId);
      assert.equal(res.body.processingStatus, 'ended');
      assert.equal(fixture.upstream.calls.length, 0);
    });
  }

  it('answers batch results with an empty list (questions are stored at creation)', async () => {
    const res = await callAsAdmin({ action: 'batch-results', batchId: 'groq_batch_1790000000000' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { questions: [] });
    assert.equal(fixture.upstream.calls.length, 0);
  });

  it('answers 500 without calling Groq when the API key is not configured', async () => {
    let res;
    await captureConsoleErrors(async () => {
      res = await callAsAdmin({ action: 'generate', category: 'Soirée' }, { env: { GROQ_API_KEY: undefined } });
    });
    assertErrorShape(assert, res, 500, 'NOT_CONFIGURED');
    assert.equal(fixture.upstream.calls.length, 0);
  });

  it('maps an upstream failure to 502, logged once, without leaking the upstream message', async () => {
    let res;
    const logged = await captureConsoleErrors(async () => {
      res = await callAsAdmin(
        { action: 'generate', category: 'Soirée' },
        { upstreamStatus: 401, upstreamJson: { error: { message: 'Invalid API Key gsk_secret' } } },
      );
    });
    assertErrorShape(assert, res, 502, 'UPSTREAM_ERROR');
    assert.doesNotMatch(res.body.error.message, /gsk_|Invalid API Key/);
    assert.equal(logged.length, 1);
  });

  it('maps an unparsable model answer to 502', async () => {
    let res;
    await captureConsoleErrors(async () => {
      res = await callAsAdmin(
        { action: 'generate', category: 'Soirée' },
        { upstreamJson: groqCompletion('no json here') },
      );
    });
    assertErrorShape(assert, res, 502, 'UPSTREAM_INVALID_RESPONSE');
  });
});
