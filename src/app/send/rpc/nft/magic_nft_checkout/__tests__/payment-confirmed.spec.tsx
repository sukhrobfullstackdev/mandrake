import { PaymentConfirmed } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-confirmed/payment-confirmed';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue(
    new URLSearchParams({
      hash: '0x1234567890',
    }),
  ),
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
    },
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentConfirmed />
    </QueryClientProvider>,
  );
};

describe('PaymentConfirmed component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render PaymentConfirmed correctly', () => {
    setup();

    expect(screen.getByText('Payment confirmed')).toBeInTheDocument();
  });
});
