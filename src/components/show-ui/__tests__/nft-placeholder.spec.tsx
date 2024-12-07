import NFTPlaceholder from '@components/show-ui/nft-placeholder';
import { useColorMode } from '@hooks/common/client-config';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('@hooks/common/client-config', () => ({
  useColorMode: jest.fn(),
}));

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    IconArt: () => <svg data-testid="icon-art" />,
    IconGameController: () => <svg data-testid="icon-game-controller" />,
    IconMusic: () => <svg data-testid="icon-music" />,
    IconTicket: () => <svg data-testid="icon-ticket" />,
    IconArtDark: () => <svg data-testid="icon-art-dark" />,
    IconGameControllerDark: () => <svg data-testid="icon-game-controller-dark" />,
    IconMusicDark: () => <svg data-testid="icon-music-dark" />,
    IconTicketDark: () => <svg data-testid="icon-ticket-dark" />,
  };
});

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <NFTPlaceholder />
    </QueryClientProvider>,
  );
}

describe('NFT Placeholder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders light mode icons when in light mode', () => {
    (useColorMode as jest.Mock).mockReturnValue('light');
    setup();
    expect(screen.getByTestId('icon-art')).toBeInTheDocument();
    expect(screen.getByTestId('icon-game-controller')).toBeInTheDocument();
    expect(screen.getByTestId('icon-music')).toBeInTheDocument();
    expect(screen.getByTestId('icon-ticket')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-art-dark')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-game-controller-dark')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-music-dark')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-ticket-dark')).not.toBeInTheDocument();
  });

  it('renders dark mode icons when in dark mode', () => {
    (useColorMode as jest.Mock).mockReturnValue('dark');
    setup();
    expect(screen.queryByTestId('icon-art')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-game-controller')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-music')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-ticket')).not.toBeInTheDocument();
    expect(screen.getByTestId('icon-art-dark')).toBeInTheDocument();
    expect(screen.getByTestId('icon-game-controller-dark')).toBeInTheDocument();
    expect(screen.getByTestId('icon-music-dark')).toBeInTheDocument();
    expect(screen.getByTestId('icon-ticket-dark')).toBeInTheDocument();
  });
});
