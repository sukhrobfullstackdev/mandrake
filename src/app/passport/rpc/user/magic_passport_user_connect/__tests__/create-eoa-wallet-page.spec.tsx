import CreateEAOWalletPage from '@app/passport/rpc/user/magic_passport_user_connect/create_eoa_wallet/page';
import { usePassportStore } from '@hooks/data/passport/store';
import { useCreateEOAWalletMutation } from '@hooks/data/passport/wallet';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

const mockUseAssociateUserWithPublicAddressMutation = jest.fn().mockImplementation(() => ({
  publicAddress: 'publicAddress',
  walletId: 'walletId',
  id: 'id',
}));

const mockPrefetch = jest.fn();
const mockReplace = jest.fn();

const mockCreateEOAWalletMutation = jest.fn().mockImplementation(() => ({
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
  useCreateEOAWalletMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockCreateEOAWalletMutation,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

jest.mock('@app/passport/libs/tee/kernel-client', () => ({
  enableCab: jest.fn().mockImplementation(() => {}),
  getSmartAccount: jest.fn().mockImplementation(() => ({
    address: 'address',
  })),
}));

jest.mock('@hooks/data/passport/user', () => ({
  useAssociateUserWithPublicAddressMutation: jest.fn().mockImplementation(() => ({
    mutateAsync: mockUseAssociateUserWithPublicAddressMutation,
    isError: false,
    isPending: false,
    error: null,
    reset: jest.fn(),
    isSuccess: false,
  })),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      new Promise(res => {
        res({ status: 'ok' });
      }),
  }),
) as jest.Mock;

function setup({ accessToken }: { accessToken?: string }) {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: 1,
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  usePassportStore.setState({ accessToken, decodedQueryParams: { network: { id: 11155111, rpcUrls: [] } } as any });

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateEAOWalletPage />
    </QueryClientProvider>,
  );
}

describe('Magic Passport Create EOA Wallet Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not call the create wallet mutation if no accessToken exists', async () => {
    await act(async () => {
      await setup({ accessToken: undefined });
    });

    expect(mockCreateEOAWalletMutation).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/passport/error?code=WALLET_ERROR');
  });

  it('calls the create wallet mutation', async () => {
    await act(async () => {
      await setup({ accessToken: 'a;sldfkja23ra' });
    });

    expect(mockCreateEOAWalletMutation).toHaveBeenCalled();
    expect(usePassportStore.getState().eoaPublicAddress).toBe('publicAddress');

    expect(mockReplace).toHaveBeenCalledWith('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');
  });

  it('calls the create wallet mutation', async () => {
    (useCreateEOAWalletMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: jest.fn().mockRejectedValue(new Error('')),
      isPending: false,
      reset: jest.fn(),
      isSuccess: false,
      isError: true,
    }));

    await act(async () => {
      await setup({ accessToken: 'a;sldfkja23ra' });
    });
    expect(mockReplace).toHaveBeenCalledWith('/passport/error?code=WALLET_ERROR');
  });

  it('calls the create wallet mutation', async () => {
    (mockUseAssociateUserWithPublicAddressMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: jest.fn().mockRejectedValue(new Error('')),
      isPending: false,
      reset: jest.fn(),
      isSuccess: false,
      isError: true,
    }));

    await act(async () => {
      await setup({ accessToken: 'a;sldfkja23ra' });
    });
    expect(mockReplace).toHaveBeenCalledWith('/passport/error?code=WALLET_ERROR');
  });
});
