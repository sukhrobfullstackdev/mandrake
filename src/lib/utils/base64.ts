import { inflate } from 'pako';

function percentToByte(p: string) {
  return String.fromCharCode(parseInt(p.slice(1), 16));
}

function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`;
}

/**
 * Encodes a URI-safe Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * utf8 -> base64
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
export function btoaUTF8(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, percentToByte));
}

/**
 * Decodes a URI-safe Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * base64 -> utf8
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function atobUTF8(str: string): string {
  try {
    return decodeURIComponent(Array.from(atob(str), byteToPercent).join(''));
  } catch {
    // If there happens to be an invalid URI character in the previous
    // operation, we fall back to using vanilla `atob`.
    return atob(str);
  }
}

/**
 * Determines if the given `data` was encoded using `encodeURIComponent`.
 */
function isEncodedURIComponent(data: string) {
  return decodeURIComponent(data) !== data;
}

/**
 * Transform Base64-encoded data to Base64URL-encoded data.
 *
 * base64 -> base64URL
 */
export function toBase64URL(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Transform Base64URL-encoded data to Base64-encoded data.
 *
 * base64URL -> base64
 */
export function fromBase64URL(base64URL: string) {
  let result = base64URL.replace(/-/g, '+').replace(/_/g, '/');

  // Replace padding characters (`=`)
  if (result.length % 4 !== 0) {
    result += '='.repeat(4 - (result.length % 4));
  }

  return result;
}

/**
 * Decode a Base64 string (alias for `atob`).
 *
 * base64 -> utf8
 */
export function decodeBase64(data: string): string {
  return atobUTF8(data);
}

/**
 * Decode a URL-safe Base64 string.
 *
 * base64URL -> utf8
 */
export function decodeBase64URL(data: string): string {
  if (isEncodedURIComponent(data)) {
    return atobUTF8(decodeURIComponent(data));
  }

  return atobUTF8(fromBase64URL(data));
}

/**
 * Encode a Base64 string (alias for `btoa`).
 *
 * utf8 -> base64
 */
export function encodeBase64(data: string): string {
  return btoaUTF8(data);
}

/**
 * Encode a URL-safe Base64 string.
 *
 * base64 -> base64URL
 */
export function encodeBase64URL(data: string): string {
  return toBase64URL(btoaUTF8(data));
}

export function parseJWT(jwt: string) {
  const parts = jwt.split('.');

  if (parts.length !== 3) {
    throw new Error('Cannot parse invalid jwt');
  }

  const header = JSON.parse(decodeBase64URL(parts[0]));
  const payload = JSON.parse(decodeBase64URL(parts[1]));
  const sig = parts[2];

  return {
    header,
    payload,
    sig,
  };
}

export function base64BinaryToUint8Array(base64Binary = '') {
  const binaryString = decodeBase64URL(base64Binary);
  const charData = binaryString.split('').map(x => x.charCodeAt(0));
  const bytes = new Uint8Array(charData);

  return bytes;
}

/**
 * Given a Base64-encoded string of compressed binary data, decode and
 * decompress the data.
 */
export function inflateString(base64Binary: string): string {
  const bytes = base64BinaryToUint8Array(base64Binary);

  try {
    return inflate(bytes, { to: 'string' });
  } catch (err) {
    // Pako does not wrap error messages in `Error` objects for some reason.
    throw new Error(err as string);
  }
}

/**
 * Naively checks if the given string (`base64`)
 * is a valid and parseable Base64 string.
 */
export function isValidBase64(base64: string) {
  try {
    decodeBase64URL(base64);
    return true;
  } catch {
    return false;
  }
}

export function bufferToBase64url(buffer: ArrayBuffer) {
  // modified from https://github.com/github/webauthn-json/blob/main/src/webauthn-json/base64url.ts

  const byteView = new Uint8Array(buffer);
  let str = '';
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }

  // Binary string to base64
  const base64String = btoa(str);

  // Base64 to base64url
  // We assume that the base64url string is well-formed.
  const base64urlString = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return base64urlString;
}

export function base64UrlToArrayBuffer(base64Url: string) {
  // Replace base64url specific characters
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if necessary
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }

  // Decode base64 string to a binary string
  const binaryString = window.atob(base64);

  // Create an ArrayBuffer and populate it with binary data
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}
