import AdditionalTokenItem from '@components/show-ui/additional-token-item';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/common/token', () => ({
  useTokenPrice: jest.fn(() => ({
    tokenPriceData: { toCurrencyAmountDisplay: '1000' },
    tokenPriceDataError: null,
    isTokenPriceFetched: true,
  })),
}));

const token = {
  balance: '1.0',
  decimals: 18,
  contractAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  logo: undefined,
  name: 'Wrapped Ether',
  rawBalance: '1',
  symbol: 'WETH',
};

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AdditionalTokenItem token={token} />
    </QueryClientProvider>,
  );
}

describe('Token list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows additional token items', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText('Wrapped Ether')).toBeInTheDocument();
      expect(screen.getByText('1 WETH')).toBeInTheDocument();
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    });
  });
});
