import Page from '@app/send/rpc/kda/wallet/page';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockReturnValue({ get: jest.fn() }),
}));
jest.mock('@hooks/common/json-rpc-request');
jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet', () => ({
  useHydrateOrCreateEthWallet: jest.fn().mockReturnValue({
    isEthWalletHydrated: true,
    ethWalletHydrationError: null,
  }),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

describe('Kda SpireKey Wallet', () => {
  const mockResolve = jest.fn();
  const mockReject = jest.fn();
  beforeEach(() => {
    jest.resetModules();
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolve);
    (useRejectActiveRpcRequest as jest.Mock).mockReturnValue(mockReject);
  });
  afterEach(() => jest.clearAllMocks());

  it('renders header text', () => {
    setup();
    expect(screen.getByText('Continue in SpireKey')).toBeInTheDocument();
  });
});
