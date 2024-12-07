import PassportCollectibles from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/components/passport-collectibles';
import { mockAlchemyNfts } from '@mocks/nfts';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    replace: mockReplace,
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PassportCollectibles networkName="Sepolia Testnet" nfts={mockAlchemyNfts.ownedNfts} />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Collectibles View', () => {
  beforeEach(setup);

  it('renders the correct amount of nft tiles', () => {
    const nftTiles = screen.getAllByRole('button');
    expect(nftTiles).toHaveLength(mockAlchemyNfts.ownedNfts.length);
  });

  it('navigates to the correct route when an nft tile is clicked', () => {
    const nftTile = screen.getAllByRole('button')[0];
    act(() => nftTile.click());
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details');
  });
});
