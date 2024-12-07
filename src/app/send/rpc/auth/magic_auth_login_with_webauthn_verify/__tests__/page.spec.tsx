import Page from '@app/send/rpc/auth/magic_auth_login_with_webauthn_verify/page';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';

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
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_login_with_webauthn_verify'),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({ walletCreationError: '' })),
}));

jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn().mockImplementation(() => ({
    didToken: 'successDidToken',
  })),
}));

jest.mock('@hooks/data/embedded/webauthn', () => ({
  useWebauthnReauthVerifyQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockResolvedValue({
      authUserId: 'someUserId',
      authUserSessionToken: 'ust',
    }),
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response');

describe('magic_auth_login_with_webauthn_verify page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_webauthn_verify',
      id: 'my_id',
      params: [
        {
          username: 'username',
          assertion_response: { attObj: 'attObj', clientData: 'clientData' },
        },
      ],
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('resolveJsonRpcResponse called with the expected output', async () => {
    await act(async () => {
      await executeRequest(); // execute
    });
    await waitFor(() => {
      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: {
          id: 'my_id',
          jsonrpc: '2.0',
          method: 'magic_auth_login_with_webauthn_verify',
          params: [
            {
              username: 'username',
              assertion_response: { attObj: 'attObj', clientData: 'clientData' },
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
          json_rpc_method: 'magic_auth_login_with_webauthn_verify',
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
