import MfaEnrollCode from '@app/send/rpc/auth/magic_auth_enable_mfa_flow/enroll_code/page';
import { useStartTemporaryOtpEnrollMutation } from '@hooks/data/embedded/mfa';
import { mockOAuthResultParams } from '@mocks/oauth';
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
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_enable_mfa_flow/enroll_code'),
}));

describe('MfaEnrollCode', () => {
  const queryClient = new QueryClient();
  beforeEach(() => {
    (global.navigator as any).clipboard = {
      writeText: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('copies recovery code to clipboard when copy button is clicked', () => {
    const secret = 'testSecret';
    (useStartTemporaryOtpEnrollMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      data: { secret },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MfaEnrollCode />
      </QueryClientProvider>,
    );

    // Click the copy button
    act(() => screen.getByRole('button', { name: /copy-button/i }).click());

    // Check if the recovery code is copied to the clipboard
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(secret);
  });

  test('calls router.replace when next is clicked', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MfaEnrollCode />
      </QueryClientProvider>,
    );

    // Click the Next button
    act(() => screen.getByText('Next').click());

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
