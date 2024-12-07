import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useOverrideEmailLinkRpcPayload } from '@hooks/common/email-link';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import LoginWithMagicLink from '../page';

const mockReplace = jest.fn();

const mockResetAuthState = jest.fn();

const mockHydrateAndPersistAuthState = jest.fn();

const mockRejectActiveRpcRequest = jest.fn();

const initialPayload = {
  method: 'magic_auth_login_with_magic_link',
  params: [{ email: 'test@email.com' }],
  jsonrpc: '2.0',
  id: 1,
};
jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: jest.fn(),
  },
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

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: jest.fn().mockImplementation(() => ({
    replace: mockReplace,
  })),
}));

jest.mock('@hooks/common/email-link', () => ({
  useEmailLinkPoller: jest.fn().mockImplementation(() => ({
    isEmailLinkExpired: false,
    isEmailLinkRedirected: false,
    isEmailLinkVerified: false,
  })),
  useOverrideEmailLinkRpcPayload: jest.fn().mockImplementation(() => ({
    isPayloadUpdated: true,
    updatedPayload: initialPayload,
  })),
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
}));

function setup(
  activeRpcPayload: JsonRpcRequestPayload = initialPayload,
  hydrateSession = { isError: true, isComplete: true },
  isPayloadUpdated = true,
) {
  const queryClient = new QueryClient(TEST_CONFIG);

  useStore.setState({
    ...initialState,
  });
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue(activeRpcPayload);
  (AtomicRpcPayloadService.getActiveRpcPayload as any).mockReturnValue('test');

  (useResetAuthState as jest.Mock).mockImplementation(() => ({
    resetAuthState: mockResetAuthState,
  }));

  (useHydrateSession as jest.Mock).mockImplementation(() => hydrateSession);
  (useOverrideEmailLinkRpcPayload as jest.Mock).mockImplementation(() => ({
    isPayloadUpdated,
    updatedPayload: activeRpcPayload,
  }));

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginWithMagicLink />
    </QueryClientProvider>,
  );
}

describe('Login With Email link Verify Session Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls reset auth state and navigates to /start route', () => {
    setup();

    const { result } = renderHook(() => useResetAuthState());

    expect(result.current.resetAuthState).toHaveBeenCalled();

    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_magic_link/start');
  });

  it('should show the overlay when the component mounts', () => {
    setup();
    expect(IFrameMessageService.showOverlay).toHaveBeenCalledWith();
  });

  it('should not show the overlay when the showUI is false', () => {
    setup({
      method: 'magic_auth_login_with_magic_link',
      params: [{ email: 'test@email.com', showUI: false }],
      jsonrpc: '2.0',
      id: 1,
    });
    expect(IFrameMessageService.showOverlay).not.toHaveBeenCalled();
  });

  it('should reject payload if email is missing', () => {
    setup(
      {
        method: 'magic_auth_login_with_magic_link',
        params: [{ email: '' }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: false },
    );
    expect(IFrameMessageService.showOverlay).not.toHaveBeenCalled();
    expect(mockRejectActiveRpcRequest).toHaveBeenCalledWith(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
  });

  it('should not resetAuth if payload is not override', () => {
    setup(
      {
        method: 'magic_auth_login_with_magic_link',
        params: [{ email: 'test@email.com', showUI: true }],
        jsonrpc: '2.0',
        id: 1,
      },
      { isError: false, isComplete: false },
      false,
    );
    expect(IFrameMessageService.showOverlay).not.toHaveBeenCalled();
  });
});
