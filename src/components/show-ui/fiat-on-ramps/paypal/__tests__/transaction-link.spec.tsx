import PayPalTransactionLink from '@components/show-ui/fiat-on-ramps/paypal/transaction-link';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup(transactionLink?: string) {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PayPalTransactionLink transactionLink={transactionLink} />
    </QueryClientProvider>,
  );
}

describe('PayPal Transaction Link', () => {
  it('renders a transaction link when one is passed in', () => {
    setup('https://test.com');
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://test.com');
  });

  it('no link renders when no transaction link is passed in', () => {
    setup();
    const link = screen.queryByRole('link');
    expect(link).not.toBeInTheDocument();
  });
});
