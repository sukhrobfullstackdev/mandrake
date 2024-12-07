import CreateWallet from '@components/wallet/create-wallet';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';

const MOCK_DID_TOKEN = 'did:ethr:0x123';

const mockResolveJsonRpcResponse = jest.fn();
const mockReplace = jest.fn();

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: () => mockResolveJsonRpcResponse,
  useRejectActiveRpcRequest: jest.fn(),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: mockReplace,
  })),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets', () => ({
  useHydrateOrCreateWallets: jest.fn().mockImplementation(() => ({
    walletCreationError: '',
    areWalletsCreated: false,
  })),
}));

const mockUseCreateDidTokenForUser = jest.fn().mockImplementation(() => ({ didToken: '12345', error: false }));

jest.mock('@hooks/common/create-did-token-for-user', () => ({
  useCreateDidTokenForUser: jest.fn(() => mockUseCreateDidTokenForUser),
}));

jest.mock('@hooks/data/embedded/wallet', () => ({
  useWalletInfoQuery: jest.fn(() => {
    return { data: '0x123' };
  }),
  walletQueryKeys: {
    info: jest.fn(() => {
      return 'info';
    }),
  },
}));

interface SetupParams {
  storeState: Partial<StoreState>;
  walletCreationError?: string;
  areWalletsCreated?: boolean;
  isDidTokenError?: boolean;
  didToken?: string | null;
}

const mockState = {
  sdkMetaData: {
    webCryptoDpopJwt: 'jwt',
  },
};

const setup = ({
  storeState,
  walletCreationError = '',
  areWalletsCreated = false,
  isDidTokenError = false,
  didToken = null,
}: SetupParams) => {
  useStore.setState(storeState);

  (useHydrateOrCreateWallets as jest.Mock).mockImplementation(() => ({
    walletCreationError,
    areWalletsCreated,
  }));

  (useCreateDidTokenForUser as jest.Mock).mockImplementation(() => ({
    didToken: didToken,
    error: isDidTokenError,
  }));

  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_sms',
    id: '1',
    params: [{ phoneNumber: '+12345670890' }],
  });

  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateWallet pageIcon={<></>} />
    </QueryClientProvider>,
  );
};

describe('Login With Sms Wallet Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /start route when session hydration fails', () => {
    setup({ storeState: mockState });

    const { result: ethWalletResult } = renderHook(() => useHydrateOrCreateWallets());
    const { result: didTokenResult } = renderHook(() => useCreateDidTokenForUser());

    expect(ethWalletResult.current.areWalletsCreated).toBe(false);
    expect(ethWalletResult.current.walletCreationError).toBe('');
    expect(didTokenResult.current.didToken).toBe(null);

    expect(screen.getByText('Confirming Login...')).toBeInTheDocument();

    expect(mockResolveJsonRpcResponse).not.toHaveBeenCalled();
  });

  it('navigates to /start route when session hydration fails', () => {
    setup({ storeState: mockState, areWalletsCreated: true, didToken: MOCK_DID_TOKEN });

    const { result: ethWalletResult } = renderHook(() => useHydrateOrCreateWallets());
    const { result: didTokenResult } = renderHook(() => useCreateDidTokenForUser());
    expect(ethWalletResult.current.walletCreationError).toBe('');
    expect(ethWalletResult.current.areWalletsCreated).toBe(true);

    expect(didTokenResult.current.didToken).toBe(MOCK_DID_TOKEN);

    expect(mockResolveJsonRpcResponse).toHaveBeenCalledWith(MOCK_DID_TOKEN);
  });

  it('navigates to /start route when session hydration fails', () => {
    const { queryByText } = setup({ storeState: mockState, walletCreationError: 'error' });
    const button = screen.getByText('Try Again');

    const { result: ethWalletResult } = renderHook(() => useHydrateOrCreateWallets());
    expect(ethWalletResult.current.walletCreationError).toBe('error');
    expect(ethWalletResult.current.areWalletsCreated).toBe(false);
    waitFor(() => expect(queryByText('An unexpected error occurred. Please try again')).toBeInTheDocument());
    act(() => button.click());
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_sms');

    expect(mockResolveJsonRpcResponse).not.toHaveBeenCalled();
  });
});
