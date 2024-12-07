import RemovePhoneNumber from '@app/send/rpc/user/update_phone_number/remove_phone_number/page';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockResolve = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();
jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: () => mockRejectActiveRpcRequest,
  useResolveActiveRpcRequest: () => mockResolve,
}));
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <RemovePhoneNumber />
    </QueryClientProvider>,
  );
}

describe('RemovePhoneNumber', () => {
  beforeEach(setup);
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to input_new_phone_number when Back button is clicked', async () => {
    const button = screen.getAllByRole('button')[0];
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/update_phone_number/input_new_phone_number');
    });
  });

  it('closes modal and rejects active rpc request when Close button is clicked', async () => {
    setup();

    const closeButton = screen.getAllByRole('button')[1];
    act(() => closeButton.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/magic_auth_settings');
    });
  });

  it('navigates to input_new_phone_number when Cancel button is clicked', async () => {
    const removeNumberButton = screen.getByRole('button', { name: /Cancel/i });
    act(() => removeNumberButton.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/user/update_phone_number/input_new_phone_number');
    });
  });
});
