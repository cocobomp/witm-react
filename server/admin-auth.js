import { ADMIN_EMAILS } from '../src/constants/adminEmails.js';
import { InvalidIdTokenError } from './firebase-id-token.js';
import { HttpError } from './http-error.js';

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i;

/**
 * Parses the ADMIN_EMAILS environment variable (comma-separated). An unset or
 * blank value falls back to the allowlist shared with the admin UI.
 */
export function resolveAdminEmails(envValue) {
  const configured = (envValue ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return configured.length > 0 ? configured : [...ADMIN_EMAILS];
}

function extractBearerToken(authorizationHeader) {
  const match = typeof authorizationHeader === 'string' ? authorizationHeader.match(BEARER_PATTERN) : null;
  if (!match) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'A Firebase ID token is required (Authorization: Bearer <token>).');
  }
  return match[1];
}

async function verifyOrReject(idToken, verifyIdToken) {
  try {
    return await verifyIdToken(idToken);
  } catch (error) {
    if (error instanceof InvalidIdTokenError) {
      throw new HttpError(401, 'UNAUTHENTICATED', 'The ID token is invalid or expired. Sign in again.', { cause: error });
    }
    throw new HttpError(503, 'AUTH_UNAVAILABLE', 'Sign-in could not be verified right now. Try again shortly.', {
      cause: error,
    });
  }
}

/**
 * Resolves the caller from the Authorization header, or throws an HttpError:
 * 401 when there is no valid Firebase ID token, 403 when the token is valid
 * but its verified email is not on the admin allowlist.
 */
export async function authenticateAdmin(authorizationHeader, { verifyIdToken, adminEmails }) {
  const payload = await verifyOrReject(extractBearerToken(authorizationHeader), verifyIdToken);
  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';

  if (payload.email_verified !== true || email === '') {
    throw new HttpError(403, 'FORBIDDEN', 'A verified email address is required.');
  }
  if (!adminEmails.includes(email)) {
    throw new HttpError(403, 'FORBIDDEN', 'This account is not allowed to use the admin AI tools.');
  }
  return { uid: payload.sub, email };
}
