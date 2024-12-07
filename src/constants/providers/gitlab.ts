import { OAuthProviderConfig } from '@custom-types/oauth';

export const gitlab: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://gitlab.com/oauth/authorize',
    defaultScopes: ['openid', 'profile', 'email'],
    defaultParams: { response_type: 'code' },
  },
};
