import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../../public/download.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const ANDROID = { userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile Safari/537.36', platform: 'Linux armv81' };
const IPHONE = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) Mobile/15E148', platform: 'iPhone' };
const DESKTOP = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 0 };

const PLAY_BARE = 'https://play.google.com/store/apps/details?id=com.qelp.ch';
const APP_STORE_BARE = 'https://apps.apple.com/app/id6740246093';
const APP_STORE_CAMPAIGN = 'https://apps.apple.com/app/apple-store/id6740246093';
const TIKTOK_BIO = '?utm_source=tiktok&utm_medium=social&utm_campaign=c1_lancement&utm_content=bio';
const TIKTOK_BIO_PLAY =
  `${PLAY_BARE}&referrer=utm_source%3Dtiktok%26utm_medium%3Dsocial%26utm_campaign%3Dc1_lancement%26utm_content%3Dbio`;

function run(search, navigator) {
  const elements = {};
  const result = { redirect: null, elements };
  const document = {
    getElementById(id) {
      elements[id] ??= {
        href: 'static',
        hidden: null,
        classList: {
          add: () => { elements[id].hidden = true; },
          remove: () => { elements[id].hidden = false; },
        },
      };
      return elements[id];
    },
  };
  const window = { location: { search, replace(url) { result.redirect = url; } } };
  vm.runInNewContext(script, { navigator, document, window, URLSearchParams });
  return result;
}

test('TikTok bio link on Android gives the Play link of tracking.md 3.3', () => {
  const { redirect, elements } = run(`${TIKTOK_BIO}&ct=c1_tiktok_bio`, ANDROID);
  assert.equal(redirect, TIKTOK_BIO_PLAY);
  assert.equal(elements['manual-link'].href, TIKTOK_BIO_PLAY);
  assert.equal(elements['badges-desktop'].hidden, true);
  assert.equal(elements['redirect-msg'].hidden, false);
});

test('TikTok bio link on iPhone carries ct and mt, no pt while the token is empty', () => {
  const { redirect } = run(`${TIKTOK_BIO}&ct=c1_tiktok_bio`, IPHONE);
  assert.equal(redirect, `${APP_STORE_CAMPAIGN}?ct=c1_tiktok_bio&mt=8`);
});

test('no parameters gives the bare store URLs', () => {
  assert.equal(run('', ANDROID).redirect, PLAY_BARE);
  assert.equal(run('', IPHONE).redirect, APP_STORE_BARE);
});

test('an invalid value is dropped, the others are kept', () => {
  const spaced = run('?utm_source=tik%20tok&utm_medium=social&utm_campaign=c1_lancement', ANDROID);
  assert.equal(spaced.redirect, `${PLAY_BARE}&referrer=utm_medium%3Dsocial%26utm_campaign%3Dc1_lancement`);
  const ampersand = run('?utm_source=tiktok&utm_campaign=a%26b&utm_content=bio', ANDROID);
  assert.equal(ampersand.redirect, `${PLAY_BARE}&referrer=utm_source%3Dtiktok%26utm_content%3Dbio`);
});

test('unlisted parameters are never forwarded', () => {
  const { redirect } = run('?utm_term=x&gclid=y&next=https%3A%2F%2Fevil.example', ANDROID);
  assert.equal(redirect, PLAY_BARE);
});

test('a value longer than 64 characters is dropped, not truncated', () => {
  assert.equal(run(`?utm_source=${'a'.repeat(65)}`, ANDROID).redirect, PLAY_BARE);
});

test('a ct of 40 characters is cut to 30', () => {
  const { redirect } = run(`?ct=${'a'.repeat(40)}`, IPHONE);
  assert.equal(redirect, `${APP_STORE_CAMPAIGN}?ct=${'a'.repeat(30)}&mt=8`);
});

test('ct never reaches Play', () => {
  assert.equal(run('?ct=c1_tiktok_bio', ANDROID).redirect, PLAY_BARE);
});

test('without ct, the utm values give the fallback c1_tiktok_bio', () => {
  const { redirect } = run(TIKTOK_BIO, IPHONE);
  assert.equal(redirect, `${APP_STORE_CAMPAIGN}?ct=c1_tiktok_bio&mt=8`);
});

test('a ct holding markup is dropped', () => {
  const { redirect } = run('?ct=%3Cscript%3E', IPHONE);
  assert.equal(redirect, APP_STORE_BARE);
});

test('a duplicated utm_source uses the first occurrence', () => {
  const { redirect } = run('?utm_source=tiktok&utm_source=instagram', ANDROID);
  assert.equal(redirect, `${PLAY_BARE}&referrer=utm_source%3Dtiktok`);
});

test('desktop does not redirect and its badges carry the campaign', () => {
  const { redirect, elements } = run(`${TIKTOK_BIO}&ct=c1_tiktok_bio`, DESKTOP);
  assert.equal(redirect, null);
  assert.equal(elements['badge-app-store'].href, `${APP_STORE_CAMPAIGN}?ct=c1_tiktok_bio&mt=8`);
  assert.equal(elements['badge-play-store'].href, TIKTOK_BIO_PLAY);
  assert.equal(elements['badges-desktop'], undefined);
});

test('the static hrefs stay as the no-JS fallback', () => {
  assert.ok(html.includes(`id="badge-app-store" href="${APP_STORE_BARE}"`));
  assert.ok(html.includes(`id="badge-play-store" href="${PLAY_BARE}"`));
});
