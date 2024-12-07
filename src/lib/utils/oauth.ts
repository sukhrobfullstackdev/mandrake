import { oauthProviders, shared } from '@constants/providers';
import { legacyTwitter, twitter } from '@constants/providers/twitter';
import {
  AbstractOAuthFieldConfig,
  AbstractOAuthFieldValues,
  OAuthPopupStartUrlParams,
  OAuthProvider,
  OAuthProviderConfig,
} from '@custom-types/oauth';
import QueryString from 'qs';
import { UnknownArray, UnknownRecord } from 'type-fest';
import { uniqueArray } from './array-helpers';
import { getParsedQueryParams } from './query-string';

type DualisticProviders = {
  [key: string]: [OAuthProviderConfig, OAuthProviderConfig];
};

export type CheckRedirectAllowlistParams = {
  redirectAllowList?: string[];
  redirectUrl: string;
  isRequired?: boolean;
};

export enum RedirectAllowlistError {
  MISMATCH,
  EMPTY,
}

/** Converts an OAuth scope string into array of scopes */
export const oauthScopeToArray = (scopes?: string | string[]): string[] => {
  if (!scopes) return [];

  let scopesArr: string[] = [];

  if (Array.isArray(scopes)) scopesArr = scopes;

  if (typeof scopes === 'string') {
    scopesArr = scopes.split(/\s+/).map(str => str.trim());
  }

  return uniqueArray(scopesArr as string[]).filter(Boolean) ?? [];
};

/**
 * Consumes OAuth scopes as an array, then outputs as a string.
 */
export const oauthScopeToString = (scopes: string[] = []): string => {
  return uniqueArray((scopes as string[]).map(str => str.trim()))
    .filter(Boolean)
    .join(' ');
};

/** Check if authorization code response contains an error */
export const redirectResultHasError = (paramData: Partial<QueryString.ParsedQs>): boolean => {
  return !!paramData.error || !!paramData.authError;
};

/** Get provider configuration for a given provider */
export const getProviderConfig = (provider: string, version = 2): OAuthProviderConfig => {
  const dualisticProviders: DualisticProviders = {
    twitter: [legacyTwitter, twitter],
  };

  const index = version - 1;

  if (dualisticProviders[provider]?.[index]) {
    return dualisticProviders[provider][index];
  }

  return oauthProviders[provider];
};

/** Check if given provider is valid */
export const isValidProvider = (provider?: OAuthProvider): boolean => {
  return !!provider && !!oauthProviders[provider];
};

/** Format params for constructing authorization code url */
export const formatOAuthFields = <T extends AbstractOAuthFieldConfig>(
  fieldsConfig: T,
  values: AbstractOAuthFieldValues<T>,
  defaultParams: Record<string, string> = {},
) => {
  const result: { [key: string]: unknown | UnknownArray | UnknownRecord } = {};

  Object.keys(fieldsConfig).forEach(key => {
    const fieldKey = fieldsConfig[key];
    const value = values[key];
    result[fieldKey] = Array.isArray(value) ? oauthScopeToString(value) : value;
  });

  return { ...result, ...defaultParams };
};

/**
 * Consumes OAuth scopes as either a string or array and normalizes the input.
 */
export function normalizeOAuthScope(scopes?: string): string;
export function normalizeOAuthScope(scopes: string[]): string[];
export function normalizeOAuthScope(scopes?: string | string[]): string | string[] {
  if (!scopes) return '';

  if (typeof scopes === 'string') {
    return uniqueArray(oauthScopeToArray(scopes as string)).join(' ');
  }

  return uniqueArray((scopes as string[]).map(str => str.trim())).filter(Boolean);
}

export function isHashAppended(state: string): boolean {
  return state.slice(-4) === '#_=_';
}

export function removeHash(state: string): string {
  return state.slice(0, -4);
}

/** Parse url params in authorization code response from provider */
export function parseOAuthFields(query: string): AbstractOAuthFieldValues<AbstractOAuthFieldConfig> {
  const fieldsConfig: AbstractOAuthFieldConfig = shared.authorizationResponseFields;
  const parsedQuery: Partial<QueryString.ParsedQs> = getParsedQueryParams(query);
  const result: Record<string, unknown> = {};

  Object.keys(fieldsConfig).forEach(key => {
    const fieldKey = fieldsConfig[key];
    const value = parsedQuery[fieldKey];

    if (value !== undefined) {
      // Handle case where FB appends a hash to the state param, which causes a mismatch & error thrown
      if (key === 'state' && typeof value === 'string' && isHashAppended(value)) {
        result[key] = removeHash(value);
      } else {
        result[key] = value;
      }
    }
  });

  return result as AbstractOAuthFieldValues<AbstractOAuthFieldConfig>;
}

/** Validates url query params for OAuth popup start route */
export const popupStartParamsAreValid = (params: OAuthPopupStartUrlParams, provider?: OAuthProvider): boolean => {
  return isValidProvider(provider) && !!params.oauthId && !!params.oauthAppId && !!params.oauthAppRedirectId;
};

const defaultRedirectAllowlist = ['https://reveal.magic.link'];

const normalizeUrl = (url: string): string => {
  try {
    const normalizedUrl = new URL(url);
    return normalizedUrl.origin + (normalizedUrl.pathname === '/' ? '' : normalizedUrl.origin + normalizedUrl.pathname);
  } catch (error) {
    return '';
  }
};

const createPatternFromWildcard = (pattern: string): RegExp => {
  if (pattern === 'http://localhost') {
    // Allow any port number for localhost
    return new RegExp(`^http://localhost(:[0-9]+)?$`);
  }

  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = escapedPattern.replace(/\\\*/g, '.*');
  return new RegExp(`^${regexPattern}$`);
};

export const checkRedirectAllowlist = ({
  redirectUrl,
  redirectAllowList = [],
  isRequired = false,
}: CheckRedirectAllowlistParams): {
  redirectUrlIsValid: boolean;
  redirectUrlError?: RedirectAllowlistError | null;
} => {
  if (!isRequired && !redirectAllowList?.length) {
    return { redirectUrlIsValid: true };
  }

  if (defaultRedirectAllowlist.includes(new URL(redirectUrl).origin)) {
    return {
      redirectUrlIsValid: true,
    };
  }

  if (isRequired && redirectAllowList.length === 0) {
    return {
      redirectUrlIsValid: false,
      redirectUrlError: RedirectAllowlistError.EMPTY,
    };
  }

  const normalizedRedirectUrl = normalizeUrl(redirectUrl);

  const isValid = redirectAllowList.some(url => {
    const normalizedUrl = normalizeUrl(url);
    const urlPattern = createPatternFromWildcard(normalizedUrl);
    return urlPattern.test(normalizedRedirectUrl);
  });

  if (!isValid) {
    return {
      redirectUrlIsValid: false,
      redirectUrlError: RedirectAllowlistError.MISMATCH,
    };
  }

  return { redirectUrlIsValid: true };
};
