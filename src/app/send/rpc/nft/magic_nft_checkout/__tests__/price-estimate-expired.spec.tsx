import { PriceEstimateExpired } from '@app/send/rpc/nft/magic_nft_checkout/__components__/price-estimate-expired/price-estimate-expired';
import { act, render, screen } from '@testing-library/react';

const setStatus = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue(
    new URLSearchParams({
      hash: '0x1234567890',
    }),
  ),
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

const setup = () => {
  return render(<PriceEstimateExpired />);
};

describe('PriceEstimateExpired component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render PriceEstimateExpired correctly', () => {
    setup();

    expect(screen.getByText('Price estimate expired')).toBeInTheDocument();
  });

  it('should render View updated price button', () => {
    setup();

    const button = screen.getByText('View updated price');
    expect(button).toBeInTheDocument();

    expect(setStatus).toHaveBeenCalledTimes(0);

    act(() => button.click());

    expect(setStatus).toHaveBeenCalledTimes(1);
  });
});
