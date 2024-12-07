import CollectibleTransferErrorPage from '@app/send/rpc/nft/magic_nft_transfer/error/page';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@hooks/common/client-config', () => ({
  useColorMode: jest.fn(),
}));

jest.mock('@lib/common/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@constants/nft', () => ({
  NFT_NO_IMAGE_DARK_URL: 'https://mock-dark-url/nft-no-image-dark.svg',
  NFT_NO_IMAGE_URL: 'https://mock-light-url/nft-no-image.svg',
}));

describe('CollectibleTransferErrorPage', () => {
  const mockedUseColorMode = jest.requireMock('@hooks/common/client-config').useColorMode;
  const originalWindowClose = window.close;

  beforeEach(() => {
    jest.clearAllMocks();
    window.close = jest.fn();
  });

  afterEach(() => {
    window.close = originalWindowClose;
  });

  it('renders the component correctly with light theme', () => {
    mockedUseColorMode.mockReturnValue('light');
    render(<CollectibleTransferErrorPage />);

    const image = screen.getByAltText('NFT transfer error');
    expect(image).toHaveAttribute('src', 'https://mock-light-url/nft-no-image.svg');

    expect(screen.getByText('Invalid NFT')).toBeInTheDocument();
    expect(screen.getByText('Please check the NFT, it may be invalid or you may not own it')).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders the correct image URL for dark theme', () => {
    mockedUseColorMode.mockReturnValue('dark');
    render(<CollectibleTransferErrorPage />);

    const image = screen.getByAltText('NFT transfer error');
    expect(image).toHaveAttribute('src', 'https://mock-dark-url/nft-no-image-dark.svg');
  });

  it('calls window.close when Close button is clicked', async () => {
    render(<CollectibleTransferErrorPage />);

    const closeButton = screen.getByText('Close');
    await fireEvent.click(closeButton);

    expect(window.close).toHaveBeenCalledTimes(1);
  });
});
