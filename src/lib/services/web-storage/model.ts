/**
 * Represents the current version of our client-side storage schema. Be aware,
 * incrementing this value WILL DELETE ALL CLIENT-SIDE, SCRIPT-WRITABLE STORAGE
 * FOR ALL USERS!
 */
export const CLIENT_STORAGE_VERSION = 1;

/**
 * The data model we use with `WebStorage` interfaces, including `localStorage`,
 * `sessionStorage`, and `IndexedDB`.
 */
export interface WebStorageModel {
  __client_storage_version__: number;
  isMissingOAuthClientMeta: boolean;
  [key: string]: unknown;
}
