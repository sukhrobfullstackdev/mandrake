import { OauthStart, Props } from '@components/oauth/oauth-start';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { OAuthApp } from '@custom-types/magic-client';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';
import { mockOauthApp } from '@mocks/magic-client';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { encodeBase64 } from '@utils/base64';

const mockReject = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnError = jest.fn();
const mockDataSetItem = jest.fn();

jest.mock('@hooks/common/json-rpc-request');
jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn(),
}));

jest.mock('@lib/services/web-storage/data-api', () => ({
  data: {
    setItem: () => mockDataSetItem(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@lib/utils/crypto', () => ({
  createCryptoChallenge: jest.fn().mockReturnValue({
    state: '123abc',
    codeVerifier: 'abcdefg',
    challenge: '0987poiu',
  }),
}));

const encodedState = encodeBase64(
  JSON.stringify({
    cryptoChallengeState: '123abc',
  }),
);

const mockProps = {
  provider: 'google',
  redirectUri: 'http://localhost:3000/devapp',
  scope: 'email',
  onSuccess: mockOnSuccess,
  onError: mockOnError,
};

const mockFlags = { oauthV2ServerDetour: false };

interface SetupProps {
  propsOverride?: Partial<Props>;
  flags?: any;
  oauthData?: OAuthApp | null;
}

const setup = (
  { propsOverride = mockProps, flags = mockFlags, oauthData = mockOauthApp }: SetupProps = {
    propsOverride: mockProps,
    flags: mockFlags,
    oauthData: mockOauthApp,
  },
) => {
  const props = {
    ...mockProps,
    ...propsOverride,
  };

  const queryClient = new QueryClient(TEST_CONFIG);

  queryClient.setQueryData(magicClientQueryKeys.oauthApp({ provider: propsOverride.provider || mockProps.provider }), [
    oauthData,
  ]);

  (useFlags as jest.Mock).mockImplementation(() => flags);

  render(
    <QueryClientProvider client={queryClient}>
      <OauthStart {...props} />
    </QueryClientProvider>,
  );
};

describe('OauthStart', () => {
  beforeEach(() => {
    jest.resetModules();

    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockReject);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject SDK when OAuth app is not set up', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'facebook',
        },
        oauthData: null,
      });
    });

    expect(mockReject).toHaveBeenCalledWith(
      RpcErrorCode.InvalidParams,
      RpcErrorMessage.MissingOAuthProviderConfiguration,
    );
  });

  it('should resolve with on success', async () => {
    await act(async () => {
      await setup();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `https://accounts.google.com/o/oauth2/v2/auth?client_id=abcdef&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdevapp&state=${encodedState}&scope=openid%20email%20profile&code_challenge=0987poiu&code_challenge_method=S256&response_type=code&access_type=offline`,
      useMagicServerCallback: false,
    });
  });

  it('should enable server detour if oauthV2ServerDetour flag is enabled ', async () => {
    await act(async () => {
      await setup({
        flags: { oauthV2ServerDetour: true },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `/v2/oauth2/google/start?magic_api_key=&state=${encodedState}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdevapp&provider_authorization_url=https%3A%2F%2Faccounts.google.com%2Fo%2Foauth2%2Fv2%2Fauth%3Fclient_id%3Dabcdef%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%252Fv1%252Foauth2%252Fhttps%253A%252F%252Ftest.com%252Fcallback%26state%3D${encodedState}%26scope%3Dopenid%2520email%2520profile%26code_challenge%3D0987poiu%26code_challenge_method%3DS256%26response_type%3Dcode%26access_type%3Doffline`,
      useMagicServerCallback: true,
    });
  });

  it('should resolve with on success with twitch', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'twitch',
          redirectUri: 'https://another-url.com',
        },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `https://id.twitch.tv/oauth2/authorize?client_id=abcdef&redirect_uri=https%3A%2F%2Fanother-url.com&state=${encodedState}&scope=openid%20user%3Aread%3Aemail%20email&code_challenge=0987poiu&code_challenge_method=S256&response_type=code&claims=%7B%22userinfo%22%3A%7B%22email%22%3Anull%2C%22email_verified%22%3Anull%2C%22picture%22%3Anull%2C%22preferred_username%22%3Anull%7D%7D`,
      useMagicServerCallback: false,
    });
  });

  it('should resolve with on success with apple and adjusted server callback uri', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'apple',
          redirectUri: 'https://another-url.com',
        },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `/v2/oauth2/apple/start?magic_api_key=&state=${encodedState}&redirect_uri=https%3A%2F%2Fanother-url.com&provider_authorization_url=https%3A%2F%2Fappleid.apple.com%2Fauth%2Fauthorize%3Fclient_id%3Dabcdef%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%252Fv1%252Foauth2%252Fhttps%253A%252F%252Ftest.com%252Fcallback%26state%3D${encodedState}%26scope%3Dopenid%2520email%2520name%26code_challenge%3D0987poiu%26code_challenge_method%3DS256%26response_type%3Dcode%26response_mode%3Dform_post`,
      useMagicServerCallback: true,
    });
  });

  it('should resolve with on success with github', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'github',
        },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `https://github.com/login/oauth/authorize?client_id=abcdef&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdevapp&state=${encodedState}&scope=read%3Auser%20user%3Aemail%20email&code_challenge=0987poiu&code_challenge_method=S256`,
      useMagicServerCallback: false,
    });
  });

  it('should resolve with on success with linkedin', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'linkedin',
        },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `https://www.linkedin.com/oauth/v2/authorization?client_id=abcdef&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdevapp&state=${encodedState}&scope=r_emailaddress%20r_liteprofile%20email&code_challenge=0987poiu&code_challenge_method=S256&response_type=code`,
      useMagicServerCallback: false,
    });
  });

  it('should resolve with on success with twitter', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'twitter',
        },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `https://twitter.com/i/oauth2/authorize?client_id=abcdef&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdevapp&state=${encodedState}&scope=users.read%20tweet.read%20email&code_challenge=0987poiu&code_challenge_method=S256&response_type=code`,
      useMagicServerCallback: false,
    });
  });

  it('should resolve with on success with facebook', async () => {
    await act(async () => {
      await setup({
        propsOverride: {
          provider: 'facebook',
        },
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith({
      oauthAuthoriationURI: `https://www.facebook.com/v8.0/dialog/oauth?client_id=abcdef&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdevapp&state=${encodedState}&scope=email&code_challenge=0987poiu&code_challenge_method=S256&response_type=code`,
      useMagicServerCallback: false,
    });
  });
});
