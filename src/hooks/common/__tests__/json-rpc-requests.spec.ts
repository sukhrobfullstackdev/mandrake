import { RpcErrorCode } from '@constants/json-rpc';
import { MagicSdkIncomingWindowMessage } from '@constants/window-messages';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ServerRpcError } from '@lib/common/custom-errors';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';
import { act, renderHook } from '@testing-library/react';
import {
  useRejectActiveRpcRequest,
  useResolveActiveRpcRequest,
  useServerRejectActiveRpcRequest,
} from '../json-rpc-request';

const routerReplaceSpy = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceSpy,
  }),
}));

jest.mock('@lib/message-channel/iframe/iframe-message-service', () => ({
  IFrameMessageService: {
    showOverlay: jest.fn(),
    hideOverlay: jest.fn(),
  },
}));

jest.mock('@lib/message-channel/iframe/iframe-post-message', () => ({
  iFramePostMessage: jest.fn(),
}));

function setup() {
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
    jest.clearAllMocks();
  });

  it('[empty pending request queue] should call resolveJsonRpcResponse, hide overlay and navigate to the idle route', () => {
    setup();
    const { result } = renderHook(() => useResolveActiveRpcRequest());
    const resolveActiveRpcRequest = result.current;
    act(() => {
      resolveActiveRpcRequest('result');
    });
    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: undefined, id: '1', jsonrpc: '2.0', result: 'result' },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });

  it('[empty pending request queue] should call resolveJsonRpcResponse with a boolean, hide overlay and navigate to the idle route', () => {
    setup();
    const { result } = renderHook(() => useResolveActiveRpcRequest());
    const resolveActiveRpcRequest = result.current;
    act(() => {
      resolveActiveRpcRequest(false);
    });

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: undefined, id: '1', jsonrpc: '2.0', result: false },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });

  it('[non-empty pending request queue] should call resolveJsonRpcResponse, hide overlay and route to send idle', () => {
    setupNonEmptyQueue();
    const { result } = renderHook(() => useResolveActiveRpcRequest());
    const resolveActiveRpcRequest = result.current;
    act(() => {
      resolveActiveRpcRequest('result');
    });

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: undefined, id: '1', jsonrpc: '2.0', result: 'result' },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });
});

describe('useRejectActiveRpcRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('[empty pending request queue] should call sdkReject, hide overlay and navigate to the idle route', () => {
    setup();
    const { result } = renderHook(() => useRejectActiveRpcRequest());
    const rejectActiveRpcRequest = result.current;

    act(() => {
      rejectActiveRpcRequest('errorCode', 'errorMessage', {});
    });

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: { code: 'errorCode', data: {}, message: 'errorMessage' }, id: '1', jsonrpc: '2.0', result: undefined },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });

  it('[non-empty pending request queue] should call sdkReject, hide overlay and route to send idle ', () => {
    setupNonEmptyQueue();
    const { result } = renderHook(() => useRejectActiveRpcRequest());
    const rejectActiveRpcRequest = result.current;

    act(() => {
      rejectActiveRpcRequest('errorCode', 'errorMessage', {});
    });

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      { error: { code: 'errorCode', data: {}, message: 'errorMessage' }, id: '1', jsonrpc: '2.0', result: undefined },
      undefined,
      undefined,
    );
    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
    expect(routerReplaceSpy).toHaveBeenCalledWith('/send/idle');
  });
});

describe('useServerRejectActiveRpcRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects with correct error', () => {
    setup();
    const error = new ServerRpcError(RpcErrorCode.InvalidRequest);
    renderHook(() => useServerRejectActiveRpcRequest(error));

    expect(iFramePostMessage).toHaveBeenCalledWith(
      MagicSdkIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
      {
        error: { code: -32600, data: undefined, message: 'InvalidRequest' },
        id: '1',
        jsonrpc: '2.0',
        result: undefined,
      },
      undefined,
      undefined,
    );

    expect(IFrameMessageService.hideOverlay).toHaveBeenCalledWith();
  });
});
