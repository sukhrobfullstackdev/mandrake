import { OAuthProviderConfig } from '@custom-types/oauth';

export const apple: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://appleid.apple.com/auth/authorize',
    defaultScopes: ['openid', 'email', 'name'],
    defaultParams: { response_type: 'code', response_mode: 'form_post' },
  },

  useMagicServerCallback: true,
};
