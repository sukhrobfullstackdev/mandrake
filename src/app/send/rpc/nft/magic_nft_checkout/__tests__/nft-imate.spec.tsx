import { NftImage } from '@app/send/rpc/nft/magic_nft_checkout/__components__/nft-image';
import { render, screen } from '@testing-library/react';

const NFT_THUMBNAIL_URL = 'https://nft-cdn.alchemy.com/matic-mumbai/5d55353a3f95997ce7b33bc08c6832ed';
const NFT_ALT = 'nft_thumbnail';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const setup = () => {
  return render(<NftImage src={NFT_THUMBNAIL_URL} alt={NFT_ALT} />);
};

describe('NftImage component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render NftImage correctly', () => {
    setup();

    expect(screen.getByAltText(NFT_ALT).getAttribute('src')).toContain(NFT_THUMBNAIL_URL);
  });
});
