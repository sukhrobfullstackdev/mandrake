import ConfirmAction from '@app/confirm-action/page';
import { useNewTabContext } from '@components/new-tab/new-tab-context';
import { useAppName, useAssetUri } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { ConfirmActionType } from '@hooks/data/embedded/confirm-action';
import { ConfirmActionService } from '@lib/services/confirm-action';
import { getDecodedTctPayload, isTctTokenInvalidOrExpired } from '@lib/utils/tct';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

// Mock the required modules and hooks
jest.mock('@hooks/common/client-config');
jest.mock('@lib/utils/tct.ts');
jest.mock('@lib/services/confirm-action');
jest.mock('@components/new-tab/new-tab-context');
jest.mock('@hooks/common/send-router');

const mockAppName = 'Test App';
const mockAssetUri = 'https://mock-asset.uri';
const mockDecodedTctPayload = { api_key: 'test-api-key', confirmation_id: '12345' };
const mockPayloadData = {
  action: ConfirmActionType.SignMessage,
  payload: 'food is yummy',
};
const mockContext = { isThemeLoaded: true };

beforeEach(() => {
  (useAppName as jest.Mock).mockReturnValue(mockAppName);
  (useAssetUri as jest.Mock).mockReturnValue(mockAssetUri);
  (getDecodedTctPayload as jest.Mock).mockReturnValue(mockDecodedTctPayload);
  (isTctTokenInvalidOrExpired as jest.Mock).mockResolvedValue(false);
  (ConfirmActionService.getConfirmPayload as jest.Mock).mockResolvedValue(mockPayloadData);
  (ConfirmActionService.completeConfirm as jest.Mock).mockReturnValue({ success: true });
  (useNewTabContext as jest.Mock).mockReturnValue(mockContext);
  (useSendRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  });

  // Mock the URLSearchParams
  const mockUrlParams = new URLSearchParams();
  mockUrlParams.append('tct', 'test-api-key');
  Object.defineProperty(window, 'location', {
    value: {
      search: mockUrlParams.toString(),
    },
    writable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

function renderComponent() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <ConfirmAction />
    </QueryClientProvider>,
  );
}

describe('ConfirmAction Component', () => {
  it('handles expired request', async () => {
    (isTctTokenInvalidOrExpired as jest.Mock).mockResolvedValue(true);

    await act(async () => {
      await renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText(/You ran out of time to confirm the signature/i)).toBeInTheDocument();
    });
  });

  it('renders action details', async () => {
    await act(async () => {
      await renderComponent();
    });

    await waitFor(() => {
      const elements = screen.getAllByText(/Confirm/i);
      expect(elements).toHaveLength(2);
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });
  });
});
