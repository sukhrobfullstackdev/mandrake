import { SomethingWentWrongPage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/something-went-wrong/something-went-wrong';
import { act, render, screen } from '@testing-library/react';

const setStatus = jest.fn();

jest.mock('@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context', () => ({
  useNftCheckoutContext: () => ({
    setStatus: () => setStatus(),
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
  return render(<SomethingWentWrongPage />);
};

describe('NftCheckoutHome component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render SomethingWentWrongpage correctly', () => {
    setup();

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('Click try again button', () => {
    setup();

    const button = screen.getByText('Try Again');

    expect(setStatus).toHaveBeenCalledTimes(0);

    act(() => button.click());

    expect(setStatus).toHaveBeenCalledTimes(1);
  });
});
