import { authenticateAdmin, resolveAdminEmails } from './admin-auth.js';
import { validateClaudeRequest } from './claude-request-validation.js';
import { runAiAction } from './groq-actions.js';
import { HttpError } from './http-error.js';

const ALLOWED_ORIGINS = [
  'https://whoisthemost.com',
  'https://www.whoisthemost.com',
  'https://witm-react.vercel.app',
  'http://localhost:5173',
];
const PREFLIGHT_MAX_AGE_SECONDS = '86400';
const HEALTH_ACTION = 'health';
const FIRST_SERVER_ERROR_STATUS = 500;

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', PREFLIGHT_MAX_AGE_SECONDS);
}

function sendError(res, error) {
  if (error.status === 401) {
    res.setHeader('WWW-Authenticate', 'Bearer');
  }
  return res.status(error.status).json({ error: { code: error.code, message: error.message } });
}

function readJsonBody(req) {
  let body;
  try {
    // Vercel parses the body lazily and throws on malformed JSON.
    body = req.body;
  } catch (error) {
    throw new HttpError(400, 'INVALID_REQUEST', 'The request body must be valid JSON.', { cause: error });
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'INVALID_REQUEST', 'The request body must be a JSON object.');
  }
  return body;
}

function requireApiKey(env) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new HttpError(500, 'NOT_CONFIGURED', 'The AI API key is not configured.');
  }
  return apiKey;
}

async function handlePost(req, res, deps) {
  const body = readJsonBody(req);
  if (body.action === HEALTH_ACTION) {
    return res.status(200).json({ status: 'ok' });
  }

  // Authenticate before looking at the payload: anonymous callers learn nothing.
  await authenticateAdmin(req.headers.authorization, {
    verifyIdToken: deps.verifyIdToken,
    adminEmails: resolveAdminEmails(deps.env.ADMIN_EMAILS),
  });
  const params = validateClaudeRequest(body);
  const apiKey = requireApiKey(deps.env);
  const result = await runAiAction(body.action, params, { apiKey, fetchFn: deps.fetchFn });
  return res.status(200).json(result);
}

function toHttpError(error) {
  if (error instanceof HttpError) {
    return error;
  }
  return new HttpError(500, 'INTERNAL_ERROR', 'Internal server error.', { cause: error });
}

/**
 * Builds the Vercel handler for /api/claude. Every action except the health
 * check requires a Firebase ID token of an admin (see authenticateAdmin).
 *
 * @param {object} deps
 * @param {(idToken: string) => Promise<object>} deps.verifyIdToken Firebase ID token verifier.
 * @param {typeof fetch} deps.fetchFn Used for every Groq call.
 * @param {Record<string, string|undefined>} deps.env GROQ_API_KEY, ADMIN_EMAILS.
 */
export function createClaudeHandler(deps) {
  return async function claudeHandler(req, res) {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    if (req.method !== 'POST') {
      return sendError(res, new HttpError(405, 'METHOD_NOT_ALLOWED', 'Use POST.'));
    }

    try {
      return await handlePost(req, res, deps);
    } catch (error) {
      const httpError = toHttpError(error);
      // Server-side failures end here: log them once, with their cause chain.
      if (httpError.status >= FIRST_SERVER_ERROR_STATUS) {
        console.error('AI proxy request failed', httpError);
      }
      return sendError(res, httpError);
    }
  };
}
