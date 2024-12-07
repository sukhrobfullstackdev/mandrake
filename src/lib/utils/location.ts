import { isServer } from './context';
import { isValidURL } from './validators';

/**
 * Gets the referrer domain from `document.referrer`, with fallbacks.
 */
export function getReferrer(domainOrigin: string): string {
  if (typeof window === 'undefined') return '';

  const fallback = 'https://no-referrer.magic.link';
  let originDomain: string | undefined = window.location?.ancestorOrigins?.[0] || document?.referrer;

  const magicRegex = /auth.*\.magic\.link$/;

  if (magicRegex.test(originDomain) || !originDomain) {
    originDomain = domainOrigin;
  }

  // Normalize the referrer domain before usage
  return isValidURL(originDomain) ? new URL(originDomain!).origin : fallback;
}

export function redirectTo(url: string): void {
  if (isServer) return;
  window.location.href = url;
}
