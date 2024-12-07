import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useConfirmAction } from '@hooks/common/confirm-action';
import {
  ConfirmActionType,
  useBeginConfirmActionQuery,
  useConfirmActionStatusPollerQuery,
} from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { useIsMobileSDK, useIsRnOrIosSDK } from '@lib/utils/platform';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@hooks/data/embedded/confirm-action');
jest.mock('@hooks/store');
jest.mock('@hooks/common/client-config');
jest.mock('@lib/utils/platform');
jest.mock('@hooks/common/json-rpc-request');

const mockUseBeginConfirmActionQuery = useBeginConfirmActionQuery as jest.Mock;
const mockUseClientConfigFeatureFlags = useClientConfigFeatureFlags as jest.Mock;
const mockUseStore = useStore as unknown as jest.Mock;
const mockUseIsMobileSDK = useIsMobileSDK as jest.Mock;
const mockUseIsRnOrIosSDK = useIsRnOrIosSDK as jest.Mock;

const mockUseConfirmActionStatusPollerQuery = useConfirmActionStatusPollerQuery as jest.Mock;

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('useConfirmAction', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue({ authUserId: 'test-user', decodedQueryParams: { apiKey: 'test-api-key' } });
    mockUseConfirmActionStatusPollerQuery.mockReturnValue({ data: null });
    mockUseBeginConfirmActionQuery.mockReturnValue({
      mutateAsync: jest.fn(() => Promise.resolve({ confirmationId: '123' })),
    });
    mockUseClientConfigFeatureFlags.mockReturnValue({ isTransactionConfirmationEnabled: true });
    mockUseIsMobileSDK.mockReturnValue(false);
    mockUseIsRnOrIosSDK.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should initialize with default states', () => {
    const { result } = renderHook(() => useConfirmAction());

    expect(result.current.isActionConfirmed).toBe(false);
    expect(result.current.isActionConfirmationExpired).toBe(false);
  });

  it('should set confirmUrl and open confirm window on doConfirmActionIfRequired', async () => {
    const mockWindowOpen = jest.fn();
    (window as any).open = mockWindowOpen;

    const { result } = renderHook(() => useConfirmAction());

    await act(async () => {
      await result.current.doConfirmActionIfRequired({
        action: ConfirmActionType.SignMessage,
        payload: { message: 'payload' },
      });
    });

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });

  it('should not open confirm window if feature is disabled', async () => {
    mockUseClientConfigFeatureFlags.mockReturnValueOnce({ isTransactionConfirmationEnabled: false });
    const mockWindowOpen = jest.fn();
    (window as any).open = mockWindowOpen;

    const { result } = renderHook(() => useConfirmAction());

    await act(async () => {
      await result.current.doConfirmActionIfRequired({
        action: ConfirmActionType.SignMessage,
        payload: { message: 'payload' },
      });
    });

    await waitFor(() => {
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });
});
