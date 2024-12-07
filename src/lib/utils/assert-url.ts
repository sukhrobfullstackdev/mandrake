import { POPUP_BASE_URL, POPUP_VERIFY_PATH } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import { IS_PROD_ENV, MAGIC_DASHBOARD_LIST, MGBOX_API_URL, REVEAL_MAGIC_URL, WILD_CARD } from '@constants/env';
import { JsonRpcRequestPayload } from '@magic-sdk/types';

export const replaceWildcardHack = (allowListDomain: string) => {
  let hasReplacedWildcard = false;
  let allowListDomainUrl: URL;

  if (!allowListDomain.includes('*.')) {
    allowListDomainUrl = new URL(allowListDomain);
  } else {
    hasReplacedWildcard = true;
    allowListDomainUrl = new URL(allowListDomain.replace('*.', `${WILD_CARD}.`));
  }

  return { allowListDomainUrl, hasReplacedWildcard };
};

export const assertURLWithDomainAllowlist = (domainAllowlist: string[], urlToMatch: string): boolean => {
  const reasons: [{ allowListDomain: string; reason: string }?] = [];

  try {
    const url = new URL(urlToMatch);
    const { hostname, protocol, origin, pathname } = url;

    // Special handling for localhost
    if (hostname === 'localhost' && protocol === 'http:') {
      return true;
    }

    // Handle OAuth popup verify URL
    if (origin === POPUP_BASE_URL && pathname === POPUP_VERIFY_PATH) {
      return true;
    }

    // Handle MGBOX bypass
    if (urlToMatch === MGBOX_API_URL || urlToMatch === REVEAL_MAGIC_URL || MAGIC_DASHBOARD_LIST.includes(urlToMatch))
      return true;

    const res = domainAllowlist.some(allowListDomain => {
      const { allowListDomainUrl, hasReplacedWildcard } = replaceWildcardHack(allowListDomain);

      // Handle protocol mismatching
      if (protocol !== allowListDomainUrl.protocol) {
        reasons.push({ allowListDomain, reason: 'protocol mismatch' });
        return false;
      }

      const allowListDomainHostname = decodeURI(allowListDomainUrl.hostname);
      const toMatchHostname = decodeURI(hostname);

      const domainParts = allowListDomainHostname.split('.').reverse();
      const toMatchParts = toMatchHostname.split('.').reverse();

      // if two domain length is more than 2, they're mismatch
      if (Math.abs(domainParts.length - toMatchParts.length) > 1) {
        reasons.push({ allowListDomain, reason: 'length obviously longer' });
        return false;
      }

      const domainLastIndex = domainParts.length - 1;
      const toMatchLastIndex = toMatchParts.length - 1;
      const longerIndex = domainLastIndex > toMatchLastIndex ? domainLastIndex : toMatchLastIndex;

      // Handle wildcard domains except the last part
      for (let i = 0; i < longerIndex; i++) {
        if (
          ((!hasReplacedWildcard && domainParts[i] !== '*') || (hasReplacedWildcard && domainParts[i] !== WILD_CARD)) &&
          domainParts[i] !== toMatchParts[i]
        ) {
          reasons.push({ allowListDomain, reason: `parts mismatch ${domainParts[i]}, ${toMatchParts[i]}` });
          return false;
        } // Mismatch found
      }

      // Handle matching root domain without www i.e. magic.link => www.magic.link
      // Handle matching root domain with www i.e. www.magic.link => magic.link
      if (
        Math.abs(domainParts.length - toMatchParts.length) === 1 &&
        ((domainParts[domainLastIndex] === 'www' && toMatchParts[domainLastIndex] !== undefined) ||
          (domainParts[toMatchLastIndex] === undefined && toMatchParts[toMatchLastIndex] !== 'www'))
      ) {
        reasons.push({
          allowListDomain,
          reason: `www ${domainParts[domainLastIndex]}, ${toMatchParts[domainLastIndex]}, ${domainParts[toMatchLastIndex]} ,${toMatchParts[toMatchLastIndex]}`,
        });
        return false;
      }

      return true;
    });

    // Log failing reason
    if (!res) {
      logger.warn('event Origin allowlist check failed', {
        eventOriginToCheck: urlToMatch,
        domainAllowlist,
        reasons,
      });
    }

    return res;
  } catch (error) {
    // Handle invalid URLs
    logger.error('event Origin allowlist check failed unexpected', {
      eventOriginToCheck: urlToMatch,
      domainAllowlist,
      reasons,
      error,
    });
    return false;
  }
};

export const isValidIPAddress = (value?: string | null) => {
  if (!value) return false;

  let hostname = value;
  if (value.includes('://')) {
    try {
      const url = new URL(value);
      hostname = url.hostname;
    } catch (error) {
      // If URL parsing fails, assume it's not a valid IP
      return false;
    }
  }

  // Regular expression to match IP addresses (both IPv4 and IPv6)
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$|^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$/;
  return ipRegex.test(hostname);
};

export const checkAllowlist = (eventOrigin: string, payload?: JsonRpcRequestPayload, accessAllowList?: string[]) => {
  const isAllowlistCheckEnabled = accessAllowList?.length;

  const isPayloadMethodMagic =
    payload?.method.includes('mc') || payload?.method.includes('magic') || payload?.method.includes('mwui');

  // Check if the eventOrigin is an IP address using the isValidIPAddress function
  const isIPAddress = isValidIPAddress(eventOrigin);
  return (
    !isAllowlistCheckEnabled ||
    !isPayloadMethodMagic ||
    (isIPAddress && !IS_PROD_ENV) ||
    assertURLWithDomainAllowlist(accessAllowList, eventOrigin)
  );
};
