import CollectibleTransferExpiredPage from '@app/send/rpc/nft/magic_nft_transfer/expired/page';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@hooks/common/client-config', () => ({
  useColorMode: jest.fn(),
  useAppName: jest.fn(),
}));

jest.mock('@lib/common/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => (options ? `${key} ${JSON.stringify(options)}` : key),
  }),
}));

jest.mock('@constants/nft', () => ({
  NFT_NO_IMAGE_DARK_URL: 'https://mock-dark-url/nft-no-image-dark.svg',
  NFT_NO_IMAGE_URL: 'https://mock-light-url/nft-no-image.svg',
}));

describe('CollectibleTransferExpiredPage', () => {
  const mockedUseColorMode = jest.requireMock('@hooks/common/client-config').useColorMode;
  const mockedUseAppName = jest.requireMock('@hooks/common/client-config').useAppName;
  const originalWindowClose = window.close;

  beforeEach(() => {
    jest.clearAllMocks();
    window.close = jest.fn();
    mockedUseAppName.mockReturnValue('MockApp');
  });

  afterEach(() => {
    window.close = originalWindowClose;
  });

  it('renders the component correctly with light theme', () => {
    mockedUseColorMode.mockReturnValue('light');
    render(<CollectibleTransferExpiredPage />);

    const image = screen.getByAltText('NFT transfer error');
    expect(image).toHaveAttribute('src', 'https://mock-light-url/nft-no-image.svg');

    expect(screen.getByText('Request expired')).toBeInTheDocument();
    expect(
      screen.getByText('For your security, please go back to {{appName}} and try again {"appName":"MockApp"}'),
    ).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders the correct image URL for dark theme', () => {
    mockedUseColorMode.mockReturnValue('dark');
    render(<CollectibleTransferExpiredPage />);

    const image = screen.getByAltText('NFT transfer error');
    expect(image).toHaveAttribute('src', 'https://mock-dark-url/nft-no-image-dark.svg');
  });

  it('renders dynamic content with appName', () => {
    mockedUseColorMode.mockReturnValue('light');
    mockedUseAppName.mockReturnValue('TestApp');
    render(<CollectibleTransferExpiredPage />);

    expect(
      screen.getByText('For your security, please go back to {{appName}} and try again {"appName":"TestApp"}'),
    ).toBeInTheDocument();
  });

  it('calls window.close when Close button is clicked', async () => {
    render(<CollectibleTransferExpiredPage />);

    const closeButton = screen.getByText('Close');
    await fireEvent.click(closeButton);

    expect(window.close).toHaveBeenCalledTimes(1);
  });
});
