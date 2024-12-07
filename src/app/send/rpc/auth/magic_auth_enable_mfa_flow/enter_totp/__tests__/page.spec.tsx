import MfaEnterTotp from '@app/send/rpc/auth/magic_auth_enable_mfa_flow/enter_totp/page';
import { useFinishTemporaryOtpEnrollMutation } from '@hooks/data/embedded/mfa';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockOAuthResultParams } from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@hooks/data/embedded/mfa', () => ({
  useFinishTemporaryOtpEnrollMutation: jest.fn(),
}));

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue(mockOAuthResultParams),
  })),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_enable_mfa_flow/enter_totp'),
}));

function setup() {
  (useFinishTemporaryOtpEnrollMutation as jest.Mock).mockReturnValue({
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
      <MfaEnterTotp />
    </QueryClientProvider>,
  );
}

describe('MfaEnterTotp', () => {
  beforeEach(setup);
  it('renders a pin code input', () => {
    for (let i = 1; i <= 6; i++) {
      const inputElement = screen.getByLabelText(`mfa one time password input ${i}`);
      expect(inputElement).toBeInTheDocument();
    }
  });
});
