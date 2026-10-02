export const MOBILE_PLATFORMS = {
  ios: 'ios',
  android: 'android',
};

/** The mobile platform a user agent belongs to, or null on a computer. */
export function detectMobilePlatform({ userAgent = '', maxTouchPoints = 0 } = {}) {
  if (/android/i.test(userAgent)) return MOBILE_PLATFORMS.android;
  if (/iphone|ipad|ipod/i.test(userAgent)) return MOBILE_PLATFORMS.ios;
  // iPadOS reports itself as a Mac; only the touch screen gives it away.
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return MOBILE_PLATFORMS.ios;
  return null;
}

/** The mobile platform of this browser, or null on a computer. */
export function currentMobilePlatform() {
  if (typeof navigator === 'undefined') return null;
  return detectMobilePlatform({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
  });
}
