import { MagicSdkIncomingWindowMessageType } from '@constants/window-messages';
import { resolveApiWalletMessageType } from '@lib/message-channel/json-rpc-channel';
import { JsonRpcResponsePayload } from '@magic-sdk/types';

/**
 * Wraps `window.postMessage` with the parent context and automatically resolves
 * the origin-namespaced message type.
 */
// TODO: import JsonRpcResponsePayload from magic-tee-js
export function iFramePostMessage(msgType: MagicSdkIncomingWindowMessageType, response?: JsonRpcResponsePayload) {
  window.parent.postMessage({ msgType: resolveApiWalletMessageType(msgType), response }, '*');
  // TODO implement datadog tracking: timeToCompletion, logMessage, jsonRpcMethod, jsonRpcError
}
