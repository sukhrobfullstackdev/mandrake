import EnterTotp from '@app/send/rpc/user/update_phone_number/enter_totp/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();
jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
}));
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ page: 'recovery', showUI: true }],
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EnterTotp />
    </QueryClientProvider>,
  );
}

describe('EnterTotp', () => {
  setup();
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('closes modal and rejects active rpc request when Close button is clicked', async () => {
    const button = screen.getByRole('button');
    act(() => button.click());

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserCanceledAction,
        undefined,
        { closedByUser: true },
      );
    });
  });
});
