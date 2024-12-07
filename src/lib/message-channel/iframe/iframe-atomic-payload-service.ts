import { validRoutes } from '@app/send/rpc/routes';
import { MagicInternalErrorMessage } from '@constants/error';
import { useStore } from '@hooks/store';
import {
  AtomicPayloadServiceWithIntermediaryEventBus,
  EventParams,
  IntermediaryEventsWithStringFallback,
} from '@lib/atomic-rpc-payload/atomic-rpc-payload-with-intermediary-event';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';
import { JsonRpcResponsePayload, MagicIncomingWindowMessage } from '@magic-sdk/types';
import qs from 'qs';

/**
 * Manages the dispatching and handling of intermediary events in a centralized event bus system.
 *
 * Events are handled only if
 *   * The current payload has either `showUI` or `deviceCheckUI` set to false.
 *   * The event's payload ID matches the active payload ID.
 *
 * This guarantees that events are processed exclusively in relation to the corresponding RPC payload request
 */
export class IframeAtomicPayloadService extends AtomicPayloadServiceWithIntermediaryEventBus {
  // If both activeRpcPayload and encodedQueryParams are not set, it means there is a version skew.
  handleVersionSkew() {
    if (!this.activeRpcPayload && !this.encodedQueryParams) {
      localStorage.setItem('isReloaded', 'true');
      logger.info('Version skew detected, redirecting to /send with encoded query params.');

      window.location.href = `${window.location.origin}/send?params=${localStorage.getItem('encodedQueryParams')}`;
    }
  }

  // Construct the RPC path based on the current active payload method
  // This can be optimized once JWT is abstracted from the input
  constructRpcPath(jwt?: string): string {
    const methodConfig = validRoutes[this.activeRpcPayload?.method ?? ''] ?? {};
    const method = this.activeRpcPayload?.method;

    const normalizedLocale = useStore.getState().decodedQueryParams.locale?.replace('_', '-');
    let path = `/send/rpc/${methodConfig.module}/${methodConfig.pathOverride ?? method}`;

    if (normalizedLocale) {
      path = `${path}?lang=${normalizedLocale}`;
    }

    /** if RPC route will be going through a server component, lets give some
     * basic state for the server to use
     */
    if (methodConfig.isServerRoute) {
      path = `${path}${normalizedLocale ? '&' : '?'}${qs.stringify({
        activeRpcPayload: this.activeRpcPayload,
        encodedQueryParams: this.encodedQueryParams,
        webCryptoDpopJwt: jwt,
      })}`;
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

    iFramePostMessage(MagicIncomingWindowMessage.MAGIC_HANDLE_EVENT, response);
    logger.info(
      `Emitted an intermediary event for active RPC request ${JSON.stringify(this.activeRpcPayload)} with result: ${JSON.stringify(result)}`,
    );
  }
}
