import PayPalPendingAndCompleted from '@components/show-ui/fiat-on-ramps/paypal/pending-and-completed';
import { PaypalOrderStatus } from '@custom-types/onramp';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup(step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PayPalPendingAndCompleted step={step} />
    </QueryClientProvider>,
  );
}

describe('PayPalPendingAndCompleted', () => {
  it('navigates to onramp page when Back button is clicked', async () => {
    setup(PaypalOrderStatus.COMPLETED);
    const backButton = screen.getAllByRole('button')[0];
    act(() => backButton.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_show_fiat_onramp/');
    });
  });

  it('navigates to onramp page when Done button is clicked', async () => {
    setup(PaypalOrderStatus.COMPLETED);
    const doneButton = screen.getByRole('button', { name: /Done/i });
    act(() => doneButton.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_show_fiat_onramp/');
    });
  });
});
