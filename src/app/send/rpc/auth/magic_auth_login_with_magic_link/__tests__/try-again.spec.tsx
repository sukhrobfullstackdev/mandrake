import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import LoginWithEmailLinkTryAgain from '@app/send/rpc/auth/magic_auth_login_with_magic_link/try_again/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/email-link', () => ({
  useCountdownTimer: jest.fn().mockImplementation(() => ({ isRunning: false, secondsLeft: 0 })),
}));

const setup = () => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginWithEmailLinkTryAgain />
    </QueryClientProvider>,
  );
};

describe('Login With Email Link Try again Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /try_again route when email throttled', () => {
    setup();
    const linkExpired = screen.getByText('Try again later');
    expect(linkExpired).toBeInTheDocument();
  });
});
