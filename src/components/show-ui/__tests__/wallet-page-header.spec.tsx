import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn().mockReturnValue({
    chainInfo: {
      networkName: 'Sepolia Testnet',
    },
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletPageHeader />
    </QueryClientProvider>,
  );
}

describe('Wallet Page Header', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a network name', () => {
    setup();
    const content = screen.getByText('Sepolia Testnet');
    expect(content).toBeInTheDocument();
  });
});
