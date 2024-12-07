import { render, screen } from '@testing-library/react';

import { StoreState, useStore } from '@hooks/store';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginWithEmailOtpVerifyOtpCode from '../verify_otp_code/page';

const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => '/send/rpc/auth/magic_auth_login_with_email_otp/verify_otp_code',
}));

const mockEmail = 'test@email.com';
const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = (state: Partial<StoreState>) => {
  useStore.setState(state);
  const queryClient = new QueryClient(TEST_CONFIG);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginWithEmailOtpVerifyOtpCode />
    </QueryClientProvider>,
  );
};

describe('Login With Email OTP Verify OTP Code Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display the email address', async () => {
    await setup(mockState);

    expect(screen.getByText(mockEmail)).toBeInTheDocument();
  });
});
