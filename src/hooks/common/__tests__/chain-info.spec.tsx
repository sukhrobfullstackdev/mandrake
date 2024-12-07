import { LEDGER_NETWORKS } from '@constants/chain-info';
import { WalletType } from '@custom-types/wallet';
import { useChainInfo } from '@hooks/common/chain-info';
import { StoreState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getETHNetworkUrl, getNetworkName, getWalletType, isCustomNode } from '@lib/utils/network-name';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderHookResult, act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

jest.mock('@hooks/data/embedded/magic-client', () => ({
  useClientConfigQuery: () => ({
    data: {
      clientTheme: {
        themeColor: 'dark',
      },
    },
  }),
}));

jest.mock('@lib/utils/network-name', () => ({
  getETHNetworkUrl: jest.fn(() => 'https://mainnet.infura.io/v3/123'),
  getNetworkName: jest.fn(() => 'mainnet'),
  getWalletType: jest.fn(() => WalletType.ETH),
  isCustomNode: jest.fn(() => false),
}));

jest.mock('@hooks/data/embedded/ethereum-proxy', () => ({
  useEthereumProxyQuery: jest.fn(() => ({ mutateAsync: jest.fn() })),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
  useRejectActiveRpcRequest: jest.fn(() => jest.fn()),
}));

jest.mock('@hooks/common/ethereum-proxy', () => ({
  useEthereumProxy: jest.fn(() => ({
    getChainId: jest.fn().mockResolvedValue(1),
  })),
}));

jest.mock('@hooks/data/embedded/user', () => ({
  useUserInfoQuery: jest.fn(() => ({
    data: { publicAddress: '0x123' },
    error: null,
  })),
  userQueryKeys: {
    info: jest.fn(() => {
      return 'info';
    }),
  },
}));

type SetupParams = {
  storeState: Partial<StoreState>;
  walletType: WalletType;
  customNode: boolean;
};
type SetupReturn = RenderHookResult<{ chainId: number; chainInfo: object; walletType: string }, unknown>;

const setup = async ({ storeState, walletType, customNode }: SetupParams) => {
  const queryClient = new QueryClient();

  useStore.setState(storeState);
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_magic_link',
    id: '1',
    params: [{ email: 'test@email.com' }],
  });

  // queryClient.setQueryData(
  //   magicClientQueryKeys.config({
  //     magicApiKey: 'magic-api-key',
  //   }),
  //   {
  //     ...mockClientConfig,
  //     features: {
  //       isSendTransactionUiEnabled: true,
  //     },
  //   },
  // );

  (getWalletType as jest.Mock).mockReturnValue(walletType);
  (isCustomNode as jest.Mock).mockReturnValue(customNode);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  let hook: SetupReturn | unknown;

  await act(async () => {
    hook = await renderHook(() => useChainInfo(), { wrapper });
  });

  return hook as SetupReturn;
};

describe('useChainInfo', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and set chain info for ETH wallet type', async () => {
    (getETHNetworkUrl as jest.Mock).mockReturnValue('https://mainnet.infura.io/v3/123');

    const { result } = await setup({
      storeState: {
        authUserId: 'user-id',
        authUserSessionToken: 'session-token',
        decodedQueryParams: {
          apiKey: 'api-key',
          ethNetwork: 'mainnet',
          version: '1.0',
          ext: {},
          sdkType: 'sdkType',
          domainOrigin: 'domain',
        },
      },
      walletType: WalletType.ETH,
      customNode: false,
    });

    expect(result.current.chainId).toBe('1');
    expect(result.current.chainInfo).toBe((LEDGER_NETWORKS as any).ETH[1]);
    expect(result.current.chainInfo).toBe((LEDGER_NETWORKS as any).ETH[1]);
  });

  it('should set chain info for non-ETH wallet type mainnet (Flow)', async () => {
    const { result } = await setup({
      storeState: {
        authUserId: 'user-id',
        authUserSessionToken: 'session-token',
        decodedQueryParams: {
          apiKey: 'api-key',
          ethNetwork: 'mainnet',
          version: '1.0',
          ext: { flow: { rpcUrl: 'https://rest-mainnet.onflow.org', chainType: 'FLOW', network: 'mainnet' } },
          sdkType: 'sdkType',
          domainOrigin: 'domain',
        },
      },
      walletType: WalletType.FLOW,
      customNode: false,
    });

    expect(result.current.chainId).toBeNull(); // chainId is not set for non-EVM chains
    expect(result.current.chainInfo).toBe((LEDGER_NETWORKS as any).FLOW.mainnet);
  });

  it('should set chain info for non-ETH wallet type testnet (Flow)', async () => {
    (getETHNetworkUrl as jest.Mock).mockReturnValue('https://mainnet.infura.io/v3/123');
    (getNetworkName as jest.Mock).mockReturnValue('testnet');

    const { result } = await setup({
      storeState: {
        authUserId: 'user-id',
        authUserSessionToken: 'session-token',
        decodedQueryParams: {
          apiKey: 'api-key',
          ethNetwork: 'mainnet',
          version: '1.0',
          ext: { flow: { rpcUrl: 'https://rest-mainnet.onflow.org', chainType: 'FLOW', network: 'mainnet' } },
          sdkType: 'sdkType',
          domainOrigin: 'domain',
        },
      },
      walletType: WalletType.FLOW,
      customNode: false,
    });

    expect(result.current.chainId).toBeNull(); // chainId is not set for non-EVM chains
    expect(result.current.chainInfo).toBe((LEDGER_NETWORKS as any).FLOW.testnet);
  });

  it('should handle custom node URL', async () => {
    (getETHNetworkUrl as jest.Mock).mockReturnValue('https://mainnet.infura.io/v3/123');
    const { result } = await setup({
      storeState: {
        authUserId: 'user-id',
        authUserSessionToken: 'session-token',
        decodedQueryParams: {
          apiKey: 'api-key',
          ethNetwork: 'mainnet',
          version: '1.0',
          ext: {},
          sdkType: 'sdkType',
          domainOrigin: 'domain',
        },
      },
      walletType: WalletType.ETH,
      customNode: true,
    });

    expect(result.current.chainId).toBe('1');
    expect(result.current.chainInfo).toBe((LEDGER_NETWORKS as any).ETH[1]);

    expect(getETHNetworkUrl).toHaveBeenCalled();
  });

  it('should handle known RPC URL to chain ID mapping', async () => {
    (getETHNetworkUrl as jest.Mock).mockReturnValue('https://mainnet.infura.io/v3/123');

    const { result } = await setup({
      storeState: {
        authUserId: 'user-id',
        authUserSessionToken: 'session-token',
        decodedQueryParams: {
          apiKey: 'api-key',
          ethNetwork: 'mainnet',
          version: '1.0',
          ext: {},
          sdkType: 'sdkType',
          domainOrigin: 'domain',
        },
      },
      walletType: WalletType.ETH,
      customNode: false,
    });

    expect(result.current.chainId).toBe('1');
    expect(result.current.chainInfo).toBe((LEDGER_NETWORKS as any).ETH[1]);
  });
});
