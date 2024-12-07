import DisableMfaRecoveryCode from '@app/send/rpc/auth/magic_auth_disable_mfa_flow/enter_recovery_code/page';
import { useDisableTemporaryOtpRecoveryCodeMutation } from '@hooks/data/embedded/mfa';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_disable_mfa_flow/enter_recovery_code'),
}));

jest.mock('@hooks/data/embedded/mfa', () => ({
  useDisableTemporaryOtpRecoveryCodeMutation: jest.fn(),
}));

function setup() {
  (useDisableTemporaryOtpRecoveryCodeMutation as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  });

  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: 'my_id',
    params: [{ email: 'test@mgail.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <DisableMfaRecoveryCode />
    </QueryClientProvider>,
  );
}

describe('DisableMfaRecoveryCode', () => {
  beforeEach(setup);
  it('renders a text input', () => {
    for (let i = 1; i <= 6; i++) {
      const inputElement = screen.getByPlaceholderText(`8-character code`);
      expect(inputElement).toBeInTheDocument();
    }
  });

  test('calls router.replace when next is clicked', () => {
    // Click the Next button
    const button = screen.getByText('I lost my recovery code');
    act(() => button.click());

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
