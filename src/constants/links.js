export const APP_STORE_URL = 'https://apps.apple.com/ch/app/witm-who-is-the-most/id6740246093';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.qelp.ch';
export const INSTAGRAM_URL = 'https://www.instagram.com/witm_whoisthemost';
export const TIKTOK_URL = 'https://tiktok.com/@witm_whoisthemost';
export const CONTACT_EMAIL = 'quiestlepluss@gmail.com';
export const INFO_EMAIL = 'info@whoisthemost.com';
// Custom scheme handled by the Flutter app (see universal link /j/:pin flow).
export const APP_JOIN_SCHEME_PREFIX = 'qelp://join/';

/// Query parameter of a join link carrying the inviting host's name
/// (`/j/042?n=Léa`, app 3.5 `JoinDeepLink.inviterNameParam`).
export const JOIN_INVITER_PARAM = 'n';

/// The custom-scheme link that opens the app on the join flow. It keeps the
/// stored 3-digit PIN, the only form apps before 3.5 accept, and hands the
/// inviter's name on to 3.5 (older apps ignore the query).
export function buildJoinDeepLink(pin, inviterName) {
  const base = `${APP_JOIN_SCHEME_PREFIX}${encodeURIComponent(pin)}`;
  if (!inviterName) return base;

  const query = new URLSearchParams({ [JOIN_INVITER_PARAM]: inviterName });
  return `${base}?${query.toString()}`;
}

/// Apple reports `ct` campaigns only when a provider token travels with them.
/// Read it off App Store Connect → App Analytics → Campaigns and paste it
/// here; until then the campaign rides along harmlessly but goes unreported.
const APPLE_PROVIDER_TOKEN = '';

const UTM_SOURCE = 'whoisthemost.com';
const UTM_MEDIUM = 'web';

/// Where on the site a store link was clicked. `join` is the one that matters:
/// it isolates people who landed on /j/:pin without the app — the invite-driven
/// installs that every game with a newcomer in the room should produce.
export const STORE_CAMPAIGNS = {
  join: 'join',
  home: 'home',
  footer: 'footer',
};

export function buildAppStoreUrl(campaign) {
  if (!campaign) return APP_STORE_URL;

  const params = new URLSearchParams({ ct: campaign, mt: '8' });
  if (APPLE_PROVIDER_TOKEN) params.set('pt', APPLE_PROVIDER_TOKEN);

  return `${APP_STORE_URL}?${params.toString()}`;
}

export function buildGooglePlayUrl(campaign) {
  if (!campaign) return GOOGLE_PLAY_URL;

  // Play expects one `referrer` value that is itself an encoded query string;
  // URLSearchParams handles the second level of escaping for us.
  const referrer = new URLSearchParams({
    utm_source: UTM_SOURCE,
    utm_medium: UTM_MEDIUM,
    utm_campaign: campaign,
  }).toString();

  return `${GOOGLE_PLAY_URL}&referrer=${encodeURIComponent(referrer)}`;
}
