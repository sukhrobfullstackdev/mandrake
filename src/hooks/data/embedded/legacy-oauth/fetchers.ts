import { Endpoint } from '@constants/endpoint';
import { OpenIDConnectUserInfo } from '@custom-types/open-id-connect';
import { HttpService } from '@http-services';
import { type QueryFunction } from '@tanstack/react-query';
import qs from 'qs';
import { OAuthSendCredentialKey, OAuthSendErrorKey, type OAuthUserInfoQueryKey } from './keys';

export type LegacyOAuthGetUserInfoResponse = OpenIDConnectUserInfo<'camelCase'>;

export type LegacyOAuthSendCredentialResponse = {
  platform: string;
  query: string;
  redirectURI?: string;
};

export type LegacyOAuthSendErrorResponse = {
  platform: string;
  query: string;
  redirectURI?: string;
};

export const makeLegacyOAuthUserInfoFetcher =
  (): QueryFunction<LegacyOAuthGetUserInfoResponse, OAuthUserInfoQueryKey> =>
  ({ queryKey: [, { provider, authorizationToken }] }) => {
    const endpoint = `${Endpoint.LegacyOAuth.UserInfo}?${qs.stringify({ provider, field_format: 'camelCase' })}`;

    return HttpService.Relayer.Get(endpoint, {
      authorization: `Bearer ${authorizationToken}`,
    });
  };

export const makeLegacyOAuthSendCredentialFetcher =
  (): QueryFunction<LegacyOAuthSendCredentialResponse, OAuthSendCredentialKey> =>
  ({ queryKey: [, { resultQuery }] }) => {
    const endpoint = `${Endpoint.LegacyOAuth.SendCredential}?${resultQuery}`;
    return HttpService.Relayer.Get(endpoint);
  };

export const makeLegacyOAuthSendErrorFetcher =
  (): QueryFunction<LegacyOAuthSendErrorResponse, OAuthSendErrorKey> =>
  ({ queryKey: [, { errorQuery }] }) => {
    const endpoint = `${Endpoint.LegacyOAuth.SendError}?${errorQuery}`;
    return HttpService.Relayer.Get(endpoint);
  };
