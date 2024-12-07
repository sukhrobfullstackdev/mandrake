import EthSendTransactionPage from '@app/send/rpc/eth/eth_sendTransaction/page';
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
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@lib/common/rpc-provider', () => ({
  getRpcProvider: () => ({
    getBlock: () => ({
      catch: jest.fn(),
    }),
    getNetwork: () => ({
      chainId: 137,
      catch: jest.fn(),
    }),
    getFeeData: () => ({
      maxPriorityFeePerGas: '0x0',
      maxFeePerGas: '0x0',
    }),
    estimateGas: jest.fn(),
    getTransactionCount: jest.fn(),
  }),
}));

jest.mock('@hooks/blockchain/ethereum/sign-transaction', () => ({
  signTransactionForUser: () => ({ rawTransaction: '0x123' }),
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
    startPerformanceTimer: jest.fn(),
    setIsUIFlow: jest.fn(),
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
      <EthSendTransactionPage />
    </QueryClientProvider>,
  );
}

describe('ETH Send Transaction Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the loading spinner', async () => {
    const { container } = setup(
      { isComplete: false, isError: false },
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
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

    await await waitFor(() => {
      expect(container.getElementsByTagName('circle')).toHaveLength(2);
    });
  });

  it('should reject the payload when session hydration fails', async () => {
    setup(
      { isComplete: true, isError: true },
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
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

  it('should call sendHeadlessEthTransaction', async () => {
    setup(
      { isComplete: true, isError: false },
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
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
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('should navigate to eth_sendTransaction/evm if params[0].data is missing', async () => {
    setup(
      { isComplete: true, isError: false },
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        id: 1,
        params: [
          {
            from: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            to: '0x08651bf2b26aa779d58fcaf763784ab28ab4d2ba',
            value: 100000000000,
          },
        ],
      },
      true,
    );
    await renderHook(() => useHydrateSession());
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/eth/eth_sendTransaction/evm');
    });
  });

  it('should navigate to eth_sendTransaction/erc_20 if params[0].data starts with 0xa9059cbb', async () => {
    setup(
      { isComplete: true, isError: false },
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        id: 1,
        params: [
          {
            data: '0xa9059cbbc1699bb9d58fac67f3a487b28ab4ab2d',
            from: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            to: '0x08651bf2b26aa779d58fcaf763784ab28ab4d2ba',
            value: 100000000000,
          },
        ],
      },
      true,
    );
    await renderHook(() => useHydrateSession());
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/eth/eth_sendTransaction/erc_20');
    });
  });

  it('should navigate to eth_sendTransaction/generic_contract_call if params[0].data does not start with 0xa9059cbb', async () => {
    setup(
      { isComplete: true, isError: false },
      {
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        id: 1,
        params: [
          {
            data: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            from: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            to: '0x08651bf2b26aa779d58fcaf763784ab28ab4d2ba',
            value: 100000000000,
          },
        ],
      },
      true,
    );
    await renderHook(() => useHydrateSession());
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/send/rpc/eth/eth_sendTransaction/evm');
    });
  });
});
