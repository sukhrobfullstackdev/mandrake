import { render, renderHook } from '@testing-library/react';

import { StoreState, useStore } from '@hooks/store';

import { LoginProvider, useLoginContext } from '@app/send/login-context';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SmsPageHeader from '../__components__/sms-page-header';

const mockState = {
  activeRpcPayload: {
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_sms',
    id: '1',
    params: [{ phoneNumber: '+14326750098' }],
  },
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const setup = (state: Partial<StoreState>) => {
  useStore.setState(state);
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginProvider>
        <SmsPageHeader />
      </LoginProvider>
    </QueryClientProvider>,
  );
};

describe('SMS Page Header Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('showCloseButton should be false', () => {
    setup(mockState);
    const { result } = renderHook(() => useLoginContext());
    expect(result.current.showCloseButton).toBe(false);
  });
});
