import Page from '@app/send/rpc/auth/magic_auth_webauthn_registration_start/page';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

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
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_webauthn_registration_start'),
}));

jest.mock('@hooks/data/embedded/webauthn', () => ({
  useWebauthnRegistrationStartQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockResolvedValue({
      webauthnUserId: 'someUserId',
      credentialOptions: { challenge: '', user: { id: 'id', name: 'name' } },
    }),
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response');

describe('magic_auth_webauthn_registration_start page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_webauthn_registration_start',
      id: 'my_id',
      params: [{ username: 'username' }],
    });

    const queryClient = new QueryClient(TEST_CONFIG);

    useStore.setState({
      authUserId: 'authUserId',
      magicApiKey: 'magicApiKey',
    });

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

  it('resolveJsonRpcResponse called with the expected output', async () => {
    await executeRequest(); // execute
    await waitFor(() => {
      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: {
          id: 'my_id',
          jsonrpc: '2.0',
          method: 'magic_auth_webauthn_registration_start',
          params: [{ username: 'username' }],
        },
        sdkMetadata: {},
        analyticsProperties: {
          api_key: 'magicApiKey',
          blockchain: 'ethereum mainnet',
          chainId: '1',
          env: 'test-testnet',
          eventOrigin: '',
          json_rpc_method: 'magic_auth_webauthn_registration_start',
          rpcUrl: 'mainnet',
          sdk: 'SdkMissing',
          source: 'mandrake-magic',
          uid: 'authUserId',
          walletType: 'ETH',
        },
        result: {
          id: 'someUserId',
          credential_options: {
            challenge: new Uint8Array(),
            user: {
              id: new Uint8Array([137]),
              name: 'name',
            },
          },
        },
      });
    });
  });
});
