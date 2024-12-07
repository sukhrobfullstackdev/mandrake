import { useHydrateSession } from '@hooks/common/hydrate-session';
import { StoreState, initialState, useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import LoginWithSms from '../page';

const mockReplace = jest.fn();

const mockResetAuthState = jest.fn();

const mockHydrateAndPersistAuthState = jest.fn();

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
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
  jsonrpc: '2.0',
  method: 'magic_auth_login_with_sms',
  id: '1',
  params: [{ phoneNumber: '+14326750098' }],
};

function setup(
  isError: boolean,
  isFetched: boolean,
  state: Partial<StoreState> = initialState,
  activeRpcPayload: JsonRpcRequestPayload = initialPayload,
) {
  AtomicRpcPayloadService.setActiveRpcPayload(activeRpcPayload);
  const queryClient = new QueryClient(TEST_CONFIG);

  useStore.setState({
    ...state,
  });

  (useHydrateSession as jest.Mock).mockImplementation(() => ({
    isError: isError,
    isComplete: isFetched,
  }));

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginWithSms />
    </QueryClientProvider>,
  );
}

describe('Login With Sms Verify Session Component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /wallet route when session hydration succeeds', async () => {
    setup(false, true, { ...initialState, phoneNumber: '+14326750098' });

    const { result } = await renderHook(() => useHydrateSession());

    expect(result.current.isError).toBe(false);
    expect(result.current.isComplete).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_sms/wallet');
  });

  it('navigates to /start route when session hydration succeeds but the phone numbers do not match', async () => {
    setup(false, true, { ...initialState, phoneNumber: '+14326750098' });

    const { result } = await renderHook(() => useHydrateSession());

    expect(result.current.isError).toBe(false);
    expect(result.current.isComplete).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_sms/wallet');
  });

  it('navigates to /start route when session hydration fails', async () => {
    setup(true, true);

    const { result } = await renderHook(() => useHydrateSession());

    expect(result.current.isError).toBe(true);
    expect(result.current.isComplete).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_sms/start');
  });

  it('does not navigate while session hydration is pending', async () => {
    setup(false, false);

    const { result } = await renderHook(() => useHydrateSession());

    expect(result.current.isError).toBe(false);
    expect(result.current.isComplete).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should not show the overlay when showUI is false ', async () => {
    setup(false, true, undefined, {
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_sms',
      id: '1',
      params: [{ phoneNumber: '+14326750098', showUI: false }],
    });

    const { result } = await renderHook(() => useHydrateSession());
    expect(result.current.isComplete).toBe(true);
    expect(IFrameMessageService.showOverlay).not.toHaveBeenCalledWith();
  });
  it('should show the overlay when showUI is true', async () => {
    setup(false, true, undefined, {
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_sms',
      id: '1',
      params: [{ phoneNumber: '+14326750098', showUI: true }],
    });
    const { result } = await renderHook(() => useHydrateSession());
    expect(result.current.isComplete).toBe(true);
    expect(IFrameMessageService.showOverlay).toHaveBeenCalledWith();
  });

  it('should show the overlay when showUI is undefined', async () => {
    setup(false, true);
    const { result } = await renderHook(() => useHydrateSession());
    expect(result.current.isComplete).toBe(true);
    expect(IFrameMessageService.showOverlay).toHaveBeenCalledWith();
  });
});
