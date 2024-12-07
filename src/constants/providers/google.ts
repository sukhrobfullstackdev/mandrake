import { OAuthProviderConfig } from '@custom-types/oauth';

export const google: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    defaultScopes: ['openid', 'email', 'profile'],
    defaultParams: { response_type: 'code', access_type: 'offline' },
  },
};
