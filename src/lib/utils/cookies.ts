import { CookieValueTypes } from 'cookies-next';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { UnknownRecord } from 'type-fest';
import { camelizeKeys } from './object-helpers';
import { snakeToCamelCase } from './string-utils';

export const parseCookie = <T = UnknownRecord | unknown>(
  input?: CookieValueTypes | RequestCookie | string,
): T | undefined => {
  if (!input) return;

  const cookie = input as string;
  const decodedValue = decodeURIComponent(cookie);

  let parsedJSON;

  try {
    if (decodedValue.startsWith('j:')) {
      const parsedValue = JSON.parse(decodedValue.slice(2));
      parsedJSON = camelizeKeys(parsedValue);
    }
  } catch {
    parsedJSON = snakeToCamelCase(decodedValue) as T;
  }

  if (!parsedJSON) {
    parsedJSON = snakeToCamelCase(decodedValue) as T;
  }

  return parsedJSON;
};
