import TokenList from '@components/show-ui/token-list';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockUseUserMetadata = jest.fn();

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: () => mockUseUserMetadata(),
}));

mockUseUserMetadata.mockImplementation(() => ({
  userMetadata: {
    publicAddress: '0xAC209574729dDc856001E57c3B1Fb96ef64A782C',
  },
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn(() => ({
    chainInfo: {
      currency: 'ETH',
      name: 'Ethereum',
    },
  })),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: jest.fn(),
  })),
}));

jest.mock('@hooks/common/ethereum-proxy', () => ({
  useEthereumProxy: jest.fn().mockReturnValue({
    getBalance: jest.fn().mockResolvedValue('0xde0b6b3a7640000'),
  }),
}));

const mockGetETHNetworkUrl = jest.fn(() => 'custom-node-url');

jest.mock('@hooks/common/ethereum-proxy', () => ({
  useEthereumProxy: jest.fn(() => ({
    getChainId: () => Promise.resolve(1),
    getETHNetworkUrl: mockGetETHNetworkUrl,
  })),
}));

jest.mock('@hooks/common/show-ui', () => ({
  useBalanceInUsd: jest.fn(() => '$1,000.00'),
  useNativeTokenBalance: jest.fn(() => '1.0'),
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
      <TokenList />
    </QueryClientProvider>,
  );
}

describe('Token list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the native token balance in USD', async () => {
    await act(() => {
      setup();
    });

    await waitFor(() => {
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    });
  });

  it('shows additional token items when they have a balance', async () => {
    await act(() => {
      setup();
    });

    await waitFor(() => {
      expect(screen.getByText('Wrapped Ether')).toBeInTheDocument();
      expect(screen.getByText('2 WETH')).toBeInTheDocument();
      expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    });
  });

  it('hides additional token items when they have no balance', async () => {
    await act(() => {
      setup();
    });

    await waitFor(() => {
      expect(screen.queryByText('Wrapped Matic')).not.toBeInTheDocument();
      expect(screen.queryByText('0 WMATIC')).not.toBeInTheDocument();
      expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
    });
  });
});
