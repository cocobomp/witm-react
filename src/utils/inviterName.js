import { isCleanText } from './contentFilter.js';

/**
 * Longest inviter name shown, in user-perceived characters. Same cap as the
 * app (`JoinDeepLink.inviterNameMaxLength`), which also cuts the name before
 * it puts it in the link.
 */
export const INVITER_NAME_MAX_LENGTH = 20;

// Controls and bidirectional overrides: invisible, yet a crafted link could
// use them to reorder or hide what the title says.
const INVISIBLE_CONTROLS = /[\p{Cc}‎‏‪-‮⁦-⁩]/gu;

function takeCharacters(text, count) {
  if (typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function') {
    return Array.from(text).slice(0, count).join('');
  }
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  let taken = '';
  let takenCount = 0;
  for (const { segment } of segmenter.segment(text)) {
    if (takenCount === count) break;
    taken += segment;
    takenCount += 1;
  }
  return taken;
}

/**
 * The inviter's name a join link carries in `n`, ready to print. Read the
 * way the app reads it (`JoinDeepLink.extractInviterName`): trimmed, cut to
 * 20 characters, and null when absent, blank or refused by the content
 * filter, in which case the page says « You're invited! ».
 *
 * The result is plain text: React escapes it when rendering.
 */
export function parseInviterName(rawName) {
  const raw = (rawName ?? '').replace(INVISIBLE_CONTROLS, '').trim();
  const cut = takeCharacters(raw, INVITER_NAME_MAX_LENGTH).trim();
  if (!cut) return null;
  if (!isCleanText(cut)) return null;
  return cut;
}
