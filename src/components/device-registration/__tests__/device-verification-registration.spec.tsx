import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DeviceVerificationRegistration from '../device-verification-registration';
import { JsonRpcRequestPayload, MagicPayloadMethod } from '@magic-sdk/types';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';

const mockReplace = jest.fn();
const rejectActiveRpcRequestMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => '/v1'),
  }),
  usePathname: jest.fn(() => '/send/rpc/magic_auth_login_with_email_otp/device_verification'),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
  useRejectActiveRpcRequest: jest.fn(() => rejectActiveRpcRequestMock),
}));

jest.mock('@hooks/common/device-verification', () => ({
  useDeviceVerificationPoller: jest.fn(() => ({
    isDeviceVerified: false,
    isDeviceLinkExpired: false,
  })),
}));

jest.mock('@hooks/common/email-from-payload-or-search-params', () => ({
  useEmailFromPayloadOrSearchParams: jest.fn(() => 'test@example.com'),
}));

const setup = (activePayload: JsonRpcRequestPayload) => {
  AtomicRpcPayloadService.setActiveRpcPayload(activePayload);
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <DeviceVerificationRegistration />
    </QueryClientProvider>,
  );
};

describe('DeviceVerificationRegistration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login on cancel for login method', async () => {
    setup({
      id: 'my_id',
      jsonrpc: '2.0',
      method: MagicPayloadMethod.Login,
      params: [],
    });
    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/send/rpc/wallet/${MagicPayloadMethod.Login}`);
    });
  });

  it('redirects to login on cancel for login method', async () => {
    setup({
      id: 'my_id',
      jsonrpc: '2.0',
      method: MagicPayloadMethod.LoginWithEmailOTP,
      params: [],
    });

    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() => {
      expect(rejectActiveRpcRequestMock).toHaveBeenCalledWith(
        RpcErrorCode.UserRequestEditEmail,
        RpcErrorMessage.UserRequestEditEmail,
      );
    });
  });

  it('displays formatted phone number when available', () => {
    setup({
      id: 'my_id',
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_sms',
      params: [{ phoneNumber: '+1234567890' }],
    });
    expect(screen.getByText('+1 234567890')).toBeInTheDocument();
  });

  it('displays email when phone number is not available', () => {
    setup({
      id: 'my_id',
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_email_otp',
      params: [{ email: 'test@example.com' }],
    });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
