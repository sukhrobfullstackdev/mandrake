import EnableMfaInitialPrompt from '@app/send/rpc/auth/magic_auth_enable_mfa_flow/initial_prompt/page';
import { useStartTemporaryOtpEnrollMutation } from '@hooks/data/embedded/mfa';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockOAuthResultParams } from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

jest.mock('@hooks/data/embedded/mfa', () => ({
  useStartTemporaryOtpEnrollMutation: jest.fn(),
}));

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue(mockOAuthResultParams),
  })),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_enable_mfa_flow/initial_prompt'),
}));

function setup() {
  (useStartTemporaryOtpEnrollMutation as jest.Mock).mockReturnValue({
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
      <EnableMfaInitialPrompt />
    </QueryClientProvider>,
  );
}

describe('MfaInitialPrompt', () => {
  beforeEach(setup);
  test('calls router.replace when next is clicked', () => {
    // Click the Next button

    act(() => screen.getByText('Next').click());

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
