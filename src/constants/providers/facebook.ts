import { OAuthProviderConfig } from '@custom-types/oauth';

export const facebook: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://www.facebook.com/v8.0/dialog/oauth',
    defaultScopes: ['email'],
    defaultParams: { response_type: 'code' },
  },
};
