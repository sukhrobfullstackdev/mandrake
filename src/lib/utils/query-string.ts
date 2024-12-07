/**
 * Memoize the string arguments given to `getRawOptions` and `getParsedOptions`
 * based on `key` + `queryString`.
 */

import { DecodedQuery } from '@custom-types/params';
import { DecodedQueryParams } from '@hooks/store';
import { getReferrer } from '@utils/location';
import { getNetworkName } from '@utils/network-name';
import { isMobileSdk } from '@utils/platform';
import qs, { ParsedQs } from 'qs';
import { decodeBase64, inflateString } from './base64';

const getWindowQueryParams = () => {
  if (typeof window === 'undefined') return;
  return window.location?.search.slice(1);
};

/**
 * Get the parsed URL query as a plain JS object.
 */
export const getParsedQueryParams = <T = ParsedQs>(queryString?: string): Partial<T> => {
  const trimChar = queryString?.toString().startsWith('?') || queryString?.toString().startsWith('#');
  const queryStringNormalized = trimChar ? queryString?.slice(1) : queryString || getWindowQueryParams();

  if (queryStringNormalized) return qs.parse(queryStringNormalized) as Partial<T>;

  return {};
};

export const getDecodedQueryParams = (queryString: string): DecodedQueryParams => {
  let decodedQueryParams: DecodedQuery;
  // First, we try to decompress the rawOptions...
  try {
    decodedQueryParams = JSON.parse(inflateString(queryString));
  } catch {
    // Reaching this code path means `rawOptions`
    // is probably just encoded JSON...
    try {
      // We use `decode` instead of `decodeURL` because `qs.parse` will have
      // already decoded the URI components for us.
      decodedQueryParams = JSON.parse(decodeBase64(queryString));
    } catch {
      // If we reach another error, then the query string is missing or malformed.
      // We simply return an empty object in that case.
      decodedQueryParams = {};
    }
  }

  // convert to camel case and return
  return {
    apiKey: decodedQueryParams.API_KEY,
    domainOrigin: decodedQueryParams.DOMAIN_ORIGIN,
    ethNetwork: decodedQueryParams.ETH_NETWORK,
    network: decodedQueryParams.network,
    host: decodedQueryParams.host,
    sdkType: decodedQueryParams.sdk,
    version: decodedQueryParams.version,
    ext: decodedQueryParams.ext,
    locale: decodedQueryParams.locale,
    bundleId: decodedQueryParams.bundleId,
    meta: decodedQueryParams.meta,
  };
};

export const generateHeadersFromDecodedParams = (params: DecodedQueryParams): HeadersInit => {
  const {
    bundleId = 'BundleIDMissing',
    domainOrigin = '',
    ethNetwork = 'mainnet',
    locale = '',
    sdkType = 'SdkMissing',
    meta,
    version,
    ext,
    apiKey = '',
  } = params;
  const networkName = getNetworkName(ethNetwork, version, apiKey, isMobileSdk(sdkType, domainOrigin), ext);

  return {
    'accept-language': locale,
    'x-fortmatic-network': networkName,
    'x-magic-api-key': apiKey,
    'x-magic-bundle-id': bundleId,
    'x-magic-referrer': getReferrer(domainOrigin),
    'x-magic-sdk': sdkType || '',
    'x-magic-meta': meta ? btoa(JSON.stringify(meta)) : 'None',
  };
};
