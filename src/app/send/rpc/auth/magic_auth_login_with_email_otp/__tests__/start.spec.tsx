import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import Start from '../start/page';

import { useSendEmailOtpStartQuery } from '@hooks/data/embedded/email-otp';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

const mockedMutate = jest.fn();

jest.mock('@hooks/data/embedded/email-otp', () => ({
  useSendEmailOtpStartQuery: jest.fn().mockImplementation(() => ({
    mutateAsync: mockedMutate,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => '/send/rpc/auth/magic_auth_login_with_email_otp/start',
}));

const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = (state: Partial<StoreState>) => {
  useStore.setState(state);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <Start />
    </QueryClientProvider>,
  );
};

describe('Login With Email OTP Start Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /start route when session hydration fails', async () => {
    await setup(mockState);

    (useSendEmailOtpStartQuery as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockedMutate,
      isError: false,
      isPending: false,
      error: null,
      reset: jest.fn(),
      onSuccess: jest.fn().mockResolvedValue({ data: { login_flow_context: '12345' } }),
      isSuccess: true,
    }));
    expect(mockedMutate).toHaveBeenCalledWith({
      jwt: 'jwt',
      email: 'test@email.com',
      overrides: undefined,
      requestOriginMessage:
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
  });
});
