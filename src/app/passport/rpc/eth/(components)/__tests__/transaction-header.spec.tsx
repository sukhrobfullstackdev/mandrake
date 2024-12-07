import TransactionHeader from '@app/passport/rpc/eth/(components)/transaction-header';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionHeader />
    </QueryClientProvider>,
  );
}

describe('Transaction header', () => {
  beforeEach(setup);

  it('renders header text', () => {
    const header = screen.getByText('Confirm Transaction');
    expect(header).toBeInTheDocument();
  });

  it('renders a menu', () => {
    const menu = screen.getAllByRole('button')[0];
    expect(menu).toBeInTheDocument();
  });
});
