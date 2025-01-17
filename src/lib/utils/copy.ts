let clipboardID = 0;
const textareaIdentifierKey = 'usableReactClipboardHook';
/**
 * As a fallback when `navigator.clipboard` is unavailable, we create an
 * ephemeral <textarea> to perform the copy operation. In some cases, we want to
 * identify this <textarea> so that we can act accordingly to focus changes
 * (while copying, the <textarea> momentarily steals focus).
 *
 * The validation check performed by this function is naive, returning `true` if
 * a known dataset value is attached to the given `element`.
 */
function isEphemeralCopyToClipboardTextarea(element: HTMLTextAreaElement | null) {
  return !!element?.dataset?.[textareaIdentifierKey];
}

/**
 * Copies text to the native clipboard, either via the `navigator.clipboard`
 * API, or old `document.execCommand('copy')` hacks!
 *
 * Based on this excellent StackOverflow answer:
 * https://stackoverflow.com/a/45308151
 */
export async function copyToClipboard(text?: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const activeEl = document.activeElement as HTMLElement;
    const textarea = document.createElement('textarea');

    // Make sure we can detect this element
    textarea.dataset[textareaIdentifierKey] = `clipboard-${++clipboardID}`;

    // Move it off-screen.
    textarea.style.position = 'absolute';
    textarea.style.left = '-2147483647em';

    // Set to readonly to prevent mobile devices opening a keyboard when
    // text is .select()'ed.
    textarea.setAttribute('readonly', 'true');

    document.body.appendChild(textarea);

    textarea.value = text;

    // Check if there is any content selected previously.
    const selected = (document.getSelection()?.rangeCount ?? NaN) > 0 ? document.getSelection()?.getRangeAt(0) : false;

    // iOS Safari blocks programmatic execCommand copying normally, without this hack.
    // https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
    const iOSPattern = /ipad|ipod|iphone/i;

    if (iOSPattern.test(navigator.userAgent)) {
      const editable = textarea.contentEditable;
      textarea.contentEditable = 'true';
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      textarea.setSelectionRange(0, 999999);
      textarea.contentEditable = editable;
    } else {
      textarea.select();
    }

    document.execCommand('copy');

    // Restore previous selection
    if (selected) {
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(selected);
    }

    // Restore previous focus
    if (activeEl?.focus && isEphemeralCopyToClipboardTextarea(document.activeElement as HTMLTextAreaElement)) {
      activeEl.focus();
    }
  }
}
