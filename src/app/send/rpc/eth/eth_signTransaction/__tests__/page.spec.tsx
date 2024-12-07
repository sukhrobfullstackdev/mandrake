import EthSignTransactionPage from '@app/send/rpc/eth/eth_signTransaction/page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockClientConfig } from '@mocks/client-config';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, waitFor } from '@testing-library/react';

const mockReplace = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();
const mockResolveActiveRpcRequest = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: false, isComplete: true })),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => mockResolveActiveRpcRequest),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    getActiveRpcPayload: jest.fn(),
    getEncodedQueryParams: jest.fn(),
  },
}));

jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet', () => ({
  useHydrateOrCreateEthWallet: () => ({
    credentialsData: 'foo',
    walletInfoData: {},
  }),
}));

function setup(
  hydrateSessionObj: { isError: boolean; isComplete: boolean },
  activeRpcPayload: any,
  isSendTransactionUiEnabled = false,
) {
  useStore.setState({ magicApiKey: 'magic-api-key' });
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue(activeRpcPayload);

  const queryClient = new QueryClient(TEST_CONFIG);

  queryClient.setQueryData(
    magicClientQueryKeys.config({
      magicApiKey: 'magic-api-key',
    }),
    {
      ...mockClientConfig,
      features: {
        isSendTransactionUiEnabled,
      },
    },
  );

  (useHydrateSession as jest.Mock).mockImplementation(() => ({ ...hydrateSessionObj }));

  return render(
    <QueryClientProvider client={queryClient}>
      <EthSignTransactionPage />
    </QueryClientProvider>,
  );
}

describe('ETH Sign Transaction Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject the payload when session hydration fails', async () => {
    setup(
      { isComplete: true, isError: true },
      {
        jsonrpc: '2.0',
        method: 'eth_signTransaction',
        id: 1,
        params: [
          {
            from: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            to: '0x08651bf2b26aa779d58fcaf763784ab28ab4d2ba',
            value: 100000000000,
          },
        ],
      },
    );
    await renderHook(() => useHydrateSession());

    await waitFor(() => {
      expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(
        RpcErrorCode.InvalidRequest,
        RpcErrorMessage.UserDeniedAccountAccess,
      );
    });
  });
});
