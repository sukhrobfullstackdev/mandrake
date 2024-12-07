import { MagicSdkIncomingWindowMessage } from '@constants/window-messages';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';

import { LoginWithEmailOTPEventEmit, LoginWithEmailOTPEventOnReceived } from '@magic-sdk/types';

const inboundEventTypeA = LoginWithEmailOTPEventEmit.VerifyEmailOtp;
const inboundEventTypeB = LoginWithEmailOTPEventEmit.Cancel;
const eventArgsA = 'otp123';

const payloadA = {
  jsonrpc: '2.0',
  id: 1,
  method: 'method',
  params: [{ showUI: false }],
};
const payloadB = {
  jsonrpc: '',
  id: '2',
  method: 'method',
  params: [{ deviceCheckUI: false }],
};

const outboundEventType = LoginWithEmailOTPEventOnReceived.EmailOTPSent;

const payloadC = {
  jsonrpc: 'jsonrpc',
  id: '3',
  method: 'method',
  params: [{ showUI: true }],
};

const inboundEventA = { eventType: inboundEventTypeA, payloadId: payloadA.id, args: eventArgsA };
const inboundEventB = { eventType: inboundEventTypeB, payloadId: payloadA.id, args: undefined };

jest.mock('@lib/message-channel/iframe/iframe-post-message', () => ({
  iFramePostMessage: jest.fn(),
}));

describe('@lib/atomic-rpc-payload', () => {
  afterEach(() => {
    jest.clearAllMocks();
    AtomicRpcPayloadService.reset();
  });

  test('should fire event when payload with numeric id is set', () => {
    const handle = jest.fn();
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);
    // handle event
    AtomicRpcPayloadService.handleRequestEvent(inboundEventA);

    // expect on event to be fired with args
    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle.mock.calls[0][0]).toBe(eventArgsA);
  });

  test('should handle multiple events when they are received', () => {
    const handleA = jest.fn();
    const handleB = jest.fn();
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handleA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeB, handleB);
    // handle event
    AtomicRpcPayloadService.handleRequestEvent(inboundEventA);
    AtomicRpcPayloadService.handleRequestEvent(inboundEventB);

    // expect on event to be fired with args
    expect(handleA).toHaveBeenCalledTimes(1);
    expect(handleA.mock.calls[0][0]).toBe(eventArgsA);
    expect(handleB).toHaveBeenCalledTimes(1);
    expect(handleB.mock.calls[0][0]).toBe(undefined);
  });

  test('should remove all event listeners when active payload is updated', () => {
    const handle = jest.fn();

    // on event
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);
    AtomicRpcPayloadService.setActiveRpcPayload(payloadB);
    // handle event
    AtomicRpcPayloadService.handleRequestEvent(inboundEventA);
    // expect on event to be fired with args
    expect(handle).toHaveBeenCalledTimes(0);
  });

  test('should fire event once after payload is reset and re-added', () => {
    const handle = jest.fn();

    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);
    AtomicRpcPayloadService.reset();

    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);
    AtomicRpcPayloadService.handleRequestEvent(inboundEventA);
    // expect on event to be fired with args
    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle.mock.calls[0][0]).toBe(eventArgsA);
  });

  test('should not fire events when active payload is null', () => {
    const handle = jest.fn();

    AtomicRpcPayloadService.setActiveRpcPayload(null);
    // on event A
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);
    // handle event A
    AtomicRpcPayloadService.handleRequestEvent(inboundEventA);

    // expect on event to be fired with null
    expect(handle.mock.calls[0]).toBe(undefined);
    expect(handle).toHaveBeenCalledTimes(0);
  });

  test('should not fire events when active payload has showUI set to true', () => {
    const handle = jest.fn();

    AtomicRpcPayloadService.setActiveRpcPayload(payloadC);
    // on event A
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);
    // handle event A
    AtomicRpcPayloadService.handleRequestEvent(inboundEventA);

    // expect on event to be fired with null
    expect(handle.mock.calls[0]).toBe(undefined);
    expect(handle).toHaveBeenCalledTimes(0);
  });

  test('should correctly emit JSON RPC outbound events through message channel', () => {
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.emitJsonRpcEventResponse(outboundEventType, []);

    expect(iFramePostMessage).toHaveBeenCalledWith(MagicSdkIncomingWindowMessage.MAGIC_HANDLE_EVENT, {
      id: payloadA.id,
      jsonrpc: payloadA.jsonrpc,
      result: { event: outboundEventType, params: [] },
    });
  });

  test('should correctly emit JSON RPC outbound events through message channel with missing rpc', () => {
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.emitJsonRpcEventResponse(outboundEventType, []);

    expect(iFramePostMessage).toHaveBeenCalledWith(MagicSdkIncomingWindowMessage.MAGIC_HANDLE_EVENT, {
      id: payloadA.id,
      jsonrpc: '2.0',
      result: { event: outboundEventType, params: [] },
    });
  });

  test('should not handle event if payload and event id mismatches', () => {
    const handle = jest.fn();
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    AtomicRpcPayloadService.onEvent(inboundEventTypeA, handle);

    AtomicRpcPayloadService.handleRequestEvent(inboundEventB);

    // expect on event to be fired with null
    expect(handle.mock.calls[0]).toBe(undefined);
    expect(handle).toHaveBeenCalledTimes(0);
  });

  test('should correctly retrieve the current active rpc payload', () => {
    AtomicRpcPayloadService.setActiveRpcPayload(payloadA);
    const activePayload = AtomicRpcPayloadService.getActiveRpcPayload();
    expect(activePayload).toBe(payloadA);
  });

  test('should correctly enqueue and dequeue a next rpc request', () => {
    AtomicRpcPayloadService.enqueuePendingRpcRequest(payloadA);
    const activePayload = AtomicRpcPayloadService.getNextPendingRpcRequest();
    expect(activePayload).toBe(payloadA);
  });

  test('should set and retrieve navigation timing', () => {
    const route = '/test-route';

    AtomicRpcPayloadService.startPerformanceTimer(route);

    const timing = AtomicRpcPayloadService.getPerformanceTimer(route);

    expect(timing).toEqual({ startTime: 0 });
  });

  test('should remove navigation timing for a specific route', () => {
    const route = '/test-route';

    AtomicRpcPayloadService.startPerformanceTimer(route);
    AtomicRpcPayloadService.removePerformanceTimer(route);

    const timing = AtomicRpcPayloadService.getPerformanceTimer(route);
    expect(timing).toBeUndefined();
  });

  test('should not log if navigation timing for route does not exist', () => {
    const route = '/non-existent-route';
    const loggerSpy = jest.spyOn(global.console, 'info').mockImplementation(() => {});

    AtomicRpcPayloadService.logPagePerformanceMetrics(route);

    expect(loggerSpy).not.toHaveBeenCalled();
    loggerSpy.mockRestore();
  });
});
