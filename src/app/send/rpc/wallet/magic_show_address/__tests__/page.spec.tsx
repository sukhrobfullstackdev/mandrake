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

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: jest.fn(() => ({
    userMetadata: {
      publicAddress: '0xAC209574729dDc856001E57c3B1Fb96ef64A782C',
      email: 'test@email.com',
    },
  })),
}));

jest.mock('@hooks/common/client-config', () => {
  const mockUseAppName = jest.fn(() => 'Test App');
  return {
    useAppName: mockUseAppName,
    useAssetUri: jest.fn(),
    useThemeColors: jest.fn().mockReturnValue({ buttonColor: '#ac0000' }),
    useColorMode: jest.fn(),
  };
});

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

describe('WalletAccountInfoPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the network name', async () => {
    setup();
    const content = await screen.findByText('Sepolia Testnet');
    expect(content).toBeInTheDocument();
  });

  it('navigates to wallet home when the account button is clicked', async () => {
    setup();
    const accountButton = screen.getAllByRole('button')[0];

    act(() => {
      accountButton.click();
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/home'));
  });

  it('navigates to magic_auth_logout when the logout button is clicked', async () => {
    setup();
    const logoutButton = screen.getByRole('button', { name: /Log out/i });

    act(() => {
      logoutButton.click();
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_logout'));
  });

  it('displays the app name', async () => {
    setup();
    const content = await screen.findByText('Test App Wallet');
    expect(content).toBeInTheDocument();
  });

  it('displays the user email address', async () => {
    setup();
    const content = await screen.findByText('test@email.com');
    expect(content).toBeInTheDocument();
  });

  it('displays a truncated wallet address', async () => {
    setup();
    const content = await screen.findByText('0xAC20...782C');
    expect(content).toBeInTheDocument();
  });
});
