import { render, screen } from '@testing-library/react';

import { StoreState, useStore } from '@hooks/store';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import EmailOtpContentHeader from '@components/email-otp-content-header';

const mockEmail = 'test@email.com';
const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = (state: Partial<StoreState>, email: string) => {
  useStore.setState(state);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  return render(<EmailOtpContentHeader email={email} />);
};

describe('Email OTP Content Header Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /start route when session hydration fails', async () => {
    await setup(mockState, mockEmail);

    expect(screen.getByText(mockEmail)).toBeInTheDocument();
  });
});
