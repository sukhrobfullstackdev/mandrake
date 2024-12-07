import WalletFiatOnrampSelectionPage from '@app/send/rpc/wallet/magic_wallet/select_fiat_onramp/page';
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
      networkName: 'Sepolia Testnet',
    },
  }),
}));

jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn(),
}));

AtomicRpcPayloadService.setActiveRpcPayload({
  jsonrpc: '2.0',
  method: 'eth_sendTransaction',
  id: 'my_id',
  params: [{ email: 'test@mgail.com' }],
});

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WalletFiatOnrampSelectionPage />
    </QueryClientProvider>,
  );
}

describe('Wallet fiat onramp selection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a network name', () => {
    setup();
    const content = screen.getByText('Sepolia Testnet');
    expect(content).toBeInTheDocument();
  });

  it('navigates to wallet home when back button is clicked', async () => {
    setup();
    const backButton = screen.getAllByRole('button')[0];
    act(() => backButton.click());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/send/rpc/wallet/magic_wallet/home'));
  });
});
