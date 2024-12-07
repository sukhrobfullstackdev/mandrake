import { ReceiveFunds } from '@app/send/rpc/nft/magic_nft_checkout/__components__/receive-funds/receive-funds';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context', () => ({
  useNftCheckoutContext: () => ({
    setStatus: () => {},
  }),
}));

jest.mock('@hooks/data/embedded/nft', () => ({
  useNftCheckoutPayload: jest.fn().mockReturnValue({
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

jest.mock('@lib/utils/copy', () => ({
  copyToClipboard: jest.fn(),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <ReceiveFunds />
    </QueryClientProvider>,
  );
};

describe('ReceiveFunds component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render ReceiveFunds correctly', () => {
    setup();

    expect(screen.getByText('Copy address')).toBeInTheDocument();
  });
});
