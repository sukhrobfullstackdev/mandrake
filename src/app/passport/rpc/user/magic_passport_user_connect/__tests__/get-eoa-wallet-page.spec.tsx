import GetPassportEOAWalletPage from '@app/passport/rpc/user/magic_passport_user_connect/get_eoa_wallet/page';
import { usePassportStore } from '@hooks/data/passport/store';
import { useGetEOAWalletMutation } from '@hooks/data/passport/wallet';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { Network } from 'magic-passport/types';
import { sepolia } from 'viem/chains';

const mockPrefetch = jest.fn();
const mockReplace = jest.fn();

const mockGetEOAWalletMutation = jest.fn().mockImplementation(() => ({
  publicAddress: 'publicAddress',
  walletId: 'walletId',
  id: 'id',
}));

jest.mock('@hooks/common/passport-router', () => ({
  usePassportRouter: () => ({
    prefetch: mockPrefetch,
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/data/passport/wallet', () => ({
  useGetEOAWalletMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockGetEOAWalletMutation,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

function setup({ accessToken, network }: { accessToken?: string; network?: Network }) {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: 1,
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  usePassportStore.setState({ accessToken, decodedQueryParams: { network } });

  return render(
    <QueryClientProvider client={queryClient}>
      <GetPassportEOAWalletPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Get EOA Wallet Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not call the create wallet mutation if no accessToken exists', async () => {
    await act(async () => {
      await setup({ accessToken: undefined, network: sepolia });
    });

    expect(mockGetEOAWalletMutation).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/passport/error?code=WALLET_ERROR');
  });

  it('does not call the create wallet mutation if no network exists', async () => {
    await act(async () => {
      await setup({ accessToken: 'a;sldfkja23ra', network: undefined });
    });

    expect(mockGetEOAWalletMutation).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/passport/error?code=WALLET_ERROR');
  });

  it('calls the create wallet mutation', async () => {
    await act(async () => {
      await setup({ accessToken: 'a;sldfkja23ra', network: sepolia });
    });

    expect(mockGetEOAWalletMutation).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');
  });

  it('calls the create wallet mutation but throws an error', async () => {
    (useGetEOAWalletMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: jest.fn().mockRejectedValue(new Error('')),
      isPending: false,
      reset: jest.fn(),
      isSuccess: false,
      isError: true,
    }));

    await act(async () => {
      await setup({ accessToken: 'a;sldfkja23ra', network: sepolia });
    });
    expect(mockReplace).toHaveBeenCalledWith('/passport/error?code=WALLET_ERROR');
  });
});
