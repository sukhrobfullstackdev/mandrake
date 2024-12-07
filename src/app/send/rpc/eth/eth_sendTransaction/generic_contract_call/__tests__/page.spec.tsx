import EthSendTransactionGenericContractCall from '@app/send/rpc/eth/eth_sendTransaction/generic_contract_call/page';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
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
      <EthSendTransactionGenericContractCall />
    </QueryClientProvider>,
  );
}

describe('ETH Send Transaction Generic Contract Call Page', () => {
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
            data: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            from: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
            to: '0x08651bf2b26aa779d58fcaf763784ab28ab4d2ba',
            value: 100000000000,
          },
        ],
      }),
    );
    expect(container.getElementsByTagName('div')).toHaveLength(1);
  });
});
