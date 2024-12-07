import GenerateProviderURI from '@app/send/rpc/oauth/magic_oauth_login_with_popup/generate-provider-uri';
import { RpcErrorCode } from '@constants/json-rpc';
import { OAuthApp } from '@custom-types/magic-client';
import { useClientConfigAccessAllowlists } from '@hooks/common/client-config';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockOauthApp } from '@mocks/magic-client';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { encodeBase64 } from '@utils/base64';

const mockResolveJsonRpcResponse = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();
const mockReplace = jest.fn();
const mockSetOAuthState = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_oauth_login_with_popup'),
}));

jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn().mockReturnValue({ oauthV2ServerDetour: false }),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: () => mockResolveJsonRpcResponse,
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
}));

jest.mock('@hooks/common/client-config', () => ({
  useClientConfigAccessAllowlists: jest.fn(),
  useRejectActiveRpcRequest: jest.fn(),
}));

jest.mock('@lib/services/web-storage/data-api', () => ({
  data: {
    setItem: jest.fn(),
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

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@app/send/rpc/oauth/magic_oauth_login_with_popup/context', () => ({
  useOAuthContext: jest.fn().mockReturnValue({
    setOAuthState: jest.fn().mockImplementation(args => mockSetOAuthState(args)),
    metaData: {
      provider: 'google',
      redirectURI: 'http://localhost/oauth2/popup/verify',
    },
  }),
}));

interface SetupParams {
  paramsOverride?: any;
  oauthApp?: OAuthApp | null;
}

const setup = ({ paramsOverride = {}, oauthApp = mockOauthApp }: SetupParams = {}) => {
  const params = {
    provider: 'google',
    scope: 'email',
    ...paramsOverride,
  };

  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
  });
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_oauth_login_with_popup',
    id: 'my_id',
    params: [params],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  if (oauthApp) {
    queryClient.setQueryData(magicClientQueryKeys.oauthApp({ provider: params.provider }), [oauthApp]);
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <GenerateProviderURI />
    </QueryClientProvider>,
  );
};

const setupInvalid = ({ paramsOverride = {}, oauthApp = mockOauthApp }: SetupParams = {}) => {
  const params = {
    provider: '',
    scope: 'email',
    ...paramsOverride,
  };

  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
  });
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_redirect_start',
    id: 'my_id',
    params: [params],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  if (oauthApp) {
    queryClient.setQueryData(magicClientQueryKeys.oauthApp({ provider: params.provider }), [oauthApp]);
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <GenerateProviderURI />
    </QueryClientProvider>,
  );
};
describe('OAuthLoginWithRedirect Start', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to popup route', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://test.com'],
    });
    await act(async () => {
      await setup();
    });
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/oauth/magic_oauth_login_with_popup/popup');
  });

  it('Sets oauth contexts with proper oauthAuthoriationURI', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://test.com'],
      redirectUrl: ['http://localhost/oauth2/popup/verify'],
    });
    await act(async () => {
      await setup();
    });

    expect(mockSetOAuthState).toHaveBeenCalledWith({
      metaData: {
        provider: 'google',
        redirectURI: 'http://localhost/oauth2/popup/verify',
      },
      providerURI: `https://accounts.google.com/o/oauth2/v2/auth?client_id=abcdef&redirect_uri=http%3A%2F%2Flocalhost%2Foauth2%2Fpopup%2Fverify&state=${encodedState}&scope=openid%20email%20profile&code_challenge=0987poiu&code_challenge_method=S256&response_type=code&access_type=offline`,
      setOAuthState: expect.any(Function),
    });
  });

  it('does not resolve if no oauth app data is given', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://test.com'],
      redirectUrl: ['https://test.com'],
    });
    await act(async () => {
      await setup({ oauthApp: null });
    });
    expect(mockResolveJsonRpcResponse).not.toHaveBeenCalled();
  });

  it('throws an error if provider is missing from params', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://test.com'],
      redirectUrl: ['https://test.com'],
    });

    await act(async () => {
      await setupInvalid({ paramsOverride: { provider: '' } });
    });

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(RpcErrorCode.InvalidParams);
    });
  });

  it('throws an error if no params are provided', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://test.com'],
      redirectUrl: ['https://test.com'],
    });

    await act(async () => {
      await setupInvalid({ paramsOverride: null });
    });

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(RpcErrorCode.InvalidParams);
    });
  });

  it('redirects to /popup route successfully for a different provider (Facebook)', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://test.com'],
      redirectUrl: ['https://test.com'],
    });

    await act(async () => {
      await setup({ paramsOverride: { provider: 'facebook' } });
    });

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/oauth/magic_oauth_login_with_popup/popup');
  });

  it('throws an error if redirect URI does not exist in access allow list', async () => {
    (useClientConfigAccessAllowlists as jest.Mock).mockReturnValue({
      domain: ['https://relayer-test-kitchen.vercel.app/'],
      redirectUrl: ['https://relayer-test-kitchen.vercel.app/'],
    });
    await act(async () => {
      await setupInvalid();
    });
    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(RpcErrorCode.InvalidParams);
    });
  });
});
