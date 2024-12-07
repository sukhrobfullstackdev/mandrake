import { NftCheckoutHeader } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-header';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const setStatus = jest.fn();
const closeNftCheckout = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: jest.fn(),
  })),
}));

jest.mock('@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context', () => ({
  useNftCheckoutContext: () => ({
    setStatus,
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
}));

jest.mock('@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout', () => ({
  useCloseNftCheckout: jest.fn().mockReturnValue({
    closeNftCheckout: () => closeNftCheckout(),
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <NftCheckoutHeader />
    </QueryClientProvider>,
  );
};

describe('NftCheckoutheader component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render header correctly', () => {
    setup();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });
});
