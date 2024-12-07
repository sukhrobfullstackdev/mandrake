export type OAuthUserInfoQueryKey = ReturnType<typeof legacyOAuthQueryKeys.userInfo>;

export type OAuthSendCredentialKey = ReturnType<typeof legacyOAuthQueryKeys.sendCredential>;

export type OAuthSendErrorKey = ReturnType<typeof legacyOAuthQueryKeys.sendError>;

export type LegacyOAuthUserInfoParams = {
  provider: string;
  authorizationToken: string;
};

export type LegacyOAuthSendCredentialParams = {
  resultQuery: string;
};

export type LegacyOAuthSendErrorParams = {
  errorQuery: string;
};

export const legacyOAuthQueryKeys = {
  base: ['legacy-oauth'] as const,

  userInfo: (params: LegacyOAuthUserInfoParams) => [[...legacyOAuthQueryKeys.base, 'user-info'], params] as const,

  sendCredential: (params: LegacyOAuthSendCredentialParams) =>
    [[...legacyOAuthQueryKeys.base, 'send-credential'], params] as const,

  sendError: (params: LegacyOAuthSendErrorParams) => [[...legacyOAuthQueryKeys.base, 'send-error'], params] as const,
};
