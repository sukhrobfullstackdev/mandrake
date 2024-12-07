import { OAuthProvider } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import OAuthVerifyPage from '@app/send/rpc/oauth/magic_oauth_login_with_popup/verify/page';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockVerifyResponse } from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockResetAuthState = jest.fn();
const mockVerifyMutation = jest.fn();
const mockSetOAuthState = jest.fn();
const mockOAuthContext = jest.fn().mockImplementation(() => ({
  setOAuthState: jest.fn().mockImplementation(args => mockSetOAuthState(args)),
  metaData: {
    codeVerifier: '12345',
    state: 'ggg999',
    provider: 'google',
    redirectUri: 'http://localhost/oauth2/popup/verify',
    appID: 'abcdefg',
  },
  providerResult:
    'state=ggg999&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none',
}));
const mockRejectActiveRpcRequest = jest.fn();

const mockGetItem = jest.fn().mockImplementation(() => ({
  codeVerifier: '12345',
  state: 'ggg999',
  provider: 'google',
  redirectUri: 'http://localhost/oauth2/popup/verify',
  appID: 'abcdefg',
}));

jest.mock('@hooks/common/auth-state', () => ({
  useResetAuthState: jest.fn().mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  })),
  useSetAuthState: jest.fn().mockImplementation(() => ({
    hydrateAndPersistAuthState: jest.fn(),
  })),
}));
jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: mockReplace,
    prefetch: mockPrefetch,
  })),
}));

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn(),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn(),
  DecryptCommand: jest.fn(),
}));

jest.mock('@message-channel/resolve-json-rpc-response', () => ({
  resolveJsonRpcResponse: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest
    .fn()
    .mockImplementation(() => ({ isHydrateSessionError: false, isHydrateSessionFetched: true })),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ walletCreationError: '' })),
}));
interface SetupParams {
  storeState?: Partial<StoreState>;
  oauthParams?: any;
}
jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({ didToken: '12345', error: false })),
}));

jest.mock('@services/web-storage/data-api', () => ({
  data: {
    getItem: jest.fn().mockImplementation(() => mockGetItem()),
    removeItem: jest.fn(),
  },
}));

jest.mock('@hooks/data/embedded/oauth', () => ({
  useOAuthVerifyMutation: () => ({
    mutate: mockVerifyMutation,
    data: mockVerifyResponse,
  }),
}));

jest.mock('@app/send/rpc/oauth/magic_oauth_login_with_popup/context', () => {
  const contextModule = jest.requireActual('@app/send/rpc/oauth/magic_oauth_login_with_popup/context');
  return {
    ...contextModule,
    useOAuthContext: jest.fn().mockImplementation(() => mockOAuthContext()),
  };
});

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => jest.fn()),
}));

const setup = ({ storeState }: SetupParams = {}) => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_oauth_login_with_popup',
    id: 'my_id',
    params: [
      {
        magicApiKey: 'pk_live_67890fghij',
        platform: 'web',
      },
    ],
  });
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
    ...storeState,
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <OAuthProvider>
        <OAuthVerifyPage />
      </OAuthProvider>
    </QueryClientProvider>,
  );
};

describe('OAuthVerify', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resets state', async () => {
    await act(async () => {
      await setup();
    });

    expect(mockResetAuthState).toHaveBeenCalled();
  });

  it('renders and calls oauthVerifyMutate', async () => {
    await act(async () => {
      await setup();
    });

    expect(mockVerifyMutation).toHaveBeenCalledWith(
      {
        appID: 'abcdefg',
        authorizationCode: '123abc',
        codeVerifier: '12345',
        redirectURI: 'http://localhost/oauth2/popup/verify',
        jwt: '12345',
      },
      expect.anything(),
    );
  });

  it('calls getItem if no metadata', async () => {
    mockOAuthContext.mockImplementationOnce(() => ({
      setOAuthState: jest.fn().mockImplementation(args => mockSetOAuthState(args)),
      metaData: null,
      providerResult:
        'state=ggg999&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none',
    }));

    await act(async () => {
      await setup();
    });

    expect(mockGetItem).toHaveBeenCalled();
  });

  it('should reject request if not authorizationResponseParams', async () => {
    mockOAuthContext.mockImplementationOnce(() => ({
      setOAuthState: jest.fn().mockImplementation(args => mockSetOAuthState(args)),
      metaData: {
        codeVerifier: '12345',
        state: 'ggg999',
        provider: 'google',
        redirectUri: 'http://localhost/oauth2/popup/verify',
        appID: 'abcdefg',
      },
      providerResult: null,
    }));

    await act(async () => {
      await setup();
    });

    expect(mockRejectActiveRpcRequest).toHaveBeenCalled();
  });
});
