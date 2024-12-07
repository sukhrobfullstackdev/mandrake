import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { ConfirmActionStatus, useConfirmActionStatusPoller } from '@hooks/common/confirm-action';
import { useConfirmActionStatusPollerQuery } from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@hooks/data/embedded/confirm-action');
jest.mock('@hooks/store');
jest.mock('@hooks/common/client-config');
jest.mock('@lib/utils/platform');

const mockUseStore = useStore as unknown as jest.Mock;

const mockUseConfirmActionStatusPollerQuery = useConfirmActionStatusPollerQuery as jest.Mock;

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockRejectActiveRpcRequest = jest.fn();

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
}));

describe('useConfirmActionStatusPoller', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue({ authUserId: 'test-user' });
    mockUseConfirmActionStatusPollerQuery.mockReturnValue({ data: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return default states initially', () => {
    const { result } = renderHook(() => useConfirmActionStatusPoller({ confirmationId: 'test-id' }));

    expect(result.current.isActionConfirmed).toBe(false);
    expect(result.current.isActionConfirmationExpired).toBe(false);
  });

  it('should set isActionConfirmed to true when status is Approved', async () => {
    mockUseConfirmActionStatusPollerQuery.mockReturnValueOnce({
      data: { status: ConfirmActionStatus.Approved },
    });
    const { result } = renderHook(() => useConfirmActionStatusPoller({ confirmationId: 'test-id' }));
    await waitFor(async () => {
      expect(result.current.isActionConfirmed).toBe(true);
    });
  });

  it('should set isActionConfirmationExpired to true after expiration duration', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useConfirmActionStatusPoller({ confirmationId: 'test-id' }));

    act(() => {
      jest.advanceTimersByTime(77 * 1000); // Advance time to simulate expiration
    });
    // Fast-forward time to simulate the expiration
    await waitFor(async () => {
      expect(result.current.isActionConfirmationExpired).toBe(true);
    });
    jest.useRealTimers();
  });

  it('should call rejectActiveRpcRequest when status is Rejected', async () => {
    mockUseConfirmActionStatusPollerQuery.mockReturnValueOnce({
      data: { status: ConfirmActionStatus.Rejected },
    });

    const { result } = renderHook(() => useConfirmActionStatusPoller({ confirmationId: 'test-id' }));

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InternalError,
        RpcErrorMessage.UserRejectedAction,
      );
    });

    expect(result.current.isActionConfirmed).toBe(false);
  });
});
