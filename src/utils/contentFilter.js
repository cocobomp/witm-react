import { BLOCKED_STEMS, BLOCKED_WORDS } from '../constants/contentFilterWords.js';

/**
 * Port of the app's content filter (`ContentFilter` in
 * `lib/src/core/moderation/content_filter.dart`, WITM 3.5): the join page
 * shows an inviter name only when the app would show it too.
 *
 * Matching happens on a normalised copy: lowercase, diacritics stripped,
 * common leetspeak undone, letters stretched three times or more collapsed,
 * punctuation used as a separator ("p.u.t.e") removed inside words.
 */

const LEET = {
  0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b',
  '@': 'a', $: 's', '!': 'i', '+': 't', '€': 'e',
};

const DIACRITICS = {
  à: 'a', á: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a',
  ç: 'c', è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i', ñ: 'n',
  ò: 'o', ó: 'o', ô: 'o', ö: 'o', õ: 'o', ø: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u', ÿ: 'y', ß: 'ss', œ: 'oe',
};

// The app uses a lookbehind; a captured letter does the same job and keeps
// the page loading on Safari versions without lookbehind support.
const SEPARATOR_INSIDE_WORD = /([a-z])[.\-_*](?=[a-z])/g;
const NON_LETTER = /[^a-z ]+/g;
const SPACES = / +/g;
// A letter repeated three times or more is a stretch, not spelling.
const STRETCHED = /(.)\1{2,}/g;

/** The comparable form of [text], as the app computes it. */
export function normaliseText(text) {
  let mapped = '';
  for (const char of text.toLowerCase()) {
    mapped += DIACRITICS[char] ?? LEET[char] ?? char;
  }
  return mapped
    .replace(SEPARATOR_INSIDE_WORD, '$1')
    .replace(NON_LETTER, ' ')
    .replace(STRETCHED, '$1')
    .replace(SPACES, ' ')
    .trim();
}

/** Whether [text] passes the filter. Empty text is clean. */
export function isCleanText(text) {
  const normalised = normaliseText(text);
  if (!normalised) return true;

  for (const stem of BLOCKED_STEMS) {
    if (normalised.includes(stem)) return false;
  }

  const padded = ` ${normalised} `;
  for (const word of BLOCKED_WORDS) {
    if (padded.includes(` ${word} `)) return false;
  }
  return true;
}
