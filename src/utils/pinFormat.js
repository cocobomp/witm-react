/**
 * Room codes, read exactly as the WITM app reads them (app 3.5:
 * `lib/src/core/utils/pin_format.dart` and `JoinDeepLink.extractPin`).
 *
 * Stored PINs are always 3 digits: every app version ever shipped refuses to
 * join with anything else, so the storage format never shrinks. The `0XX`
 * subspace is the "short" space: players see and type those codes as
 * 2 digits, and the app puts the leading zero back before the lookup.
 */

/** Digits a player types for a short-space code. */
export const SHORT_PIN_ENTRY_LENGTH = 2;

/** Digits of every stored PIN. */
export const STORED_PIN_LENGTH = 3;

/** What a `/j/<code>` link may carry: the stored PIN, or a 2-digit code. */
const JOIN_CODE_PATTERN = /^\d{2,3}$/;

/** Prefix of the copied text, so the app's « Paste the code » chip trusts it. */
const COPY_PREFIX = 'WITM';

/** The code to print and read aloud: `042` reads `42`. */
export function displayPin(pin) {
  if (pin.length === STORED_PIN_LENGTH && pin.startsWith('0')) {
    return pin.slice(1);
  }
  return pin;
}

/** The stored PIN for what was typed: a 2-digit code gets its zero back. */
export function entryToStoredPin(entry) {
  return entry.length === SHORT_PIN_ENTRY_LENGTH ? `0${entry}` : entry;
}

/**
 * The stored PIN a `/j/<code>` link carries, or null when the code is not
 * 2 or 3 digits (the app refuses those links too).
 */
export function parseJoinPin(rawCode) {
  const code = rawCode ?? '';
  if (!JOIN_CODE_PATTERN.test(code)) return null;
  return entryToStoredPin(code);
}

/**
 * The text the copy buttons put on the clipboard, « WITM 42 » (spec 3.5
 * §4.4): recognisable to a human, and read by the app as a certain code.
 */
export function copyTextFor(pin) {
  return `${COPY_PREFIX} ${displayPin(pin)}`;
}
