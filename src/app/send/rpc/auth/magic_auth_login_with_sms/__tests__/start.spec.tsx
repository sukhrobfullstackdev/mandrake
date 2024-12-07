import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import Start from '../start/page';

import { GOOGLE_RECAPTCHA_KEY } from '@constants/env';
import { useLoginWithSmsStartMutation } from '@hooks/data/embedded/sms';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import Script from 'next/script';

const mockedMutate = jest.fn();

jest.mock('@hooks/data/embedded/sms', () => ({
  useLoginWithSmsStartMutation: jest.fn().mockImplementation(() => ({
    mutate: mockedMutate,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_login_with_sms/start'),
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
    method: 'magic_auth_login_with_sms',
    id: '1',
    params: [{ phoneNumber: '+1234567890' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <Script
        id="recaptcha-script"
        src={`https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_KEY}`}
      ></Script>
      <Start />
    </QueryClientProvider>,
  );
};

describe('Login With Sms Start Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /start route when session hydration fails', async () => {
    await setup(mockState);
    const grecaptcha = window.grecaptcha;

    (useLoginWithSmsStartMutation as jest.Mock).mockImplementation(() => ({
      mutate: mockedMutate,
      isError: false,
      isPending: false,
      error: null,
      reset: jest.fn(),
      onSuccess: jest.fn().mockResolvedValue({ data: { login_flow_context: '12345' } }),
      isSuccess: true,
    }));

    expect(grecaptcha.ready).toHaveBeenCalled();
    expect(grecaptcha.execute).toHaveBeenCalled();
    expect(document.querySelector('script')).toHaveAttribute(
      'src',
      `https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_KEY}`,
    );

    expect(mockedMutate).toHaveBeenCalledWith(
      {
        jwt: 'jwt',
        googleReCaptchaToken: 'asdf',
        phoneNumber: '+1234567890',
        requestOriginMessage:
          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      expect.anything(),
    );
  });
});
