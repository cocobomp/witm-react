// Single source of truth for the admin allowlist. The admin UI gates its
// screens on it (AuthContext), and the AI proxy (api/claude.js) enforces it
// server-side unless the ADMIN_EMAILS environment variable overrides it.
// Keep entries lowercase: both sides compare against the lowercased email.
export const ADMIN_EMAILS = Object.freeze([
  'quiestlepluss@gmail.com',
  'corentin@qelp.ch',
  'cocobomp@gmail.com',
  'bompard.corentin@gmail.com',
]);
