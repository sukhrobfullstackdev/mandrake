import WalletTokenSelectionPage from '@app/send/rpc/wallet/magic_wallet/token_selection/page';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
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

jest.mock('@hooks/common/token', () => ({
  useNativeTokenPrice: jest.fn(() => ({
    tokenPriceData: { toCurrencyAmountDisplay: '1000' },
    tokenPriceDataError: null,
    isTokenPriceFetched: true,
  })),
  useTokenPrice: jest.fn(() => ({
    tokenPriceData: { toCurrencyAmountDisplay: '1000' },
    tokenPriceDataError: null,
    isTokenPriceFetched: true,
  })),
  useErc20Balances: jest.fn(() => ({
    tokenBalances: {
      tokens: [
        {
          balance: '2.0',
          decimals: 18,
          contractAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
          logo: undefined,
          name: 'Wrapped Ether',
          rawBalance: '2',
          symbol: 'WETH',
        },
        {
          balance: '0.0',
          decimals: 18,
          contractAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
          logo: undefined,
          name: 'Wrapped Matic',
          rawBalance: '0',
          symbol: 'WMATIC',
        },
      ],
    },
    isTokenBalancesFetched: true,
  })),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletTokenSelectionPage />
    </QueryClientProvider>,
  );
}

describe('Wallet token selection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a network name', () => {
    setup();
    const content = screen.getByText('Sepolia Testnet');
    expect(content).toBeInTheDocument();
  });

  it('navigates to wallet home when back button is clicked', () => {
    setup();
    const backButton = screen.getAllByRole('button')[0];
    act(() => backButton.click());
    waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/home'));
  });
});
