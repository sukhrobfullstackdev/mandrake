import { OAuthProviderConfig } from '@custom-types/oauth';

export const legacyTwitter: OAuthProviderConfig = {
  oauthVersion: 1,

  authorization: {
    endpoint: 'https://api.twitter.com/oauth/authorize',
    defaultScopes: ['r_emailaddress', 'r_liteprofile'],
    defaultParams: { response_type: 'code' },
  },
};

export const twitter: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://twitter.com/i/oauth2/authorize',
    defaultScopes: ['users.read', 'tweet.read'],
    defaultParams: { response_type: 'code' },
  },
};
