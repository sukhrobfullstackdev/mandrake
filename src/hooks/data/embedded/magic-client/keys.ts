export type MagicClientConfigQueryKey = ReturnType<typeof magicClientQueryKeys.config>;

export type MagicClientOAuthAppQueryKey = ReturnType<typeof magicClientQueryKeys.oauthApp>;

export type OauthAppQueryParams = {
  provider: string;
};

export type ClientConfigParams = {
  magicApiKey: string;
};

export const magicClientQueryKeys = {
  base: ['magic-client'] as const,

  config: (params: ClientConfigParams) => [[...magicClientQueryKeys.base, 'config'], params] as const,

  oauthApp: (params: OauthAppQueryParams) => [[...magicClientQueryKeys.base, 'oauth-app'], params] as const,
};
