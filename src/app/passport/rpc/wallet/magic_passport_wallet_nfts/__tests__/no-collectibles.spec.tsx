import NoCollectibles from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/components/no-collectibles';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <NoCollectibles />
    </QueryClientProvider>,
  );
}

describe('Magic Passport No Collectibles View', () => {
  beforeEach(setup);

  it('renders a header', () => {
    const header = screen.getByText('No Collectibles');
    expect(header).toBeInTheDocument();
  });

  it('renders body content', () => {
    const content = screen.getByText('You do not own any digital collectibles');
    expect(content).toBeInTheDocument();
  });
});
