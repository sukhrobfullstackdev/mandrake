import { data } from '@lib/services/web-storage/data-api';
import { decodeBase64URL } from './base64';

export const RELAYER_STORE_KEY_PRIVATE_KEY = 'RELAYER_STORE_KEY_PRIVATE_KEY';
export const RELAYER_STORE_KEY_PUBLIC_JWK = 'RELAYER_STORE_KEY_PUBLIC_JWK';
export const RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC = 'RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC';
export const RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE = 'RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE';
const ALGO_NAME = 'ECDSA';
const ALGO_CURVE = 'P-256';

export const signatureSHA256Type = { name: ALGO_NAME, hash: { name: 'SHA-256' } };

const EC_GEN_PARAMS: EcKeyGenParams = {
  name: ALGO_NAME,
  namedCurve: ALGO_CURVE,
};

export function clearKeys() {
  data.removeItem(RELAYER_STORE_KEY_PUBLIC_JWK);
  data.removeItem(RELAYER_STORE_KEY_PRIVATE_KEY);
}

export function isWebCryptoSupported() {
  const hasCrypto = typeof window !== 'undefined' && !!(window.crypto as never);
  const hasSubtleCrypto = hasCrypto && !!(window.crypto.subtle as never);

  return hasCrypto && hasSubtleCrypto;
}

export async function generateWCKP() {
  const { subtle } = window.crypto;
  const kp = await subtle.generateKey(
    EC_GEN_PARAMS,
    false, // need to export the public key which means private exports too
    ['sign', 'verify'],
  );

  // export keys so we can send the public key.
  const jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey);

  // persist keys
  await data.setItem(RELAYER_STORE_KEY_PRIVATE_KEY, kp.privateKey);
  // persist the jwk public key since it needs to be exported anyways
  await data.setItem(RELAYER_STORE_KEY_PUBLIC_JWK, jwkPublicKey);
}

function binToUrlBase64(bin: string) {
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
}

export function uint8ToUrlBase64(uint8: Uint8Array) {
  let bin = '';
  uint8.forEach(code => {
    bin += String.fromCharCode(code);
  });
  return binToUrlBase64(bin);
}

export function base64ToUint8(base64: string) {
  const binaryString = decodeBase64URL(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateUAKP() {
  const { subtle } = window.crypto;
  const kp = await subtle.generateKey(EC_GEN_PARAMS, false, ['sign', 'verify']);

  // persist keys
  await data.setItem(RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE, kp.privateKey);
  // persist the jwk public key since it needs to be exported anyways
  await data.setItem(RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC, kp.publicKey);

  return kp;
}

export function isJWKValid(key: object): boolean {
  return Object.hasOwn(key, 'x') && Object.hasOwn(key, 'y') && Object.hasOwn(key, 'crv') && Object.hasOwn(key, 'kty');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const binaryString = Array.from(new Uint8Array(buffer))
    .map(byte => String.fromCharCode(byte))
    .join('');
  return binToUrlBase64(binaryString);
}

async function exportKeyToPem(key: CryptoKey, isPublic: boolean): Promise<string> {
  const exportedKey = await window.crypto.subtle.exportKey(isPublic ? 'spki' : 'pkcs8', key);
  const base64 = arrayBufferToBase64(exportedKey);
  const pem =
    `-----BEGIN ${isPublic ? 'PUBLIC' : 'PRIVATE'} KEY-----\n` +
    `${base64.match(/.{1,64}/g)?.join('\n')}\n` +
    `-----END ${isPublic ? 'PUBLIC' : 'PRIVATE'} KEY-----`;
  return pem;
}

export async function generatePemRSAKeyPair() {
  if (!isWebCryptoSupported()) {
    throw new Error('Web Crypto API is not supported in this environment.');
  }

  const { subtle } = window.crypto;

  const keyPair = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: 'SHA-256' },
    },
    true,
    ['encrypt', 'decrypt'],
  );

  // Export keys to PEM format
  const publicKeyPem = await exportKeyToPem(keyPair.publicKey, true);
  const privateKeyPem = await exportKeyToPem(keyPair.privateKey, false);

  return { publicKeyPem, privateKeyPem };
}

function importKeyFromPem(pem: string, isPublic: boolean): Promise<CryptoKey> {
  const base64 = pem.replace(/-----BEGIN (.*)-----|-----END (.*)-----|\s+/g, '');
  const binaryDer = base64ToUint8(base64);
  return window.crypto.subtle.importKey(
    isPublic ? 'spki' : 'pkcs8',
    binaryDer,
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    false,
    isPublic ? ['encrypt'] : ['decrypt'],
  );
}

export async function decryptPemKey(encryptedKey: string, privateKeyPem: string): Promise<string> {
  const privateKey = await importKeyFromPem(privateKeyPem, false);
  const encryptedBuffer = base64ToUint8(encryptedKey);

  const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedBuffer);

  return new TextDecoder().decode(decryptedBuffer);
}
