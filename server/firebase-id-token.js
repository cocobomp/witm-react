import { createRemoteJWKSet, jwtVerify } from 'jose';

export const FIREBASE_PROJECT_ID = 'qelpbackend';
export const GOOGLE_SECURE_TOKEN_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const FIREBASE_ISSUER_PREFIX = 'https://securetoken.google.com/';
const ID_TOKEN_ALGORITHMS = ['RS256'];
const REQUIRED_CLAIMS = ['sub', 'iat', 'exp', 'auth_time'];
// Firebase ID tokens live one hour. Checking the age also makes jose reject
// an `iat` in the future.
const ID_TOKEN_MAX_AGE = '1h';
const CLOCK_TOLERANCE_SECONDS = 5;
const MILLISECONDS_PER_SECOND = 1000;

// jose error codes that mean "this token is not acceptable". Anything else
// (JWKS timeout, unreachable or malformed key endpoint) is our outage, not the
// caller's fault, and must not be reported as a bad token.
const INVALID_TOKEN_ERROR_CODES = new Set([
  'ERR_JWT_INVALID',
  'ERR_JWS_INVALID',
  'ERR_JWT_EXPIRED',
  'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
  'ERR_JWKS_NO_MATCHING_KEY',
  'ERR_JWKS_MULTIPLE_MATCHING_KEYS',
  'ERR_JOSE_ALG_NOT_ALLOWED',
  'ERR_JOSE_NOT_SUPPORTED',
]);

export class InvalidIdTokenError extends Error {
  constructor(reason, options) {
    super(`Invalid Firebase ID token: ${reason}`, options);
    this.name = 'InvalidIdTokenError';
  }
}

function nowInSeconds() {
  return Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
}

function assertFirebaseClaims(payload) {
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new InvalidIdTokenError('empty subject');
  }
  const isAuthTimeInPast =
    typeof payload.auth_time === 'number' && payload.auth_time <= nowInSeconds() + CLOCK_TOLERANCE_SECONDS;
  if (!isAuthTimeInPast) {
    throw new InvalidIdTokenError('auth_time must be in the past');
  }
}

/**
 * Returns `verifyIdToken(token) → payload` implementing Firebase's ID token
 * checks: RS256 signature from Google's secure-token keys, issuer and audience
 * bound to the project, issued in the past and not expired, auth_time in the
 * past, non-empty subject.
 * `keySet` is injectable so tests can sign with a local key.
 */
export function createFirebaseIdTokenVerifier({ projectId = FIREBASE_PROJECT_ID, keySet } = {}) {
  const signingKeys = keySet ?? createRemoteJWKSet(new URL(GOOGLE_SECURE_TOKEN_JWKS_URL));
  const verifyOptions = {
    issuer: `${FIREBASE_ISSUER_PREFIX}${projectId}`,
    audience: projectId,
    algorithms: ID_TOKEN_ALGORITHMS,
    requiredClaims: REQUIRED_CLAIMS,
    maxTokenAge: ID_TOKEN_MAX_AGE,
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
  };

  return async function verifyIdToken(idToken) {
    let payload;
    try {
      ({ payload } = await jwtVerify(idToken, signingKeys, verifyOptions));
    } catch (error) {
      if (INVALID_TOKEN_ERROR_CODES.has(error?.code)) {
        throw new InvalidIdTokenError(error.code, { cause: error });
      }
      throw error;
    }
    assertFirebaseClaims(payload);
    return payload;
  };
}
