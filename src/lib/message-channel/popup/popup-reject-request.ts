import { MagicInternalErrorMessage } from '@constants/error';
import { BaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { resolvePopupJsonRpcResponse } from '@lib/message-channel/popup/popup-resolve-json-rpc-response';
import { DEFAULT_ERROR_CODE, DEFAULT_ERROR_MESSAGE } from '@lib/message-channel/sdk-reject';
import { sequentialPromise } from '@lib/utils/sequential-promise';
import { JsonRpcError, JsonRpcRequestPayload } from 'magic-passport/types';

export async function popupRejectJsonRpcRequest(
  payload: JsonRpcRequestPayload | Partial<JsonRpcRequestPayload> | JsonRpcRequestPayload[] | null,
  errorCode?: string | number,
  errorMessage?: string,
  errorData?: object,
  analyticsProperties?: BaseAnalyticsProperties,
) {
  if (!payload) {
    throw new Error(`popupRejectJsonRpcRequest: ${MagicInternalErrorMessage.NO_ACTIVE_RPC_PAYLOAD}`);
  }

  try {
    if (!Array.isArray(payload) && payload?.id) {
      resolvePopupJsonRpcResponse({
        payload: payload as JsonRpcRequestPayload,
        analyticsProperties: analyticsProperties || ({} as BaseAnalyticsProperties),
        error: {
          code: errorCode ?? DEFAULT_ERROR_CODE,
          message: errorMessage ?? DEFAULT_ERROR_MESSAGE,
          data: errorData ?? undefined,
        } as JsonRpcError,
      });
    } else if (Array.isArray(payload) && payload.length > 0) {
      const rejections = payload.map(
        p => () => popupRejectJsonRpcRequest(p, errorCode, errorMessage, errorData, analyticsProperties),
      );
      await sequentialPromise(rejections);
    }
  } catch (err) {
    logger.error('Error while executing popupRejectJsonRpcRequest: ', err);
  }
}
