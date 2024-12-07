import UpdatedEmailEnterTotp from '@app/send/rpc/auth/magic_auth_update_email/updated_email_totp/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockReject = jest.fn();
const mockResolve = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => mockResolve),
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockReject),
}));

jest.mock('@hooks/data/embedded/email-otp', () => ({
  useEmailUpdateChallengeMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockImplementation(() => ({ attempt_id: 'testAttemptId' })),
  })),
  useCreateFactorForNewEmailMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: jest.fn().mockImplementation(() => 'testFactorId'),
  })),
  useVerifyUpdatedEmailMutation: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn,
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_update_email/updated_email_totp'),
}));

function setup(method: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: method,
    id: 'my_id',
    params: [{ email: 'test@mgail.com' }],
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UpdatedEmailEnterTotp />
    </QueryClientProvider>,
  );
}

describe('UpdatedEmailEnterTotp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates back to settings on close press', async () => {
    setup('magic_auth_settings');
    const button = screen.getByRole('button');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_auth_settings');
    });
  });

  it('Closes on close press', async () => {
    setup('magic_user_update_email');
    const button = screen.getByRole('button');
    act(() => button.click());

    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
    });
  });
});
