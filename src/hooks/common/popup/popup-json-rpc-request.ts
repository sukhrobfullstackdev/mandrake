import { usePassportStore } from '@hooks/data/passport/store';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { popupRejectJsonRpcRequest } from '@lib/message-channel/popup/popup-reject-request';
import { resolvePopupJsonRpcResponse } from '@lib/message-channel/popup/popup-resolve-json-rpc-response';
import { analytics } from '@lib/services/analytics';

export function resolvePopupRequest(result: object | string | number | boolean | unknown, shouldCloseWindow = true) {
  const activeRpcPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  const analyticsProperties = getBaseAnalyticsProperties();

  resolvePopupJsonRpcResponse({ payload: activeRpcPayload, analyticsProperties, result });

  if (shouldCloseWindow) window.close();
}

export function rejectPopupRequest(
  errorCode: string | number,
  errorMessage?: string,
  errorData?: object,
  shouldCloseWindow = true,
) {
  const activeRpcPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  const { magicApiKey } = usePassportStore.getState();
  popupRejectJsonRpcRequest(activeRpcPayload, errorCode, errorMessage, errorData);
  analytics(magicApiKey).track('Rejected active RPC request', {
    jsonRpcMethod: activeRpcPayload?.method,
    errorCode,
    errorMessage,
    ...getBaseAnalyticsProperties(),
  });
  if (shouldCloseWindow) window.close();
}
