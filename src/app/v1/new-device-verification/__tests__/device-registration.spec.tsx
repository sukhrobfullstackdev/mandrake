import { DeviceRegistration } from '@app/v1/new-device-verification/device-registration';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@lib/device-verification/marshalParams', () => ({
  marshallDeviceVerificationQueryParams: jest.fn().mockReturnValue({
    deviceProfileId: '12345',
    deviceToken: '12345',
    expiryTimestamp: 12345,
    metadata: {
      browser: 'browser',
      os: 'os',
      deviceIp: 'deviceIp',
    },
  }),
}));
jest.mock('@hooks/data/embedded/device-verification', () => ({
  useDeviceApproveQuery: jest.fn().mockReturnValue({ mutate: jest.fn() }),
  useDeviceCheckQuery: jest.fn().mockReturnValue({ mutate: jest.fn() }),
}));
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => '/v1'),
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);
  const setVerificationStatus = jest.fn();
  return render(
    <QueryClientProvider client={queryClient}>
      <DeviceRegistration setVerificationStatus={setVerificationStatus} />
    </QueryClientProvider>,
  );
};

describe('Device Registration', () => {
  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Device Registration Page', () => {
    expect(screen.getByText('New Device IP Address')).toBeInTheDocument();
  });
});
