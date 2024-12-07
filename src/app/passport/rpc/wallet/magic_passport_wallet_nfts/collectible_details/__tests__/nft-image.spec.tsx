import NFTImage from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details/components/nft-image';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const mockNftImage = {
  name: 'Deep Spring',
  imgSrc: 'https://nft-cdn.alchemy.com/matic-mainnet/f66cda4329df553edc160ac5e337b98c',
};

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <NFTImage src={mockNftImage.imgSrc} alt={mockNftImage.name} />
    </QueryClientProvider>,
  );
}

describe('Magic Passport NFT Image', () => {
  beforeEach(setup);

  it('renders an NFT image', () => {
    const nftImage = screen.getByAltText('Deep Spring');
    expect(nftImage).toBeInTheDocument();
  });
});
