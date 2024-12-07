import { PaymentMethods } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/payment-methods';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const setStatus = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/data/embedded/nft', () => ({
  useNftCheckoutPayload: () => ({
    nftCheckoutPayload: {
      contractId: '1e719eaa-990e-41cf-b2e0-a4eb3d5d1312',
      tokenId: '2',
      name: 'TEST NFT CHECKOUT',
      imageUrl: 'https://nft-cdn.alchemy.com/matic-mumbai/5d55353a3f95997ce7b33bc08c6832ed',
      quantity: 1,
    },
  }),
  useNftTokenInfo: () => ({
    data: {
      contractChainId: 137,
      price: 100,
      denomination: 'ETH',
    },
  }),
  useNetworkFee: () => ({
    data: 0.0000000000000001,
  }),
  usePaypalClientToken: () => ({
    data: 'PAYPAL_CLIENT_TOKEN',
  }),
}));

jest.mock('@hooks/data/embedded/block', () => ({
  useBalance: () => ({
    balance: 100n,
  }),
}));

jest.mock('@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-cost-breakdown', () => ({
  useCostBreakdown: () => ({ totalInUsd: '10', total: 100 }),
}));

jest.mock('@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-mint-nft-with-web3modal', () => ({
  useMintNftWithWeb3Modal: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context', () => ({
  useNftCheckoutContext: () => ({
    setStatus,
    setIsPaypalPending: jest.fn(),
  }),
  isPaypalPending: false,
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentMethods />
    </QueryClientProvider>,
  );
};

describe('PaymentMethods component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render PaymentMethods correctly', () => {
    setup();

    expect(screen.getByText('TEST NFT CHECKOUT')).toBeInTheDocument();
  });
});
