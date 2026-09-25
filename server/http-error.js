/**
 * An error that maps to one JSON response: `{ error: { code, message } }`.
 * `message` is shown to the admin, so it never carries upstream or internal
 * details; those travel in `cause` and are only logged.
 */
export class HttpError extends Error {
  constructor(status, code, message, options) {
    super(message, options);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
