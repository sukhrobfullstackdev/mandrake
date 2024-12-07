import { validRoutes } from '@app/passport/rpc/routes';
import { MagicInternalErrorMessage } from '@constants/error';
import { usePassportStore } from '@hooks/data/passport/store';

import {
  AtomicPayloadServiceWithIntermediaryEventBus,
  EventParams,
  IntermediaryEventsWithStringFallback,
} from '@lib/atomic-rpc-payload/atomic-rpc-payload-with-intermediary-event';
import { popupPostMessage } from '@lib/message-channel/popup/popup-post-message';
import { JsonRpcResponsePayload, MagicIncomingWindowMessage } from 'magic-passport/types';

/**
 * Manages the dispatching and handling of intermediary events in a centralized event bus system.
 *
 * Events are handled only if
 *   * The current payload has either `showUI` or `deviceCheckUI` set to false.
 *   * The event's payload ID matches the active payload ID.
 *
 * This guarantees that events are processed exclusively in relation to the corresponding RPC payload request
 */
export class PayloadAtomicPayloadService extends AtomicPayloadServiceWithIntermediaryEventBus {
  protected eventOrigin = '';

  // Construct the RPC path based on the current active payload method
  // This can be optimized once JWT is abstracted from the input
  constructRpcPath(): string {
    const methodConfig = validRoutes[this.activeRpcPayload?.method ?? ''] ?? {};
    const method = this.activeRpcPayload?.method;

    const normalizedLocale = usePassportStore.getState().decodedQueryParams.locale?.replace('_', '-');
    let path = `/passport/rpc/${methodConfig.module}/${methodConfig.pathOverride ?? method}`;

    if (normalizedLocale) {
      path = `${path}?lang=${normalizedLocale}`;
    }

    return path;
  }

  /**
   * Emits an outbound JSON-RPC event response with a given event type.
   */
  emitJsonRpcEventResponse(eventType: IntermediaryEventsWithStringFallback, params?: EventParams[]) {
    if (!this.activeRpcPayload) {
      logger.error('emitJsonRpcEvent Error: No active RPC payload', eventType);
      throw new Error(`emitJsonRpcEvent: ${MagicInternalErrorMessage.NO_ACTIVE_RPC_PAYLOAD}`);
    }

    const result = { event: eventType, params };

    const response: JsonRpcResponsePayload = {
      jsonrpc: this.activeRpcPayload.jsonrpc ?? '2.0',
      id: this.activeRpcPayload.id,
      result,
    };

    popupPostMessage(MagicIncomingWindowMessage.MAGIC_HANDLE_EVENT, response);
    logger.info(
      `Emitted an intermediary event for active RPC request ${JSON.stringify(this.activeRpcPayload)} with result: ${JSON.stringify(result)}`,
    );
  }

  setEventOrigin(eventOrigin: string) {
    this.eventOrigin = eventOrigin;
  }

  getEventOrigin() {
    return this.eventOrigin;
  }
}
