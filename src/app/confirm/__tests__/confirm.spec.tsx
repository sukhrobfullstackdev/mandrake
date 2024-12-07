import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import LoginWithEmailLinkConfirm from '@app/confirm/page';
import { ak, ct, e, flowContext, locale, nextFactor, location, tlt, uid, redirectUrl } from '@mocks/email-link';
import { EmailLinkConfirmStateContext, useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: jest.fn().mockImplementation(() => ({
    toString: jest.fn(() => ''),
  })),
}));

jest.mock('@app/confirm/email-link-confirm-context', () => ({
  useEmailLinkConfirmContext: jest.fn().mockReturnValue({}),
}));
jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn(),
}));

const setup = ({ state }: { state: Partial<EmailLinkConfirmStateContext> }) => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  (useEmailLinkConfirmContext as jest.Mock).mockReturnValue(state);

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginWithEmailLinkConfirm />
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

  it('render mfa if next factor is present in the query', () => {
    setup({
      state: {
        ct,
        tlt,
        flowContext,
        locale,
        location,
        e,
        ak,
        uid,
        nextFactor,
        isQueryHydrated: true,
      },
    });
    expect(mockPush).toHaveBeenCalledWith('/confirm/enforce_mfa');
  });

  it('render broken link', () => {
    setup({
      state: { isQueryHydrated: true },
    });
    expect(mockPush).toHaveBeenCalledWith('/confirm/error?errorType=link-broken');
  });

  it('render redirect', () => {
    setup({
      state: {
        ct,
        location,
        redirectUrl,
        flowContext,
        isQueryHydrated: true,
      },
    });
    expect(mockPush).toHaveBeenCalledWith('/confirm/redirect');
  });

  it('Not navigate when hydration is not completed', () => {
    setup({
      state: {
        ct,
        location,
        redirectUrl,
        isQueryHydrated: false,
      },
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigate to security otp', () => {
    setup({
      state: {
        ct,
        location,
        flowContext,
        isQueryHydrated: true,
        securityOtpChallenge: 'true',
      },
    });
    expect(mockPush).toHaveBeenCalledWith('/confirm/security_otp_challenge');
  });
});
