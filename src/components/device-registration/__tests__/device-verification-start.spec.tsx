import { useDeviceVerificationPoller } from '@hooks/common/device-verification';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import DeviceVerificationStart from '../device-verification-start';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => '/v1'),
  }),
  usePathname: jest.fn(() => '/send/rpc/magic_auth_login_with_email_otp/device_verification'),
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response', () => ({
  resolveJsonRpcResponse: jest.fn(),
}));

jest.mock('@hooks/common/device-verification', () => ({
  useDeviceVerificationPoller: jest.fn(() => ({
    isDeviceVerified: false,
    isDeviceLinkExpired: false,
  })),
}));

interface SetupParams {
  storeState?: Partial<StoreState>;
  oauthParams?: any;
  activePayload?: any;
}

const setup = ({ storeState, activePayload }: SetupParams = {}) => {
  AtomicRpcPayloadService.setActiveRpcPayload(activePayload);
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
    ...storeState,
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <DeviceVerificationStart />
    </QueryClientProvider>,
  );
};

describe('DeviceVerificationStart', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders and calls Poller', () => {
    setup({
      activePayload: {
        jsonrpc: '2.0',
        method: 'magic_auth_login_with_email_otp',
        id: 'my_id',
        params: [{ email: 'goat@magic.link' }],
      },
    });
    expect(useDeviceVerificationPoller).toHaveBeenCalledWith({
      verifyLink: '',
      enabled: false,
    });
    expect(screen.getByText('goat@magic.link')).toBeInTheDocument();
  });

  it('renders and calls Poller', () => {
    setup({
      activePayload: {
        jsonrpc: '2.0',
        method: 'magic_auth_login_with_sms',
        id: '1',
        params: [{ phoneNumber: '+17348342901' }],
      },
    });
    expect(useDeviceVerificationPoller).toHaveBeenCalledWith({
      verifyLink: '',
      enabled: false,
    });
    expect(screen.getByText('+1 734 834 2901')).toBeInTheDocument();
  });
});
