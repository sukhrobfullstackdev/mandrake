import { OAuthApp } from '@custom-types/magic-client';

export const mockOauthApp: OAuthApp = {
  id: '12345',
  appId: 'abcdef',
  redirectId: 'https://test.com',
};

export const mockOauthAppWithSecret: OAuthApp = {
  ...mockOauthApp,
  appSecret: 'abc123',
};
