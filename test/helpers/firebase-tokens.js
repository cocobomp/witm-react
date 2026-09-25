import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';

export const TEST_PROJECT_ID = 'qelpbackend';
export const TEST_ISSUER = `https://securetoken.google.com/${TEST_PROJECT_ID}`;
export const TEST_ADMIN_EMAIL = 'admin@example.com';
export const SECONDS_PER_HOUR = 3600;

const KEY_ID = 'test-key';
const SIGNING_ALGORITHM = 'RS256';

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function secondsFromNow(offsetSeconds) {
  return nowInSeconds() + offsetSeconds;
}

/**
 * Builds a local key set standing in for Google's secure-token JWKS, and a
 * signer that mints Firebase-shaped ID tokens against it. Every claim can be
 * overridden (or dropped with `undefined`) so each test breaks exactly one
 * property of an otherwise valid token.
 */
export async function createTestTokenFactory() {
  const { publicKey, privateKey } = await generateKeyPair(SIGNING_ALGORITHM);
  const publicJwk = { ...(await exportJWK(publicKey)), kid: KEY_ID, alg: SIGNING_ALGORITHM };
  const keySet = createLocalJWKSet({ keys: [publicJwk] });

  async function signIdToken(options = {}) {
    const issuedAt = options.issuedAt ?? nowInSeconds();
    const claims = { email: TEST_ADMIN_EMAIL, email_verified: true, auth_time: issuedAt, ...options.claims };
    const token = new SignJWT(claims)
      .setProtectedHeader({ alg: SIGNING_ALGORITHM, kid: KEY_ID })
      .setSubject(options.subject ?? 'admin-uid')
      .setIssuer(options.issuer ?? TEST_ISSUER)
      .setAudience(options.audience ?? TEST_PROJECT_ID)
      .setIssuedAt(issuedAt);
    if (options.omitExpiration !== true) {
      token.setExpirationTime(options.expiresAt ?? issuedAt + SECONDS_PER_HOUR);
    }
    return token.sign(options.signingKey ?? privateKey);
  }

  return { keySet, signIdToken };
}

/** A key pair unrelated to the published key set, for forging signatures. */
export async function generateForeignSigningKey() {
  const { privateKey } = await generateKeyPair(SIGNING_ALGORITHM);
  return privateKey;
}
