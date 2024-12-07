import CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes';
import sha256 from 'crypto-js/sha256';

// Encoders
import EncodeUTF8 from 'crypto-js/enc-utf8';

export type CreateCryptoChallengeReturn = {
  codeVerifier: string;
  challenge: string;
  state: string;
};

export const HAS_BUILT_IN_CRYPTO = typeof window !== 'undefined' && !!window.crypto;

/**
 * Stringifies `bytes` using the OAuth 2.0 `code_verifier` character set.
 */
export function bytesToOAuth2CompatibleString(bytes: Uint8Array) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  return Array.from(bytes)
    .map((value: number) => charset[value % charset.length])
    .join('');
}

export function createRandomString(size: number) {
  const bytes = new Uint8Array(size);

  if (HAS_BUILT_IN_CRYPTO) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i += 1) bytes[i] = Math.floor(Math.random() * Math.floor(255));
  }

  return bytesToOAuth2CompatibleString(bytes);
}
export const MD5 = {
  /**
   * Produces a MD5 hash of the given `message`.
   */
  digest(message?: string) {
    const hash = CryptoJS.MD5(message ?? '');
    return hash.toString();
  },
};

export const SHA256 = {
  digest(message?: string) {
    const hash = sha256(message ?? '');
    return hash.toString();
  },
};

export const AES = {
  /**
   * AES encrypts `message` using `secretPassphrase`.
   */
  encrypt(message: string, secretPassphrase: string | null) {
    const ciphertext = CryptoAES.encrypt(message, secretPassphrase || '');
    const result = ciphertext.toString();

    // Mark the secret passphrase variable for garbage collection.
    secretPassphrase = null;

    return result;
  },

  /**
   * AES decrypts `message` using `secretPassphrase`.
   */
  decrypt(message: string, secretPassphrase: string | null) {
    const bytes = CryptoAES.decrypt(message, secretPassphrase || '');
    const result = bytes.toString(EncodeUTF8);

    // Mark the secret passphrase variable for garbage collection.
    secretPassphrase = null;

    return result;
  },
};

function verifierToBase64URL(input: CryptoJS.lib.WordArray) {
  return input.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Creates OAuth 2.0-compatible `code_verifier`, `code_challenge`, and `state`
 * parameters.
 */
export function createCryptoChallenge(): CreateCryptoChallengeReturn {
  const state = createRandomString(128);
  const codeVerifier = createRandomString(128);
  const challenge = verifierToBase64URL(sha256(codeVerifier));
  return { codeVerifier, challenge, state };
}
