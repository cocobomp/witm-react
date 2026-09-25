/**
 * Minimal stand-ins for the Vercel Node.js request/response helpers the
 * handler relies on (req.method/headers/body, res.status/json/setHeader/end).
 * `bodyError` mimics Vercel's lazy `req.body` getter, which throws on a
 * malformed JSON body.
 */
export function createMockRequest({ method = 'POST', headers = {}, body, bodyError } = {}) {
  const lowercasedHeaders = Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
  );
  const request = { method, headers: lowercasedHeaders };
  Object.defineProperty(request, 'body', {
    get() {
      if (bodyError) {
        throw bodyError;
      }
      return body;
    },
  });
  return request;
}

export function createMockResponse() {
  return {
    statusCode: undefined,
    headers: {},
    body: undefined,
    isEnded: false,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.isEnded = true;
      return this;
    },
    end() {
      this.isEnded = true;
      return this;
    },
  };
}

export async function invokeHandler(handler, requestOptions) {
  const res = createMockResponse();
  await handler(createMockRequest(requestOptions), res);
  return res;
}

/**
 * Records every upstream call and answers with a canned response, so no test
 * ever reaches the real Groq API or the network.
 */
export function createFakeFetch({ status = 200, json, text } = {}) {
  const calls = [];
  async function fakeFetch(url, init = {}) {
    calls.push({ url: String(url), init });
    const bodyText = text ?? JSON.stringify(json ?? {});
    return new Response(bodyText, { status });
  }
  fakeFetch.calls = calls;
  return fakeFetch;
}

/** Replaces console.error for the duration of `run` and returns what was logged. */
export async function captureConsoleErrors(run) {
  const logged = [];
  const originalConsoleError = console.error;
  console.error = (...args) => logged.push(args);
  try {
    await run();
  } finally {
    console.error = originalConsoleError;
  }
  return logged;
}
