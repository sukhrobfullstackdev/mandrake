import { OAuthProviderConfig } from '@custom-types/oauth';

export const linkedin: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    defaultScopes: ['r_emailaddress', 'r_liteprofile'],
    defaultParams: { response_type: 'code' },
  },
};
