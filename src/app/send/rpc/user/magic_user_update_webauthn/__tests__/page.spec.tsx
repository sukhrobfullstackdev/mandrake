import Page from '@app/send/rpc/user/magic_user_update_webauthn/page';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({
    isError: false,
    isComplete: true,
  })),
}));

jest.mock('@hooks/data/embedded/webauthn', () => ({
  useUpdateWebauthnQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockResolvedValue(true),
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response');

describe('magic_user_update_webauthn page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_user_update_webauthn',
      id: 'my_id',
      params: [{ webAuthnCredentialsId: 'webAuthnCredentialsId', nickname: 'nickname' }],
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
    jest.clearAllMocks();
  });

  it('resolveJsonRpcResponse should resolve with the expected response', async () => {
    useStore.setState({
      authUserId: 'authUserId',
      magicApiKey: 'magicApiKey',
    });
    await act(async () => {
      await executeRequest(); // execute
    });
    await waitFor(() => {
      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: {
          id: 'my_id',
          jsonrpc: '2.0',
          method: 'magic_user_update_webauthn',
          params: [{ webAuthnCredentialsId: 'webAuthnCredentialsId', nickname: 'nickname' }],
        },
        sdkMetadata: {},
        analyticsProperties: {
          api_key: 'magicApiKey',
          blockchain: 'ethereum mainnet',
          chainId: '1',
          env: 'test-testnet',
          eventOrigin: '',
          json_rpc_method: 'magic_user_update_webauthn',
          rpcUrl: 'mainnet',
          sdk: 'SdkMissing',
          source: 'mandrake-magic',
          uid: 'authUserId',
          walletType: 'ETH',
        },
        result: true,
      });
    });
  });
});
