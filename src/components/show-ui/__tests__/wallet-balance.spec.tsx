import WalletBalance from '@components/show-ui/wallet-balance';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

const mockUseUserMetadata = jest.fn();

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: () => mockUseUserMetadata(),
}));

jest.mock('@hooks/common/ethereum-proxy', () => ({
  useEthereumProxy: jest.fn().mockReturnValue({
    getBalance: jest.fn().mockResolvedValue('0xde0b6b3a7640000'),
  }),
}));

jest.mock('@hooks/common/token', () => ({
  useNativeTokenPrice: jest.fn(() => ({
    tokenPriceData: { toCurrencyAmountDisplay: '1000' },
    tokenPriceDataError: null,
    isTokenPriceFetched: true,
  })),
}));

mockUseUserMetadata.mockImplementation(() => ({
  userMetadata: {
    publicAddress: '0xAC209574729dDc856001E57c3B1Fb96ef64A782C',
  },
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletBalance />
    </QueryClientProvider>,
  );
}

describe('Wallet balance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a truncated wallet address', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText('0xAC20...782C')).toBeInTheDocument();
    });
  });

  it('shows the wallet balance in USD', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    });
  });
});
