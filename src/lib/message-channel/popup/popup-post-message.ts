import { resolveMessageType } from '@lib/message-channel/json-rpc-channel';
import { JsonRpcResponsePayload, MagicIncomingWindowMessage } from 'magic-passport/types';

/**
 * Wraps `window.opener.postMessage` with the parent context and automatically resolves
 * the origin-namespaced message type.
 */
export function popupPostMessage(msgType: MagicIncomingWindowMessage, response?: JsonRpcResponsePayload) {
  window.opener.postMessage({ msgType: resolveMessageType(msgType), response }, '*');
}
