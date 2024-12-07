import Page from '@app/send/rpc/user/magic_user_get_webauthn_credentials/page';
import { LoginMethodType } from '@custom-types/api-response';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

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

jest.mock('@hooks/data/embedded/user', () => ({
  useUserInfoQuery: jest.fn(() => ({
    data: {
      login: {
        type: LoginMethodType.WebAuthn,
        webauthn: {
          devicesInfo: [{ id: 'id', nickname: '', transport: 'hybrid', userAgent: 'Firefox' }],
          username: 'mock_username',
        },
      },
    },
    error: null,
  })),
  userQueryKeys: {
    info: jest.fn(() => {
      return 'info';
    }),
  },
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response');

describe('magic_auth_register_webauthn_device page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_register_webauthn_device',
      id: 'my_id',
      params: [],
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
    await waitFor(async () => {
      await executeRequest(); // execute

      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: {
          id: 'my_id',
          jsonrpc: '2.0',
          method: 'magic_auth_register_webauthn_device',
          params: [],
        },
        sdkMetadata: {},
        analyticsProperties: {
          api_key: 'magicApiKey',
          blockchain: 'ethereum mainnet',
          chainId: '1',
          env: 'test-testnet',
          eventOrigin: '',
          json_rpc_method: 'magic_auth_register_webauthn_device',
          rpcUrl: 'mainnet',
          sdk: 'SdkMissing',
          source: 'mandrake-magic',
          uid: 'authUserId',
          walletType: 'ETH',
        },
        result: {
          devicesInfo: [{ id: 'id', nickname: '', transport: 'hybrid', userAgent: 'Firefox', user_agent: 'Firefox' }],
          username: 'mock_username',
        },
      });
    });
  });
});
