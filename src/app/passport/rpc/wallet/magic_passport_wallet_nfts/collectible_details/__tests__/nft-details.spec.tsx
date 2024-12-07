import NFTDetails from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/nft-details';
import { mockAlchemyNfts } from '@mocks/nfts';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const { name, description } = mockAlchemyNfts.ownedNfts[0];
const { collectionName, imageUrl } = mockAlchemyNfts.ownedNfts[0].contract.openSeaMetadata;

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <NFTDetails
        nftName={name!}
        description={description!}
        collectionName={collectionName!}
        collectionLogoSrc={imageUrl!}
      />
    </QueryClientProvider>,
  );
}

describe('Magic Passport NFT Details', () => {
  beforeEach(setup);

  it('renders an NFT name', () => {
    const nftName = screen.getByText('Flatiron Building');
    expect(nftName).toBeInTheDocument();
  });

  it('renders a  description', () => {
    const nftDescription = screen.getByText(
      'Free commemorative open edition from Magic’s NFT minting demo at NFT NYC 2023',
    );
    expect(nftDescription).toBeInTheDocument();
  });

  it('renders a collection name', () => {
    const nftCollectionName = screen.getByText('Magic | NFT.NYC 2023');
    expect(nftCollectionName).toBeInTheDocument();
  });
});
