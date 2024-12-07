import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useSearchParams } from 'next/navigation';
import ConfirmError from '@app/confirm/error/page';
import { EmailLinkConfirmErrorState } from '@constants/email-link';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: jest.fn().mockImplementation(() => ({
    get: jest.fn(() => 'errorType'),
  })),
}));

const setup = ({ errorType }: { errorType: EmailLinkConfirmErrorState }) => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  (useSearchParams as jest.Mock).mockImplementation(() => ({
    get: jest.fn(() => errorType),
  }));

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfirmError />
    </QueryClientProvider>,
  );
};

describe('Login With Email Link error Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Render Link error page when error type is link broken', () => {
    setup({ errorType: EmailLinkConfirmErrorState.LinkBroken });
    const linkExpired = screen.getByText('Link error');
    expect(linkExpired).toBeInTheDocument();
  });

  it('Render Link error page when error type is link expired ', () => {
    setup({ errorType: EmailLinkConfirmErrorState.AuthExpired });
    const linkExpired = screen.getByText('Link expired');
    expect(linkExpired).toBeInTheDocument();
  });

  it('Render Link error page when error type is link ', () => {
    setup({ errorType: EmailLinkConfirmErrorState.InternalError });
    const linkExpired = screen.getByText('Technical error');
    expect(linkExpired).toBeInTheDocument();
  });

  it('Render Link error page when error type is link ', () => {
    setup({ errorType: EmailLinkConfirmErrorState.RedirectFailed });
    const linkExpired = screen.getByText('Invalid Redirect URL');
    expect(linkExpired).toBeInTheDocument();
  });

  it('Render Link error page when error type security code expired ', () => {
    setup({ errorType: EmailLinkConfirmErrorState.SecurityCodeExpired });
    const linkExpired = screen.getByText('Security code expired');
    expect(linkExpired).toBeInTheDocument();
  });

  it('Render Link error page when error type is ip address mismatch ', () => {
    setup({ errorType: EmailLinkConfirmErrorState.MismatchedIP });
    const linkExpired = screen.getByText('IP address mismatch');
    expect(linkExpired).toBeInTheDocument();
  });
});
