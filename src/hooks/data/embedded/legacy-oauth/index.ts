import { useMutation, useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { LegacyOAuth } from '@constants/endpoint';
import { HttpService } from '@http-services';
import { setDpopHeader } from '@lib/utils/dpop';
import {
  LegacyOAuthGetUserInfoResponse,
  LegacyOAuthSendCredentialResponse,
  LegacyOAuthSendErrorResponse,
  makeLegacyOAuthSendCredentialFetcher,
  makeLegacyOAuthSendErrorFetcher,
  makeLegacyOAuthUserInfoFetcher,
} from './fetchers';
import {
  legacyOAuthQueryKeys,
  LegacyOAuthSendCredentialParams,
  LegacyOAuthSendErrorParams,
  LegacyOAuthUserInfoParams,
  OAuthSendCredentialKey,
  OAuthSendErrorKey,
  type OAuthUserInfoQueryKey,
} from './keys';

export * from './fetchers';
export * from './keys';

export type LegacyOAuthVerifyParams = {
  magicOAuthRequestID: string;
  magicVerifier: string;
  magicCredential: string;
  jwt?: string;
};

export type LegacyOAuthVerifyResponse = {
  authUserId: string;
  authUserSessionToken: string;
  accessToken: string;
  providerUserHandle: string;
  refreshToken?: string;
};

export const useOAuthUserInfoQuery = (
  params: LegacyOAuthUserInfoParams,
  config?: Omit<
    UseQueryOptions<LegacyOAuthGetUserInfoResponse, Error, LegacyOAuthGetUserInfoResponse, OAuthUserInfoQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<LegacyOAuthGetUserInfoResponse> => {
  return useQuery({
    queryKey: legacyOAuthQueryKeys.userInfo(params),
    queryFn: makeLegacyOAuthUserInfoFetcher(),
    ...config,
  });
};

export const useOAuthSendCredential = (
  params: LegacyOAuthSendCredentialParams,
  config?: Omit<
    UseQueryOptions<
      LegacyOAuthSendCredentialResponse,
      Error,
      LegacyOAuthSendCredentialResponse,
      OAuthSendCredentialKey
    >,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<LegacyOAuthSendCredentialResponse> => {
  return useQuery({
    queryKey: legacyOAuthQueryKeys.sendCredential(params),
    queryFn: makeLegacyOAuthSendCredentialFetcher(),
    ...config,
  });
};

export const useOAuthSendError = (
  params: LegacyOAuthSendErrorParams,
  config?: Omit<
    UseQueryOptions<LegacyOAuthSendErrorResponse, Error, LegacyOAuthSendErrorResponse, OAuthSendErrorKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<LegacyOAuthSendErrorResponse> => {
  return useQuery({
    queryKey: legacyOAuthQueryKeys.sendError(params),
    queryFn: makeLegacyOAuthSendErrorFetcher(),
    ...config,
  });
};

export const useOAuthVerifyQuery = () => {
  return useMutation({
    mutationFn: ({
      magicOAuthRequestID,
      magicVerifier,
      magicCredential,
      jwt,
    }: LegacyOAuthVerifyParams): Promise<LegacyOAuthVerifyResponse> => {
      return HttpService.Magic.Post(
        LegacyOAuth.Verify,
        {
          ...(magicCredential && { authorization: `Bearer ${magicCredential}` }),
          ...setDpopHeader(jwt),
        },
        {
          magic_oauth_request_id: magicOAuthRequestID,
          magic_verifier: magicVerifier,
        },
      );
    },
  });
};
