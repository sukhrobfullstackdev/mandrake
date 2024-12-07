import { OAuthProviderConfig } from '@custom-types/oauth';

export const microsoft: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    defaultScopes: ['openid', 'email', 'profile'],
    defaultParams: {
      response_type: 'code',
    },
  },
};
