import InputNewPhoneNumber from '@app/send/rpc/user/update_phone_number/input_new_phone_number/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { RecoveryFactorEventEmit } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));
jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
}));
jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUseUserMetadata = jest.fn();

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: () => mockUseUserMetadata(),
}));

mockUseUserMetadata.mockImplementation(() => ({
  userMetadata: {
    recoveryFactors: [],
  },
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ page: 'recovery', showUI: true }],
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <InputNewPhoneNumber />
    </QueryClientProvider>,
  );
}
function setupWhitelabel() {
  const queryClient = new QueryClient(TEST_CONFIG);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ page: 'recovery', showUI: false }],
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <InputNewPhoneNumber />
    </QueryClientProvider>,
  );
}

describe('InputNewPhoneNumber', () => {
  beforeEach(() => {
    jest.spyOn(AtomicRpcPayloadService, 'onEvent').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('closes modal and rejects active rpc request when Close button is clicked', async () => {
    setup();

    const button = screen.getAllByRole('button')[0];
    act(() => button.click());

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserCanceledAction,
        undefined,
        { closedByUser: true },
      );
    });
  });

  it('remove phone number button is visible when recovery number exists', () => {
    mockUseUserMetadata.mockImplementation(() => ({
      userMetadata: {
        recoveryFactors: [{ type: 'phone_number', value: '1234567890' }],
      },
    }));

    setup();

    const removeNumberButton = screen.getByRole('button', { name: /Remove phone number/i });
    expect(removeNumberButton).toBeVisible();
  });

  it('navigates to remove_phone_number when remove number button is clicked', async () => {
    mockUseUserMetadata.mockImplementation(() => ({
      userMetadata: {
        recoveryFactors: [{ type: 'phone_number', value: '1234567890' }],
      },
    }));

    setup();

    const removeNumberButton = screen.getByRole('button', { name: /Remove phone number/i });
    act(() => {
      removeNumberButton.click();
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/update_phone_number/remove_phone_number');
    });
  });

  it('remove phone number button is not visible when recovery number does not exist', () => {
    mockUseUserMetadata.mockImplementation(() => ({
      userMetadata: {
        recoveryFactors: [{ type: 'email', value: 'user@example.com' }],
      },
    }));

    setup();

    const removeNumberButton = screen.queryByRole('button', { name: /Remove phone number/i });
    expect(removeNumberButton).toBeNull();
  });
  it('should not show the overlay when the showUI is false', () => {
    setupWhitelabel();
    mockUseUserMetadata.mockImplementation(() => ({
      userMetadata: {
        recoveryFactors: [{ type: 'email', value: 'user@example.com' }],
      },
    }));
    expect(AtomicRpcPayloadService.onEvent).toHaveBeenCalledWith(
      RecoveryFactorEventEmit.SendNewPhoneNumber,
      expect.any(Function),
    );
  });
});
