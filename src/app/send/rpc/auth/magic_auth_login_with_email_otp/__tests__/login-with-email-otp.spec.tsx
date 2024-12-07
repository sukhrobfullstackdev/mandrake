import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { StoreState, initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { JsonRpcRequestPayload, LoginWithEmailOTPEventEmit } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import LoginWithEmailOtp from '../page';

const mockReplace = jest.fn();

const mockGet = jest.fn();

const mockResetAuthState = jest.fn();

const mockHydrateAndPersistAuthState = jest.fn();

const mockRejectActiveRpcRequest = jest.fn();

const mockResolveActiveRpcRequest = jest.fn();

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

jest.mock('@hooks/common/hydrate-session', () => ({
  useHydrateSession: jest.fn().mockImplementation(() => ({ isError: true, isComplete: true })),
}));

jest.mock('@hooks/common/auth-state', () => ({
  useResetAuthState: jest.fn().mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  })),
  useSetAuthState: jest.fn().mockImplementation(() => ({
    hydrateAndPersistAuthState: mockHydrateAndPersistAuthState,
  })),
}));

const initialPayload = {
  method: 'magic_auth_login_with_email_otp',
  params: [{ email: 'test@email.com' }],
  jsonrpc: '2.0',
  id: 1,
};

jest.mock('@lib/atomic-rpc-payload', () => ({
  AtomicRpcPayloadService: {
    onEvent: jest.fn(),
    setActiveRpcPayload: jest.fn(),
    getActiveRpcPayload: jest.fn(),
    getEncodedQueryParams: jest.fn(),
    startPerformanceTimer: jest.fn(),
  },
}));

jest.mock('@hooks/common/json-rpc-request', () => ({
  useRejectActiveRpcRequest: jest.fn().mockImplementation(() => mockRejectActiveRpcRequest),
  useResolveActiveRpcRequest: jest.fn().mockImplementation(() => mockResolveActiveRpcRequest),
}));

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
      <LoginWithEmailOtp />
    </QueryClientProvider>,
  );
}

describe('Login With Email OTP Verify Session Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /wallet if we have an active session and the emails match', async () => {
    setup(
      {
        method: 'magic_auth_login_with_email_otp',
        params: [{ email: 'test@email.com', showUI: false }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    const { result } = await renderHook(() => useResetAuthState());

    expect(result.current.resetAuthState).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp/start');
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
  });

  it('navigates to /start if we have an active session but the emails do not match', async () => {
    setup(
      {
        method: 'magic_auth_login_with_email_otp',
        params: [{ email: 'testing@email.com', showUI: false }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: true },
      {
        ...initialState,
        email: 'test@email.com',
      },
    );

    const { result } = await renderHook(() => useResetAuthState());

    expect(result.current.resetAuthState).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp/start');
    expect(mockReplace).not.toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
  });

  it('should show the overlay if session hydration fails', async () => {
    setup(
      {
        method: 'magic_auth_login_with_email_otp',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: true, isComplete: true },
    );
    const { result } = await renderHook(() => useResetAuthState());
    expect(result.current.resetAuthState).toHaveBeenCalled();

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp/start');
    expect(mockReplace).not.toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
    expect(IFrameMessageService.showOverlay).toHaveBeenCalled();
  });

  it('should not show the overlay when the showUI is false', async () => {
    setup({
      method: 'magic_auth_login_with_email_otp',
      params: [{ email: 'test@email.com', showUI: false }],
      jsonrpc: '2.0',
      id: 1,
    });

    const { result } = await renderHook(() => useResetAuthState());
    expect(result.current.resetAuthState).toHaveBeenCalled();

    expect(IFrameMessageService.showOverlay).not.toHaveBeenCalled();
    expect(AtomicRpcPayloadService.onEvent).toHaveBeenCalledWith(
      LoginWithEmailOTPEventEmit.Cancel,
      expect.any(Function),
    );
  });

  it('should reject payload if email is missing', async () => {
    setup(
      {
        method: 'magic_auth_login_with_email_otp',
        params: [{ email: '' }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: false },
    );

    const { result } = await renderHook(() => useResetAuthState());
    expect(result.current.resetAuthState).not.toHaveBeenCalled();

    expect(IFrameMessageService.showOverlay).not.toHaveBeenCalled();
    expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
  });
});
