import UpdateEmailInputAddress from '@app/send/rpc/auth/magic_auth_update_email/input_address/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockReject = jest.fn();

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockReject),
}));
jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn,
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_update_email/input_address'),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <UpdateEmailInputAddress />
    </QueryClientProvider>,
  );
}

describe('UpdateEmailInputAddress', () => {
  beforeEach(() => {
    act(() => {
      setup();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates back to settings on close press', async () => {
    const button = screen.getByText('Cancel');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
    });
  });
});
