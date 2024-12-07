import { OAuthProviderConfig } from '@custom-types/oauth';

export const bitbucket: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://bitbucket.org/site/oauth2/authorize',
    defaultScopes: [],
    defaultParams: { response_type: 'code' },
  },
};
