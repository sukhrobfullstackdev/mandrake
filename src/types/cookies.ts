import { OAuthServerMetadata } from './oauth';

export type OAuthClientMetaData = {
  magicApiKey: string;
  encryptedAccessToken: string;
};

/**
 * An interface of client cookies we expect `document.cookie` to contain.
 *
 * NOTE: these cookies should be marked as
 * `httpOnly: false`, `signed: false`, and `plain: true`
 */
export type ClientCookies = Partial<{
  _aucsrf: string;
  _bundleId?: string;
  [key: string]: unknown;
}>;

/**
 * An interface of signed server cookies we expect to be able to parse.
 *
 * NOTE: these cookies should be marked as
 * `httpOnly: true`, `signed: true`, and `plain: true|false`
 */
export type ServerSignedCookies = Partial<{
  _aurt: string;
  _oaservermeta: OAuthServerMetadata;
  _oarid: string;
  [key: string]: unknown;
}>;
