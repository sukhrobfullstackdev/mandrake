import { Endpoint } from '@constants/endpoint';
import { UserInfo } from '@custom-types/user';
import { HttpService } from '@http-services';
import { normalizeUserInfo } from '@lib/legacy-relayer/normalize-user-info';
import { isGlobalAppScope } from '@lib/utils/connect-utils';
import { setDpopHeader } from '@lib/utils/dpop';
import { type QueryFunction } from '@tanstack/react-query';
import { type UserInfoQueryKey, type UserSessionTokenFromRefreshTokenQueryKey } from './keys';

export type GetUserSessionTokenFromRefreshTokenBody = {
  auth_user_refresh_token: string;
};

export type UserSessionTokenFromRefreshTokenResponse = {
  authUserId: string;
  authUserSessionToken: string;
  refreshToken: string;
  phoneNumber?: string;
  email?: string;
};

export const userSessionTokenFromRefreshTokenFetch =
  (): QueryFunction<UserSessionTokenFromRefreshTokenResponse, UserSessionTokenFromRefreshTokenQueryKey> =>
  ({ queryKey: [, params] }) => {
    const body: GetUserSessionTokenFromRefreshTokenBody = {
      auth_user_refresh_token: params.rt,
    };

    const headers = {
      ...setDpopHeader(params.jwt),
    };

    return HttpService.Magic.Post(Endpoint.User.GetUserSessionTokenFromRefreshToken, headers, body);
  };

export const userInfoFetch =
  (): QueryFunction<UserInfo, UserInfoQueryKey> =>
  async ({ queryKey: [, params] }) => {
    const headers = {
      Authorization: `Bearer ${params.authUserSessionToken}`,
    };

    if (isGlobalAppScope()) {
      const userInfoRetrieve = await HttpService.Magic.Get(
        `${Endpoint.Universal.UserInfoRetrieve}?auth_user_id=${params.authUserId}&wallet_type=${params.walletType}`,
        headers,
      );
      return normalizeUserInfo(userInfoRetrieve);
    }

    return HttpService.Magic.Get(
      `${Endpoint.User.GetUserInfo}?auth_user_id=${params.authUserId}&wallet_type=${params.walletType}`,
      headers,
    );
  };
