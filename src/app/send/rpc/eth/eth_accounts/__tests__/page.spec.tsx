import Page from '@app/send/rpc/eth/eth_accounts/page';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import Web3Service from '@utils/web3-services/web3-service';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@utils/web3-services/web3-service', () => ({
  toChecksumAddress: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: () => ({
    isError: false,
    isComplete: true,
  }),
}));

jest.mock('@lib/message-channel/resolve-json-rpc-response');

jest.mock('@hooks/data/embedded/user', () => ({
  useUserInfoQuery: jest.fn(() => ({
    data: {
      publicAddress: 'mockPubAddr',
    },
    error: null,
  })),
  userQueryKeys: {
    info: jest.fn(() => {
      return 'info';
    }),
  },
}));

(Web3Service.toChecksumAddress as any).mockResolvedValue(Promise.resolve('mockChecksumAddress'));

function executeRequest() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'eth_coinbase',
    id: 'my_id',
    params: [],
  });

  useStore.setState({
    authUserId: 'authUserId',
    magicApiKey: 'magicApiKey',
    authUserSessionToken: 'testUserSessionToken',
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>,
  );
}

describe('eth accounts', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.mock('@hooks/common/json-rpc-request', () => ({
      useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
      useRejectActiveRpcRequest: jest.fn(() => jest.fn()),
    }));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders null', async () => {
    const { container } = executeRequest();
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it('Should correctly return public address', async () => {
    await waitFor(async () => {
      await executeRequest(); // execute
    });
    await waitFor(() => {
      expect(resolveJsonRpcResponse).toHaveBeenCalledWith({
        payload: { id: 'my_id', jsonrpc: '2.0', method: 'eth_coinbase', params: [] },
        sdkMetadata: {},
        analyticsProperties: {
          api_key: 'magicApiKey',
          blockchain: 'ethereum mainnet',
          chainId: '1',
          env: 'test-testnet',
          eventOrigin: '',
          json_rpc_method: 'eth_coinbase',
          rpcUrl: 'mainnet',
          sdk: 'SdkMissing',
          source: 'mandrake-magic',
          uid: 'authUserId',
          walletType: 'ETH',
        },
        result: ['mockChecksumAddress'],
      });
    });
  });
});
