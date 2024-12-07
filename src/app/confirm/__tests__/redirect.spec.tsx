import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { EmailLinkConfirmStateContext, useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';
import EmailLinkConfirmRedirect from '@app/confirm/redirect/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ak, ct, e, flowContext, locale, location, nextFactor, tlt, uid } from '@mocks/email-link';

const mockPush = jest.fn();
const mutateRedirectConfirmMock = jest.fn();
const mutateEmailLinkLoginVerifyMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@lib/email-link/decode-jwt', () => ({
  decodeJWT: jest.fn().mockReturnValue({ payload: { temporary_auth_token: '' } }),
}));

jest.mock('@hooks/data/embedded/email-link', () => ({
  useEmailLinkRedirectConfirmQuery: () => ({
    mutate: mutateRedirectConfirmMock,
  }),
  useEmailLinkLoginVerifyQuery: () => ({
    mutate: mutateEmailLinkLoginVerifyMock,
  }),
}));

jest.mock('@app/confirm/email-link-confirm-context', () => ({
  useEmailLinkConfirmContext: jest.fn().mockReturnValue({}),
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
      <EmailLinkConfirmRedirect />
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
    expect(mutateRedirectConfirmMock).toHaveBeenCalledWith(
      { tlt, env: e, loginFlowContext: flowContext },
      { onError: expect.any(Function), onSuccess: expect.any(Function) },
    );
  });
});
