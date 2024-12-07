import { OAuthProviderConfig } from '@custom-types/oauth';

export const twitch: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://id.twitch.tv/oauth2/authorize',
    defaultScopes: ['openid', 'user:read:email'],
    defaultParams: {
      response_type: 'code',
      claims: JSON.stringify({
        userinfo: {
          email: null,
          email_verified: null,
          picture: null,
          preferred_username: null,
        },
      }),
    },
  },
};
