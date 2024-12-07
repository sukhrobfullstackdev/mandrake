import Page from '@app/send/rpc/auth/magic_auth_login_with_oidc/page';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@http-services', () => ({
  Magic: {
    Post: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_login_with_oidc'),
}));

jest.mock('@hooks/data/embedded/oidc-login', () => ({
  useOidcLoginQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockResolvedValue({
      authUserId: 'authUserId',
      magicApiKey: 'magicApiKey',
      authUserSessionToken: 'someToken',
    }),
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({
    didToken: 'successDidToken',
  })),
}));
jest.mock('@lib/message-channel/resolve-json-rpc-response');

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ areWalletsCreated: true, walletCreationError: '' })),
}));

describe('magic_auth_login_with_oidc page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_oidc',
      id: 'my_id',
      params: [{ jwt: 'test_oidc_jwt', providerId: 'test_provider_id', lifespan: 900 }],
    });

    useStore.setState({
      authUserId: 'authUserId',
      magicApiKey: 'magicApiKey',
      authUserSessionToken: 'testUserSessionToken',
    });

    const queryClient = new QueryClient(TEST_CONFIG);

    return render(
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>,
    );
  }
  beforeEach(() => {
    jest.resetModules();
    jest.mock('@hooks/common/json-rpc-request', () => ({
      useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
      useRejectActiveRpcRequest: jest.fn(() => jest.fn()),
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('get or create eth wallet should be called', async () => {
    await act(async () => {
      await executeRequest(); // execute
    });
    await renderHook(() => useHydrateOrCreateWallets());
    expect(useCreateDidTokenForUser).toHaveBeenCalled();
    expect(useHydrateOrCreateWallets).toHaveBeenCalled();
    await waitFor(() => {
      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: {
          id: 'my_id',
          jsonrpc: '2.0',
          method: 'magic_auth_login_with_oidc',
          params: [{ jwt: 'test_oidc_jwt', providerId: 'test_provider_id', lifespan: 900 }],
        },
        sdkMetadata: {},
        analyticsProperties: {
          api_key: 'magicApiKey',
          blockchain: 'ethereum mainnet',
          chainId: '1',
          env: 'test-testnet',
          eventOrigin: '',
          json_rpc_method: 'magic_auth_login_with_oidc',
          rpcUrl: 'mainnet',
          sdk: 'SdkMissing',
          source: 'mandrake-magic',
          uid: 'authUserId',
          walletType: 'ETH',
        },
        result: 'successDidToken',
      });
    });
  });
});
