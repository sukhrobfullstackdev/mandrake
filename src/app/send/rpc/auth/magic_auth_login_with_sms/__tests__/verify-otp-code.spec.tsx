import { render, screen } from '@testing-library/react';

import { StoreState, useStore } from '@hooks/store';

import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginWithSmsVerifyOtpCode from '../verify_otp_code/page';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_login_with_sms/verify_otp_code'),
}));

const mockPhoneNumber = '+1 432 675 0098';
const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = (state: Partial<StoreState>) => {
  useStore.setState(state);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_sms',
    id: '1',
    params: [{ phoneNumber: '+14326750098' }],
  });
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginWithSmsVerifyOtpCode />
    </QueryClientProvider>,
  );
};

describe('Login With SMS Verify OTP Code Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display the phone number', () => {
    setup(mockState);

    expect(screen.getByText(mockPhoneNumber)).toBeInTheDocument();
  });
});
