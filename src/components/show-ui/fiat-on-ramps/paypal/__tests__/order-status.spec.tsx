import PayPalOrderStatus from '@components/show-ui/fiat-on-ramps/paypal/order-status';
import { PaypalOrderStatus } from '@custom-types/onramp';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(step: PaypalOrderStatus.PENDING | PaypalOrderStatus.COMPLETED) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PayPalOrderStatus step={step} />
    </QueryClientProvider>,
  );
}

describe('PayPal Order Status', () => {
  it('renders the correct text for pending step', () => {
    setup(PaypalOrderStatus.PENDING);
    const content = screen.getByText('Processing Purchase...');
    expect(content).toBeInTheDocument();
  });

  it('renders the correct text for completed step', () => {
    setup(PaypalOrderStatus.COMPLETED);
    const content = screen.getByText('Purchase Complete!');
    expect(content).toBeInTheDocument();
  });
});
