import EthSendTransactionEvm from '@app/send/rpc/eth/eth_sendTransaction/evm/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('alchemy-sdk', () => ({
  Network: {
    ETH_MAINNET: 'eth-mainnet',
    ETH_GOERLI: 'eth-goerli',
    ETH_SEPOLIA: 'eth-sepolia',
    MATIC_MAINNET: 'matic-mainnet',
    MATIC_MUMBAI: 'matic-mumbai',
    MATIC_AMOY: 'matic-amoy',
    OPT_MAINNET: 'opt-mainnet',
    OPT_GOERLI: 'opt-goerli',
    ARB_MAINNET: 'arb-mainnet',
    ARB_SEPOLIA: 'arb-sepolia',
    BASE_MAINNET: 'base-mainnet',
    BASE_SEPOLIA: 'base-sepolia',
  },
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    getActiveRpcPayload: jest.fn(),
    getEncodedQueryParams: jest.fn(),
  },
}));

function setup(activeRpcPayload: any) {
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue(activeRpcPayload);

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <EthSendTransactionEvm />
    </QueryClientProvider>,
  );
}

describe('ETH Send EVM Transaction Page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty div', async () => {
    const { container } = await act(() =>
      setup({
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
      }),
    );
    expect(container.getElementsByTagName('div')).toHaveLength(28);
  });
});
