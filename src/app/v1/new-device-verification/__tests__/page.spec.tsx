import Page from '@app/v1/new-device-verification/page';
import { useNewTabContext } from '@components/new-tab/new-tab-context';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => '/v1'),
  }),
}));

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createLocalJWKSet: jest.fn().mockReturnValue(true),
}));

jest.mock('@lib/device-verification/ua-sig', () => ({
  verifyUASig: jest.fn(),
}));
jest.mock('@app/v1/new-device-verification/device-approved', () => ({
  DeviceApproved: () => <div>Device Approved</div>,
}));
jest.mock('@app/v1/new-device-verification/device-link-expired', () => ({
  DeviceLinkExpired: () => <div>Device Link Expired</div>,
}));
jest.mock('@app/v1/new-device-verification/device-registration', () => ({
  DeviceRegistration: () => <div>Device Registration</div>,
}));
jest.mock('@app/v1/new-device-verification/device-rejected', () => ({
  DeviceRejected: () => <div>Device Rejected</div>,
}));

jest.mock('@hooks/data/embedded/device-verification', () => ({
  useDeviceApproveQuery: jest.fn().mockReturnValue({ mutate: jest.fn() }),
}));
jest.mock('@utils/base64', () => ({
  parseJWT: jest.fn().mockReturnValue({
    payload: {
      exp: Date.now() + 1000,
      metadata: {},
      style: {},
      sub: '12345',
    },
  }),
}));

jest.mock('@hooks/data/embedded/magic-client', () => ({
  useClientConfigQuery: jest.fn().mockReturnValue({ clientTheme: { appName: 'Your App' } }),
}));

jest.mock('@components/new-tab/new-tab-context', () => ({
  useNewTabContext: jest.fn(),
}));

interface SetupParams {
  storeState?: Partial<StoreState>;
  oauthParams?: any;
}

const setup = ({ storeState }: SetupParams = {}) => {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: 'my_id',
    params: [{ email: 'goat@magic.link' }],
  });
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
    ...storeState,
  });

  return render(<Page />);
};

describe('Verify Device', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset cache
    (useNewTabContext as jest.Mock).mockReturnValue({
      isThemeLoaded: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Loading Spinner', () => {
    setup();
    waitFor(() => {
      expect(screen.getByText('Verifying your device')).toBeInTheDocument();
    });
  });
});
