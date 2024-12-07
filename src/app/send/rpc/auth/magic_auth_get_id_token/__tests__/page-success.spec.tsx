import Page from '@app/send/rpc/auth/magic_auth_get_id_token/page';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_get_id_token'),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({
    isError: false,
    isComplete: true,
  })),
}));
jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({
    didToken: 'successDidToken',
  })),
}));
jest.mock('@lib/message-channel/resolve-json-rpc-response');

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ areWalletsCreated: false })),
}));

describe('magic_auth_generate_id_token page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_generate_id_token',
      id: 'my_id',
      params: [{ lifespan: 900 }],
    });

    useStore.setState({
      authUserId: 'authUserId',
      magicApiKey: 'magicApiKey',
    });

    const queryClient = new QueryClient(TEST_CONFIG);

    return render(
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>,
    );
  }
  beforeEach(() => {
    jest.mock('@hooks/common/json-rpc-request', () => ({
      useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
      useRejectActiveRpcRequest: jest.fn(() => jest.fn()),
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('hydrate session and use get or create eth wallet should be called', () => {
    executeRequest(); // execute
    expect((useHydrateSession as jest.Mock).mock.calls.length).toBe(2);
    expect((useHydrateOrCreateWallets as jest.Mock).mock.calls.length).toBe(2);
    expect((useCreateDidTokenForUser as jest.Mock).mock.calls.length).toBe(2);
    expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
      payload: {
        id: 'my_id',
        jsonrpc: '2.0',
        method: 'magic_auth_generate_id_token',
        params: [
          {
            lifespan: 900,
          },
        ],
      },
      sdkMetadata: {},
      analyticsProperties: {
        api_key: 'magicApiKey',
        blockchain: 'ethereum mainnet',
        chainId: '1',
        env: 'test-testnet',
        eventOrigin: '',
        json_rpc_method: 'magic_auth_generate_id_token',
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
