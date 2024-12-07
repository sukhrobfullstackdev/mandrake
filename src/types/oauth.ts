import { RpcErrorCode } from '@constants/json-rpc';

export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  MICROSOFT = 'microsoft',
  TWITCH = 'twitch',
  BITBUCLKET = 'bitbucket',
  DISCORD = 'discord',
  GITLAB = 'gitlab',
}

export interface OAuthServerMetadata {
  provider?: string;
  magic_api_key?: string;
  magic_challenge?: string;
  magic_redirect_uri?: string;
  oauth_redirect_uri?: string;
  oauth_state?: string;
  oauth_scope?: string;
  platform?: PlatformType;
  bundleId?: string;
}

export type PlatformType = 'rn' | 'web';

export type OAuthPrompt = 'consent' | 'login' | 'none';

export interface OAuthClientMetadata {
  magic_api_key?: string;
  encrypted_access_token?: string;
}

export type OAuthAuthorizationRequest = AbstractOAuthFieldConfig<{
  appID: string;
  redirectURI: string;
  scope: string[];
  state: string;
  loginHint: string;
  bundleId?: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'plain' | 'S256';
  prompt?: OAuthPrompt;
}>;

export type OAuthAuthorizationResponse = AbstractOAuthFieldConfig<{
  authorizationCode: string;
  state: string;
  idToken?: string;
  error?: string;
  errorDescription?: string;
  errorURI?: string;
  oauthVerifier?: string;
  scope?: string;
  user?: Record<string, unknown>;
  hd?: string;
}>;

export type AbstractOAuthFieldConfig<TDataTypes extends Record<string, unknown> = Record<string, unknown>> = {
  [P in keyof TDataTypes]: string;
};

export type AbstractOAuthFieldValues<TFieldConfig extends AbstractOAuthFieldConfig = AbstractOAuthFieldConfig> =
  TFieldConfig extends AbstractOAuthFieldConfig<infer TDataTypes>
    ? {
        [K in keyof TDataTypes]?: TDataTypes[K];
      }
    : never;

export type AuthorizationRequestFieldValues = AbstractOAuthFieldValues<OAuthAuthorizationRequest>;

export type AuthorizationResponseFieldValues = AbstractOAuthFieldValues<OAuthAuthorizationResponse>;

// --- Provider Configuration Types ----------------------------------------- //

interface BaseEndpointConfig {
  endpoint: string;
}

interface AuthorizationConfig extends BaseEndpointConfig {
  endpoint: string;

  /**
   * Scopes to include by default with the authorization request.
   */
  defaultScopes?: string[];

  /**
   * Fields given here will be passed into the
   * authorization query as is.
   */
  defaultParams?: Record<string, string>;
}

interface BaseProviderConfig {
  authorization: AuthorizationConfig;
  useMagicServerCallback?: boolean;
}

export type OAuth1ProviderConfig = BaseProviderConfig & {
  oauthVersion: 1;
};

export type OAuth2ProviderConfig = BaseProviderConfig & {
  oauthVersion: 2;
};

export type OAuthProviderConfig = OAuth1ProviderConfig | OAuth2ProviderConfig;

export type SupportedOAuthProviders = Record<string, OAuthProviderConfig>;

export interface OAuthPopupStartUrlParams {
  magicApiKey?: string;
  platform?: PlatformType;
  dpop?: string;
  oauthId?: string;
  oauthAppId?: string;
  oauthAppRedirectId?: string;
}

export interface OAuthMetadata {
  state: string;
  codeVerifier: string;
  provider: string;
  redirectUri: string;
  appID: string;
  dpop: string;
  apiKey: string;
}

export type OAuthFinishedSuccessResult<T> = {
  isSuccess: true;
  mfaEnabled?: boolean;
  data: T;
};

export type OAuthFinishedErrorResult = {
  isSuccess: false;
  mfaEnabled?: false;
  data: {
    errorCode?: RpcErrorCode;
    errorMessage: string;
  };
};

export type OAuthFinishedResult<T> = OAuthFinishedSuccessResult<T> | OAuthFinishedErrorResult;
