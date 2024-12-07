/* istanbul ignore file */
import { Queue } from '@lib/atomic-rpc-payload/queue';
import { IntermediaryEvents, JsonRpcRequestPayload, UiEventsEmit } from '@magic-sdk/types';

export type EventParams = unknown | object;

type IntermediaryEventPayload = {
  payloadId: number | string;
  eventType: IntermediaryEvents;
  args: EventParams;
};

export type IntermediaryEventsWithStringFallback = IntermediaryEvents | string;

/**
 * Manages the dispatching and andling of intermediary events in a centralized event bus system.
 *
 * Events are handled only if
 *   * The current payload has either `showUI` or `deviceCheckUI` set to false.
 *   * The event's payload ID matches the active payload ID.
 *
 * This guarantees that events are processed exclusively in relation to the corresponding RPC payload request
 */
export abstract class AtomicPayloadServiceWithIntermediaryEventBus {
  // Event name -> List of handlers
  protected eventBus = new Map<IntermediaryEventsWithStringFallback, (args: EventParams) => void>();

  // Only one active Payload at a time.
  protected activeRpcPayload: JsonRpcRequestPayload | null = null;

  protected pendingRpcRequestQueue: Queue<JsonRpcRequestPayload> = new Queue();

  // Encoded query params for the current active payload.
  // This is only to be used for passing query params to the iframe.
  // If you need decoded query params, you can access it from the state.
  protected encodedQueryParams: string = '';

  // Performance related
  private performanceTimer: Map<string, { startTime: number }> = new Map();

  protected isUIFlow: boolean = false;

  setActiveRpcPayload(payload: JsonRpcRequestPayload | null) {
    this.reset();
    this.activeRpcPayload = payload;
    if (payload) {
      localStorage.setItem('activeRpcPayload', JSON.stringify(payload));
    } else {
      localStorage.removeItem('activeRpcPayload');
    }
  }

  getActiveRpcPayload() {
    return this.activeRpcPayload;
  }

  getNextPendingRpcRequest() {
    return this.pendingRpcRequestQueue.dequeue();
  }

  enqueuePendingRpcRequest(payload: JsonRpcRequestPayload) {
    this.pendingRpcRequestQueue.enqueue(payload);
  }

  getEncodedQueryParams() {
    return this.encodedQueryParams;
  }

  setEncodedQueryParams(encodedQueryParams: string) {
    this.encodedQueryParams = encodedQueryParams;
    localStorage.setItem('encodedQueryParams', encodedQueryParams);
  }

  // Construct the RPC path based on the current active payload method
  // This can be optimized once JWT is abstracted from the input
  abstract constructRpcPath(jwt?: string): string;

  /**
   * Registers an event handler for a given event type.
   */
  onEvent(eventType: IntermediaryEventsWithStringFallback, handler: (arg: EventParams) => void) {
    if (eventType !== UiEventsEmit.CloseMagicWindow && !this.activeRpcPayload) {
      //silently exit if no active rpc payload except the close magic window event
      return;
    }

    this.eventBus.set(eventType, handler);
  }

  // Remove data from map
  reset() {
    this.isUIFlow = false;
    this.activeRpcPayload = null;
    this.eventBus.clear();
  }

  /**
   * Handles inbound event requests by dispatching them to the appropriate handler based on the event type.
   * Silently exits if the event's payload ID does not match the active payload ID or if there is no active payload.
   */
  handleRequestEvent(eventPayload: IntermediaryEventPayload) {
    // if not active payload or event id doesn't match active payload id, silently exit
    if (
      (!this.activeRpcPayload || eventPayload.payloadId !== this.activeRpcPayload.id) &&
      eventPayload.eventType !== UiEventsEmit.CloseMagicWindow
    ) {
      return;
    }
    const handler = this.eventBus.get(eventPayload.eventType);
    if (handler) handler(eventPayload.args);
  }

  /**
   * Emits an outbound JSON-RPC event response with a given event type.
   */
  abstract emitJsonRpcEventResponse(eventType: IntermediaryEventsWithStringFallback, params?: EventParams[]): void;

  /**
   * Performance related
   * The route here can either refer to an RPC method, indicating a full flow, or a page route, which focuses on in-page performance.
   */
  startPerformanceTimer(route: string) {
    const time = performance.now();
    this.performanceTimer.set(route, { startTime: time });
  }

  getPerformanceTimer(route: string) {
    return this.performanceTimer.get(route);
  }

  removePerformanceTimer(route: string) {
    this.performanceTimer.delete(route);
  }

  logPagePerformanceMetrics(route: string) {
    const performanceTimer = this.performanceTimer.get(route);

    if (performanceTimer) {
      const endTime = performance.now();
      const duration = Math.round(endTime - performanceTimer.startTime);

      logger.info(`Analytics: Page load to interaction duration for ${route} is ${duration}ms`, {
        duration,
        route,
        isUIFlow: this.isUIFlow,
      });

      this.performanceTimer.delete(route);
    }
  }

  setIsUIFlow(isUIFlow: boolean) {
    this.isUIFlow = isUIFlow;
  }

  getIsUIFlow() {
    return this.isUIFlow;
  }
}
