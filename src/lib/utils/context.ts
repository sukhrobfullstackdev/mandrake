export const isServer = typeof window === 'undefined';

/**
 * `true` if the page is being rendered in an `iframe`, `false` otherwise.
 */
export const isIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
