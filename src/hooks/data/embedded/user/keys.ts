export type UserSessionTokenFromRefreshTokenQueryKey = ReturnType<typeof userQueryKeys.sessionTokenFromRefreshToken>;

export type UserInfoQueryKey = ReturnType<typeof userQueryKeys.info>;

export interface UserInfoParams {
  authUserId: string;
  walletType: string;
  authUserSessionToken: string;
}

export interface SessionTokenFromRefreshTokenParams {
  jwt: string;
  rt: string;
}

export const userQueryKeys = {
  base: ['user'] as const,

  sessionTokenFromRefreshToken: (params: SessionTokenFromRefreshTokenParams) =>
    [[...userQueryKeys.base, 'session-token-from-refresh-token'], params] as const,

  info: (params: UserInfoParams) => [[...userQueryKeys.base, 'info'], params] as const,
};

export interface UserLogoutParams {
  authUserId: string;
}

export interface UserLogoutResponse {}
