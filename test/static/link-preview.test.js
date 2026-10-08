import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

/**
 * Chat apps build a shared link's preview from the static index.html, before
 * any script runs: an invite link (/j/<code>) is previewed from these tags.
 */
const INDEX_HTML = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

function metaContent(property) {
  const pattern = new RegExp(`<meta property="${property}" content="([^"]*)"`);
  return INDEX_HTML.match(pattern)?.[1];
}

describe('link preview of the static page', () => {
  it('names QELP and keeps WITM findable', () => {
    for (const property of ['og:title', 'og:description']) {
      const content = metaContent(property);
      assert.ok(content, property);
      assert.match(content, /QELP/, property);
      assert.match(content, /WITM/, property);
    }
  });

  it('points og:image at an absolute URL', () => {
    assert.match(metaContent('og:image') ?? '', /^https:\/\/whoisthemost\.com\//);
  });
});
