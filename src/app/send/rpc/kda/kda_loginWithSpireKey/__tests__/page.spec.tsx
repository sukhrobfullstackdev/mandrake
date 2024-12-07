import Page from '@app/send/rpc/kda/kda_loginWithSpireKey/page';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

const mockKadenaBridge = { createSpireKeyWallet: jest.fn().mockResolvedValue('wallet') };
const mockReplace = jest.fn();

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@lib/multichain/ledger-bridge');
jest.mock('@hooks/common/json-rpc-request');

function setup(success = true) {
  mockKadenaBridge.createSpireKeyWallet.mockImplementation(() => {
    if (success) {
      return Promise.resolve('wallet');
    } else {
      return Promise.reject(new Error('Connection failed'));
    }
  });

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

describe('Kda Login With SpireKey', () => {
  beforeEach(() => {
    jest.resetModules();
    (createBridge as jest.Mock).mockResolvedValue(Promise.resolve({ ledgerBridge: mockKadenaBridge }));
  });
  afterEach(() => jest.clearAllMocks());

  it('routes to wallet page on successful connection', async () => {
    setup();
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/kda/wallet');
    });
  });

  it('sets an error message when connection is unsuccessful', async () => {
    setup(false);
    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });
});
