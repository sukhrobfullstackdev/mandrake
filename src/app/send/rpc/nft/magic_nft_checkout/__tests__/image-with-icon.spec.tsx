import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { IcoDismissCircleFill } from '@magiclabs/ui-components';
import { render, screen } from '@testing-library/react';

const NFT_THUMBNAIL_URL = 'https://nft-cdn.alchemy.com/matic-mumbai/5d55353a3f95997ce7b33bc08c6832ed';
const NFT_ALT = 'nft_thumbnail';

const setup = () => {
  return render(
    <ImageWithIcon src={NFT_THUMBNAIL_URL} alt={NFT_ALT}>
      <IcoDismissCircleFill width={40} height={40} />
    </ImageWithIcon>,
  );
};

describe('ImageWithIcon component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render ImageWithIcon correctly', () => {
    setup();

    expect(screen.getByAltText(NFT_ALT).getAttribute('src')).toContain(NFT_THUMBNAIL_URL);
  });
});
