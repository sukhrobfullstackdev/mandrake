import RequestAccounts from '@app/send/rpc/eth/eth_requestAccounts/page';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserInfoQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { mockOAuthResultParams } from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import Web3Service from '@utils/web3-services/web3-service';

jest.mock('@utils/web3-services/web3-service', () => ({
  toChecksumAddress: jest.fn(),
}));

(Web3Service.toChecksumAddress as any).mockResolvedValue(Promise.resolve('mockChecksumAddress'));

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: jest.fn(),
  },
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn(() => jest.fn()),
  useRejectActiveRpcRequest: jest.fn(() => jest.fn()),
}));
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
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue(mockOAuthResultParams),
  })),
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));
jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({
    isError: true,
    isComplete: true,
  })),
}));

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  AtomicRpcPayloadService.setActiveRpcPayload({ method: 'eth_requestAccounts', params: [], id: 1, jsonrpc: '2.0' });

  return render(
    <QueryClientProvider client={queryClient}>
      <RequestAccounts />
    </QueryClientProvider>,
  );
}

describe('RequestAccounts Component', () => {
  const mockResolveActiveRpcRequest = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays login modal on hydration session error', async () => {
    // Mocking the initial state where there is no authUserId or authUserSessionToken
    useStore.setState({ authUserId: '', authUserSessionToken: '' });
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isComplete: true, isError: true }));
    const { queryByText } = setup();
    await waitFor(() => expect(queryByText('Sign in')).toBeInTheDocument());
  });

  it('resolves active RPC request with checksum address on successful user info fetch', async () => {
    useStore.setState({ authUserId: 'user123', authUserSessionToken: 'token123' });
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isComplete: true, isError: false }));
    (useUserInfoQuery as jest.Mock).mockImplementation(() => ({ data: { publicAddress: '0x123' }, error: null }));
    (useResolveActiveRpcRequest as jest.Mock).mockReturnValue(mockResolveActiveRpcRequest);

    setup();
    await waitFor(() => expect(mockResolveActiveRpcRequest).toHaveBeenCalledWith(['mockChecksumAddress']));
  });

  it('shows login modal if there is an error fetching user info', async () => {
    useStore.setState({ authUserId: 'user123', authUserSessionToken: 'token123' });
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isComplete: true, isError: false }));
    (useUserInfoQuery as jest.Mock).mockImplementation(() => ({ data: null, error: new Error('failed to fetch') }));
    console.error = jest.fn();

    const { queryByText } = setup();
    await waitFor(() => expect(queryByText('Sign in')).toBeInTheDocument());
  });

  it('does not display login modal if user info is successfully fetched and session is hydrated', async () => {
    useStore.setState({ authUserId: 'user123', authUserSessionToken: 'token123' });
    (useHydrateSession as jest.Mock).mockImplementation(() => ({ isComplete: true, isError: false }));
    (useUserInfoQuery as jest.Mock).mockImplementation(() => ({ data: { publicAddress: '0x123' }, error: null }));

    const { queryByText } = setup();
    await waitFor(() => expect(queryByText('Sign in')).not.toBeInTheDocument());
  });
});
