export const APP_STORE_URL = 'https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.qelp.ch';
export const INSTAGRAM_URL = 'https://www.instagram.com/witm_whoisthemost';
export const TIKTOK_URL = 'https://tiktok.com/@witm_whoisthemost';
export const CONTACT_EMAIL = 'quiestlepluss@gmail.com';
export const INFO_EMAIL = 'info@whoisthemost.com';
// Custom scheme handled by the Flutter app (see universal link /j/:pin flow).
export const APP_JOIN_SCHEME_PREFIX = 'qelp://join/';

export const buildJoinDeepLink = (pin) => `${APP_JOIN_SCHEME_PREFIX}${encodeURIComponent(pin)}`;
