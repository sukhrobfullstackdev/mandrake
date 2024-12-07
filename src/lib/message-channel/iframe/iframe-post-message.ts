import { MagicSdkIncomingWindowMessageType } from '@constants/window-messages';
import { resolveMessageType } from '@lib/message-channel/json-rpc-channel';
import { JsonRpcResponsePayload } from '@magic-sdk/types';

/**
 * Wraps `window.postMessage` with the parent context and automatically resolves
 * the origin-namespaced message type.
 */
export function iFramePostMessage(
  msgType: MagicSdkIncomingWindowMessageType,
  response?: JsonRpcResponsePayload,
  rt?: string,
  deviceShare?: string,
) {
  window.parent.postMessage({ msgType: resolveMessageType(msgType), response, rt, deviceShare }, '*');
  // TODO implement datadog tracking: timeToCompletion, logMessage, jsonRpcMethod, jsonRpcError
}
