import { OAuthAuthorizationRequest, OAuthAuthorizationResponse } from '@custom-types/oauth';

/**
 * Mapping of standard OAuth 2.0 "authorization" request fields to internal
 * interface.
 */
export const authorizationRequestFields: OAuthAuthorizationRequest = {
  appID: 'client_id',
  redirectURI: 'redirect_uri',
  state: 'state',
  scope: 'scope',
  loginHint: 'login_hint',
  codeChallenge: 'code_challenge',
  codeChallengeMethod: 'code_challenge_method',
  prompt: 'prompt',
};

/**
 * Mapping of standard OAuth 2.0 "authorization" response fields
 * to an internal interface.
 */
export const authorizationResponseFields: OAuthAuthorizationResponse = {
  authorizationCode: 'code',
  idToken: 'id_token',
  state: 'state',
  error: 'error',
  errorDescription: 'error_description',
  errorURI: 'error_uri',
  oauthVerifier: 'oauth_verifier',
  user: 'user',
};
