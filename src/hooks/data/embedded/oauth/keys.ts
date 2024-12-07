export type OAuthVerifyQueryKey = ReturnType<typeof oauthQueryKeys.verify>;

export const oauthQueryKeys = {
  base: ['oauth'] as const,

  verify: () => [[...oauthQueryKeys.base, 'verify']] as const,
};
