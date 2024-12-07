import { OrderConfirmed } from '@app/send/rpc/nft/magic_nft_checkout/__components__/order-confirmed/order-confirmed';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

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
}));

const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <OrderConfirmed />
    </QueryClientProvider>,
  );
};

describe('OrderConfirmed component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render OrderConfirmed correctly', () => {
    setup();

    expect(screen.getByText('Order confirmed')).toBeInTheDocument();
  });
});
