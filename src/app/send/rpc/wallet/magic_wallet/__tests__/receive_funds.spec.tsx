import WalletReceiveFundsPage from '@app/send/rpc/wallet/magic_wallet/receive_funds/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn().mockReturnValue({
    chainInfo: {
      networkName: 'Ethereum',
    },
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: 1,
    params: [],
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WalletReceiveFundsPage />
    </QueryClientProvider>,
  );
}

describe('Wallet receive funds', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a network name', async () => {
    await act(() => setup());
    const content = screen.getByText('Ethereum');
    expect(content).toBeInTheDocument();
  });

  it('navigates to wallet home when back button is clicked', async () => {
    await act(() => setup());
    const backButton = screen.getAllByRole('button')[0];
    await act(() => backButton.click());
    waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/home'));
  });
});
