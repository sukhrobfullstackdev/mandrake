import ShowSendTokensUI from '@components/show-ui/show-send-tokens-ui';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockUseUserMetadata = jest.fn();
const mockReplace = jest.fn();

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
    replace: mockReplace,
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
      ],
    },
    isTokenBalancesFetched: true,
  })),
}));

const params = `transactionType=erc20-transfer
    &symbol=WETH
    &decimals=18
    &contractAddress=0xfff9976782d46cc05630d1f6ebab18b2324d6b14
    &balanceInWei=2
    &logo=`;

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <ShowSendTokensUI />
    </QueryClientProvider>,
  );
}

describe('Show send tokens UI', () => {
  beforeEach(() => {
    act(() => {
      setup();
    });
    jest.clearAllMocks();
  });

  it('renders button token list items', () => {
    expect(screen.getByRole('button', { name: /Ethereum/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Wrapped Ether/i })).toBeInTheDocument();
  });

  it('native token items navigate to compose transaction without query params', async () => {
    const button = screen.getByRole('button', { name: /Ethereum/i });
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/compose_transaction');
    });
  });

  it('erc20 token items navigate to compose transaction with query params', async () => {
    const button = screen.getByRole('button', { name: /Wrapped Ether/i });
    act(() => button.click());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/send/rpc/wallet/magic_wallet/compose_transaction?${params}`);
    });
  });
});
