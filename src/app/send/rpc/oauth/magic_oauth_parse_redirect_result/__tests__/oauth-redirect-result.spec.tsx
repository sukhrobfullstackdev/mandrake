import { useResetAuthState } from '@hooks/common/auth-state';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockLegacyOAuthResultParams, mockOAuthUserInfo } from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import OAuthRedirectResult from '../oauth-redirect-result';

const mockReplace = jest.fn();
const mockedMutate = jest.fn();
const mockResetAuthState = jest.fn();

const MOCK_VERIFIER = '67890fghij';
const MOCK_STATE = 'zsMcFsW';
const MOCK_OAUTH_PARAMS = [mockLegacyOAuthResultParams, MOCK_VERIFIER, MOCK_STATE];

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_oauth_parse_redirect_result'),
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

jest.mock('@lib/message-channel/resolve-json-rpc-response', () => ({
  resolveJsonRpcResponse: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ walletCreationError: '' })),
}));

jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({ didToken: '12345', error: false })),
}));

jest.mock('@hooks/common/auth-state', () => ({
  useResetAuthState: jest.fn().mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  })),
  useSetAuthState: jest.fn().mockImplementation(() => ({
    hydrateAndPersistAuthState: jest.fn(),
  })),
}));

jest.mock('@hooks/data/embedded/legacy-oauth', () => ({
  useOAuthVerifyQuery: () => ({ mutate: mockedMutate }),
  useOAuthUserInfoQuery: jest.fn().mockResolvedValue({
    data: mockOAuthUserInfo,
  }),
}));

jest.mock('@lib/legacy-relayer/dispatch-phantom-clear-cache-keys', () => ({
  dispatchPhantomClearCacheKeys: jest.fn(),
}));

interface SetupParams {
  storeState?: Partial<StoreState>;
  oauthParams?: string[];
}

const setup = ({ storeState, oauthParams = MOCK_OAUTH_PARAMS }: SetupParams = {}) => {
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
    ...storeState,
  });

  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: 'my_id',
    params: oauthParams,
  });

  (useResetAuthState as jest.Mock).mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  }));

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <OAuthRedirectResult />
    </QueryClientProvider>,
  );
};

describe('OAuthLoginWithRedirect', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders and calls oauthVerifyMutate', async () => {
    setup();

    await waitFor(() => {
      expect(mockedMutate).toHaveBeenCalledWith(
        {
          jwt: '12345',
          magicVerifier: MOCK_VERIFIER,
          magicCredential: 'WyIweDUwYjYxNzNmODEx',
          magicOAuthRequestID: 'j3JItNV02oTLG-RMxoC9598JeN8vxdbYARa7GbqTFVc=',
        },
        expect.anything(),
      );
    });
  });
});
