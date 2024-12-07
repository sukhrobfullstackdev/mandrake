import WalletHome from '@app/send/rpc/wallet/magic_wallet/home/page';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@constants/alchemy', () => ({
  ALCHEMY_KEYS: {
    'Sepolia Testnet': 'abcdef',
  },
}));

jest.mock('@hooks/data/embedded/alchemy', () => ({
  useNftsForOwner: jest.fn(() => ({
    data: {
      ownedNfts: [],
      pageKey: undefined,
      totalCount: 0,
      validAt: null,
    },
    isPending: false,
    isError: false,
  })),
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn().mockReturnValue({
    chainInfo: {
      networkName: 'Sepolia Testnet',
    },
  }),
}));

jest.mock('@hooks/common/client-config', () => ({
  useClientConfigFeatureFlags: jest.fn(),
}));

jest.mock('@hooks/common/token', () => ({
  useErc20Balances: jest.fn(() => ({
    tokenBalances: {
      tokens: [
        {
          balance: '1.0',
          decimals: 18,
          contractAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
          logo: undefined,
          name: 'Wrapped Ether',
          rawBalance: '1',
          symbol: 'WETH',
        },
      ],
    },
    isTokenBalancesFetched: true,
  })),
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
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletHome />
    </QueryClientProvider>,
  );
}

describe('Wallet home', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a network name', () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({
      isFiatOnrampEnabled: false,
      isSendTransactionUiEnabled: true,
    });
    setup();
    const content = screen.getByText('Sepolia Testnet');
    expect(content).toBeInTheDocument();
  });

  it('renders a buy button when onramp is enabled', () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({
      isFiatOnrampEnabled: true,
      isSendTransactionUiEnabled: true,
    });
    setup();
    const content = screen.getByText('Buy');
    expect(content).toBeInTheDocument();
  });

  it("doesn't render a buy button when onramp is disabled", () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({
      isFiatOnrampEnabled: false,
      isSendTransactionUiEnabled: true,
    });
    setup();
    const content = screen.queryByText('Buy');
    expect(content).not.toBeInTheDocument();
  });

  it('navigates to account info when account button is clicked', () => {
    (useClientConfigFeatureFlags as jest.Mock).mockReturnValue({
      isFiatOnrampEnabled: false,
      isSendTransactionUiEnabled: true,
    });
    setup();
    const accountButton = screen.getAllByRole('button')[0];
    act(() => accountButton.click());
    waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/account_info'));
  });
});
