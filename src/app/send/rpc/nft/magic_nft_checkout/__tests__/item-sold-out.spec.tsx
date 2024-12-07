import { ItemSoldOut } from '@app/send/rpc/nft/magic_nft_checkout/__components__/item-sold-out/item-sold-out';
import { render, screen } from '@testing-library/react';

const closeNftCheckout = jest.fn();

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

jest.mock('@app/send/rpc/nft/magic_nft_checkout/__hooks__/use-close-nft-checkout', () => ({
  useCloseNftCheckout: jest.fn().mockReturnValue({
    closeNftCheckout: () => closeNftCheckout(),
  }),
}));

const setup = () => {
  return render(<ItemSoldOut />);
};

describe('ItemSoldOut component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render ItemSoldOut correctly', () => {
    setup();

    expect(screen.getByText('Item sold out')).toBeInTheDocument();
  });
});
