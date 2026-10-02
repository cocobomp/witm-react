/**
 * Puts [text] on the clipboard and resolves to whether it worked: the
 * Clipboard API is missing on insecure origins, and browsers may refuse it.
 */
export async function copyText(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard write refused:', error);
    return false;
  }
}
