import Logout from '@app/send/rpc/auth/magic_auth_logout/page';
import { useStore } from '@hooks/store';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';

const mockedMutate = jest.fn();
const mockResolve = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: jest.fn(() => '/send/rpc/auth/magic_auth_logout'),
}));

jest.mock('@hooks/data/embedded/user', () => ({
  useUserLogoutQuery: jest.fn().mockImplementation(() => ({
    mutate: (payload: unknown, options: { onSuccess: () => void }) => {
      mockedMutate(payload);
      options.onSuccess();
    },
  })),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: false, isComplete: true })),
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => mockResolve),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    getActiveRpcPayload: jest.fn().mockReturnValue({ params: ['0x123', 'message'] }),
    emitJsonRpcEventResponse: jest.fn(),
    getEncodedQueryParams: jest.fn(),
    logPagePerformanceMetrics: jest.fn(),
  },
}));

function setup(authState: { authUserId: string | null; authUserSessionToken: string | null }) {
  useStore.setState(authState);
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Logout />
    </QueryClientProvider>,
  );
}

describe('Logout Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call logout mutation with authUserId', async () => {
    setup({
      authUserId: 'X95nor-YoN7cDSew7_lTxJDR_YIn7r1FPFW9m7f6chI=',
      authUserSessionToken:
        '0366867af3614bec581ff1b104d8eb1f3b25a32b4f30bfd3fbf2f486d2e13cf7.iXl38TfF8mpfR3jXTO7TP92-3QE',
    });

    await waitFor(() => {
      expect(mockedMutate).toHaveBeenCalledTimes(1);
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  it('should resolve RPC request with no mutation call when no authUserId', async () => {
    setup({ authUserId: null, authUserSessionToken: null });

    await waitFor(() => {
      expect(mockedMutate).toHaveBeenCalledTimes(0);
      expect(mockResolve).toHaveBeenCalledTimes(1);
    });
  });
});
