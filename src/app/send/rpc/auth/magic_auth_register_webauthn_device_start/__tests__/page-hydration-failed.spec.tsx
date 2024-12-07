import Page from '@app/send/rpc/auth/magic_auth_register_webauthn_device_start/page';
import { RpcErrorMessage } from '@constants/json-rpc';
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
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_register_webauthn_device_start'),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({
    isError: true,
    isComplete: true,
  })),
}));

jest.mock('@hooks/data/embedded/webauthn', () => ({
  useWebauthnRegisterDeviceStartQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockResolvedValue({
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

describe('magic_auth_register_webauthn_device_start page', () => {
  function executeRequest() {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_register_webauthn_device_start',
      id: 'my_id',
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

  it('resolveJsonRpcResponse should reject with user denied account access when not logged in', async () => {
    await executeRequest(); // execute
    await waitFor(() => {
      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: {
          id: 'my_id',
          jsonrpc: '2.0',
          method: 'magic_auth_register_webauthn_device_start',
        },
        sdkMetadata: {},
        analyticsProperties: {},
        error: {
          code: -32603,
          data: undefined,
          message: RpcErrorMessage.UserDeniedAccountAccess,
        },
      });
    });
  });
});
