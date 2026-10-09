import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectMobilePlatform, MOBILE_PLATFORMS } from '../../src/utils/platform.js';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const WINDOWS_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

describe('detectMobilePlatform', () => {
  it('recognises iPhone and Android', () => {
    assert.equal(detectMobilePlatform({ userAgent: IPHONE_UA }), MOBILE_PLATFORMS.ios);
    assert.equal(detectMobilePlatform({ userAgent: ANDROID_UA }), MOBILE_PLATFORMS.android);
  });

  it('recognises an iPad that reports itself as a Mac by its touch screen', () => {
    assert.equal(detectMobilePlatform({ userAgent: MAC_UA, maxTouchPoints: 5 }), MOBILE_PLATFORMS.ios);
  });

  it('returns null on a computer', () => {
    assert.equal(detectMobilePlatform({ userAgent: MAC_UA, maxTouchPoints: 0 }), null);
    assert.equal(detectMobilePlatform({ userAgent: WINDOWS_UA }), null);
    assert.equal(detectMobilePlatform(), null);
  });
});
