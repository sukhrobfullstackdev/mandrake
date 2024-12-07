import EnforceMfaRecoveryCode from '@components/mfa/enforce-mfa-recovery-code';
import { MagicApiErrorCode } from '@constants/error';
import { useVerifyTemporaryOtpRecoveryCodeMutation } from '@hooks/data/embedded/mfa';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa'),
}));

jest.mock('@hooks/data/embedded/mfa', () => ({
  useVerifyTemporaryOtpRecoveryCodeMutation: jest.fn().mockReturnValue(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

function setup() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: 'my_id',
    params: [{ email: 'test@mgail.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <EnforceMfaRecoveryCode onSuccess={jest.fn} onPressLostRecoveryCode={mockReplace} onPressBack={mockReplace} />
    </QueryClientProvider>,
  );
}

describe('EnforceMfaRecoveryCode', () => {
  beforeEach(setup);
  it('renders a text input', () => {
    for (let i = 1; i <= 6; i++) {
      const inputElement = screen.getByPlaceholderText('8-character code');
      expect(inputElement).toBeInTheDocument();
    }
  });
});

it('should display an error message when invalid recovery code is entered', () => {
  (useVerifyTemporaryOtpRecoveryCodeMutation as jest.Mock).mockReturnValue({
    error: new ApiResponseError({
      error_code: MagicApiErrorCode.INCORRECT_TWO_FA_CODE,
      data: {
        message: '',
      },
      message: '',
      status: 'failed',
      headers: { test: 'test' },
    }),
    isPending: false,
    isSuccess: false,
  });
  setup();
  const errorMessage = screen.getByText('Invalid code, please try again.');
  expect(errorMessage).toBeInTheDocument();
});

it('calls onPressLostRecoveryCode when "I lost my recovery code" button is clicked', () => {
  setup();
  const lostCodeButton = screen.getByText('I lost my recovery code');
  fireEvent.click(lostCodeButton);
  expect(mockReplace).toHaveBeenCalled();
});
