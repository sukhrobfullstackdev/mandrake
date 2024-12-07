import RecoveryPage from '@app/send/rpc/auth/magic_auth_recover_account/page';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { StoreState, initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const mockShowUI = jest.fn();
const mockResetAuthState = jest.fn();
const mockHydrateAndPersistAuthState = jest.fn();
const mockRejectActiveRpcRequest = jest.fn();
const mockReplace = jest.fn();
const mockFetchFactorList = jest.fn();

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: mockShowUI,
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: true, isComplete: true })),
}));

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    getActiveRpcPayload: jest.fn(),
    getEncodedQueryParams: jest.fn(),
  },
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => jest.fn()),
}));

jest.mock('@hooks/common/auth-state', () => ({
  useResetAuthState: jest.fn().mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  })),
  useSetAuthState: jest.fn().mockImplementation(() => ({
    hydrateAndPersistAuthState: mockHydrateAndPersistAuthState,
  })),
}));

jest.mock('@app/send/rpc/auth/magic_auth_recover_account/__hooks__/sms-recovery-attempt', () => ({
  useGetFactorMutation: jest.fn().mockImplementation(() => ({
    data: [],
    mutateAsync: mockFetchFactorList,
  })),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

const initialPayload = {
  method: 'magic_auth_recover_account',
  params: [{ email: 'test@email.com' }],
  jsonrpc: '2.0',
  id: 1,
};

function setup(
  activeRpcPayload: JsonRpcRequestPayload = initialPayload,
  hydrateSession = { isError: true, isComplete: true },
  state: Partial<StoreState> = initialState,
) {
  const queryClient = new QueryClient(TEST_CONFIG);

  useStore.setState({
    ...state,
  });
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue(activeRpcPayload);
  (AtomicRpcPayloadService.getEncodedQueryParams as any).mockReturnValue('test');

  (useResetAuthState as jest.Mock).mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  }));

  (useHydrateSession as jest.Mock).mockImplementation(() => hydrateSession);

  return render(
    <QueryClientProvider client={queryClient}>
      <RecoveryPage />
    </QueryClientProvider>,
  );
}

describe('Recover account initial page', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if user is already logged in', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
        authUserSessionToken: 'ust',
      },
    );

    expect(mockRejectActiveRpcRequest).toHaveBeenCalled();
  });
  it('should throw an error if email is not provided', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: '', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: '',
      },
    );

    expect(mockRejectActiveRpcRequest).toHaveBeenCalled();
  });

  it('should navigate to /start if hydration complete and user is NOT logged in', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_recover_account/start');
  });

  it('should navigate to /start if hydration fails', () => {
    setup(
      {
        method: 'magic_auth_recover_account',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: true, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_recover_account/start');
  });
});
