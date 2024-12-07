import PayPalStatusDescription from '@components/show-ui/fiat-on-ramps/paypal/status-description';
import { PaypalOrderStatus } from '@custom-types/onramp';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PayPalStatusDescription step={step} />
    </QueryClientProvider>,
  );
}

describe('PayPal Status Description', () => {
  it('renders the correct text for pending step', () => {
    setup(PaypalOrderStatus.PENDING);
    const content = screen.getByText('It may take a few minutes for your transaction to finish processing.');
    expect(content).toBeInTheDocument();
  });

  it('renders the correct text for completed step', () => {
    setup(PaypalOrderStatus.COMPLETED);
    const content = screen.getByText(
      'It may take a few minutes for this page to update, but your purchase may appear in your wallet sooner.',
    );
    expect(content).toBeInTheDocument();
  });
});
