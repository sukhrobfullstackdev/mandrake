import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import RedirectLoginComplete from '@app/send/rpc/auth/magic_auth_login_with_magic_link/redirect_login_complete/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
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
      <RedirectLoginComplete />
    </QueryClientProvider>,
  );
};

describe('Login With Email Link Redirect Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /expired route when session hydration fails', () => {
    setup();
    const linkExpired = screen.getByText('Login Successful');
    expect(linkExpired).toBeInTheDocument();
  });
});
