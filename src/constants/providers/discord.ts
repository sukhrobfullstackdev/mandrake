import { OAuthProviderConfig } from '@custom-types/oauth';

export const discord: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://discord.com/api/oauth2/authorize',
    defaultScopes: ['identify', 'email'],
    defaultParams: { response_type: 'code' },
  },
};
