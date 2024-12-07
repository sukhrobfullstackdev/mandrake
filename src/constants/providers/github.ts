import { OAuthProviderConfig } from '@custom-types/oauth';

export const github: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://github.com/login/oauth/authorize',
    defaultScopes: ['read:user', 'user:email'],
  },
};
