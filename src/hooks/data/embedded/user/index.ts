import { useMutation, useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import {
  userInfoFetch,
  userSessionTokenFromRefreshTokenFetch,
  type UserSessionTokenFromRefreshTokenResponse,
} from './fetchers';

import { Endpoint } from '@constants/endpoint';
import { UserInfo } from '@custom-types/user';
import { HttpService } from '@lib/http-services';
import { setDpopHeader } from '@lib/utils/dpop';
import {
  UserLogoutParams,
  UserLogoutResponse,
  type UserInfoQueryKey,
  type UserSessionTokenFromRefreshTokenQueryKey,
} from './keys';

export * from './fetchers';
export * from './keys';

export const useUserSessionTokenFromRefreshTokenQuery = (
  queryKey: UserSessionTokenFromRefreshTokenQueryKey,
  config?: Omit<
    UseQueryOptions<
      UserSessionTokenFromRefreshTokenResponse,
      Error,
      UserSessionTokenFromRefreshTokenResponse,
      UserSessionTokenFromRefreshTokenQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<UserSessionTokenFromRefreshTokenResponse> => {
  const queryFn = userSessionTokenFromRefreshTokenFetch();

  return useQuery({
    queryKey,
    queryFn,
    ...config,
  });
};

export type UserSessionTokenFromRefreshTokenParams = {
  jwt: string;
  userSessionRefreshToken: string;
};

export type VerifyUserSessionParams = {
  walletType: string; // TODO: remove when we have the `v1/auth/user/session/verify` endpoint
  authUserSessionToken: string;
  authUserId: string;
};

export type GetUserSessionTokenFromRefreshTokenBody = {
  auth_user_refresh_token: string;
};

export function useUserSessionTokenFromRefreshTokenMutation() {
  return useMutation({
    mutationFn: (params: UserSessionTokenFromRefreshTokenParams): Promise<UserSessionTokenFromRefreshTokenResponse> => {
      const body: GetUserSessionTokenFromRefreshTokenBody = {
        auth_user_refresh_token: params.userSessionRefreshToken,
      };

      const headers = {
        ...setDpopHeader(params.jwt),
      };

      return HttpService.Magic.Post(Endpoint.User.GetUserSessionTokenFromRefreshToken, headers, body);
    },
    retry: false,
  });
}

export function useVerifyUserSessionMutation() {
  return useMutation({
    mutationFn: (params: VerifyUserSessionParams): Promise<UserInfo> => {
      const headers = {
        Authorization: `Bearer ${params.authUserSessionToken}`,
      };

      // TODO: update when we have the `v1/auth/user/session/verify` endpoint
      return HttpService.Magic.Get(
        `${Endpoint.User.GetUserInfo}?auth_user_id=${params.authUserId}&wallet_type=${params.walletType}`,
        headers,
      );
    },
    retry: false,
  });
}

export const useUserInfoQuery = (
  queryKey: UserInfoQueryKey,
  config?: Omit<UseQueryOptions<UserInfo, Error, UserInfo, UserInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<UserInfo> => {
  const queryFn = userInfoFetch();

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};

export function useUserLogoutQuery() {
  return useMutation({
    mutationFn: (params: UserLogoutParams): Promise<UserLogoutResponse> => {
      const body = {
        auth_user_id: params.authUserId,
      };

      return HttpService.Magic.Post(Endpoint.User.Logout, {}, body);
    },
    gcTime: 1000,
  });
}
