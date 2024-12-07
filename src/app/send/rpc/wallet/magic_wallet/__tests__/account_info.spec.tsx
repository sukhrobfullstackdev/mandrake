import WalletAccountInfoPage from '@app/send/rpc/wallet/magic_wallet/account_info/page';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUseUserMetadata = jest.fn();

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: () => mockUseUserMetadata(),
}));

mockUseUserMetadata.mockImplementation(() => ({
  userMetadata: {
    publicAddress: '0xAC209574729dDc856001E57c3B1Fb96ef64A782C',
    email: 'test@email.com',
  },
}));

const mockUseAppName = jest.fn();

jest.mock('@hooks/common/client-config', () => ({
  useAppName: () => mockUseAppName(),
  useAssetUri: jest.fn(),
  useThemeColors: jest.fn().mockReturnValue({ buttonColor: '#ac0000' }),
  useColorMode: jest.fn(),
}));

mockUseAppName.mockImplementation(() => 'Test App');

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn().mockReturnValue({
    chainInfo: {
      networkName: 'Sepolia Testnet',
    },
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletAccountInfoPage />
    </QueryClientProvider>,
  );
}

describe('Wallet account info', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a network name', () => {
    setup();
    const content = screen.getByText('Sepolia Testnet');
    expect(content).toBeInTheDocument();
  });

  it('navigates to wallet home when account button is clicked', () => {
    setup();
    const accountButton = screen.getAllByRole('button')[0];
    act(() => accountButton.click());
    waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/home'));
  });

  it('navigates to magic_auth_logout when logout button is clicked', () => {
    setup();
    const logoutButton = screen.getByRole('button', { name: /Log out/i });
    act(() => logoutButton.click());
    waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_logout'));
  });

  it('shows an app name', () => {
    setup();
    const content = screen.getByText('Test App Wallet');
    expect(content).toBeInTheDocument();
  });

  it('shows an email address', () => {
    setup();
    const content = screen.getByText('test@email.com');
    expect(content).toBeInTheDocument();
  });

  it('shows a truncated wallet address', () => {
    setup();
    const content = screen.getByText('0xAC20...782C');
    expect(content).toBeInTheDocument();
  });
});
