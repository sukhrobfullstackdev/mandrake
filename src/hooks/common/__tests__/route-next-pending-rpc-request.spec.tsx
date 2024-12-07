import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { act, renderHook } from '@testing-library/react';
import { useRouteNextPendingRpcRequest } from '../route-next-pending-rpc-request';

const routerReplaceSpy = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceSpy,
  }),
}));

function setupEmptyQueue() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: '1',
    params: [{ email: 'test@mgail.com' }],
  });
}

function setupNonEmptyQueue() {
  AtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: '1',
    params: [{ email: 'test@mgail.com' }],
  });
  AtomicRpcPayloadService.enqueuePendingRpcRequest({
    jsonrpc: '2.0',
    method: 'magic_auth_login_with_email_otp',
    id: '2',
    params: [{ email: 'test@mgail.com' }],
  });
}

describe('useResolveActiveRpcRequest', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/send' },
      writable: true,
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('[empty pending request queue] should not navigate from send idle', () => {
    setupEmptyQueue();
    const { result } = renderHook(() => useRouteNextPendingRpcRequest());
    const routeNextPendingRpcRequest = result.current;
    act(() => {
      routeNextPendingRpcRequest();
    });
    expect(routerReplaceSpy).not.toHaveBeenCalled();
  });

  it('[non empty pending request queue] should navigate to the next rpc method route', () => {
    setupNonEmptyQueue();
    const { result } = renderHook(() => useRouteNextPendingRpcRequest());
    const routeNextPendingRpcRequest = result.current;
    act(() => {
      routeNextPendingRpcRequest();
    });
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/rpc/auth/magic_auth_login_with_email_otp');
  });
});
