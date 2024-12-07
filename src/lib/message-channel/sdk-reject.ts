import { MagicInternalErrorMessage } from '@constants/error';
import { useStore } from '@hooks/store';
import { BaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { sequentialPromise } from '@lib/utils/sequential-promise';
import { JsonRpcError, JsonRpcRequestPayload } from '@magic-sdk/types';
import { resolveJsonRpcResponse } from './resolve-json-rpc-response';

export const DEFAULT_ERROR_CODE = -32603;
export const DEFAULT_ERROR_MESSAGE = 'Internal error';

export class SDKError extends Error {
  public readonly jsonRpcError: JsonRpcError;

  public readonly code: string | number | null = null;

  constructor(jsonRpcError: Partial<JsonRpcError>) {
    super();

    this.jsonRpcError = {
      code: jsonRpcError.code ?? DEFAULT_ERROR_CODE,
      message: jsonRpcError.message ?? DEFAULT_ERROR_MESSAGE,
      data: jsonRpcError.data ?? undefined,
    };

    this.code = this.jsonRpcError.code;
    this.message = this.jsonRpcError.message;
    Object.setPrototypeOf(this, SDKError.prototype);
  }
}

export async function sdkReject(
  payload: JsonRpcRequestPayload | Partial<JsonRpcRequestPayload> | JsonRpcRequestPayload[] | null,
  errorCode?: string | number,
  errorMessage?: string,
  errorData?: object,
  analyticsProperties?: BaseAnalyticsProperties,
) {
  if (!payload) {
    throw new Error(`sdkReject: ${MagicInternalErrorMessage.NO_ACTIVE_RPC_PAYLOAD}`);
  }

  try {
    if (!Array.isArray(payload) && payload?.id) {
      resolveJsonRpcResponse({
        payload: payload as JsonRpcRequestPayload,
        sdkMetadata: useStore.getState().sdkMetaData || {},
        analyticsProperties: analyticsProperties || ({} as BaseAnalyticsProperties),
        error: {
          code: errorCode ?? DEFAULT_ERROR_CODE,
          message: errorMessage ?? DEFAULT_ERROR_MESSAGE,
          data: errorData ?? undefined,
        } as JsonRpcError,
      });
    } else if (Array.isArray(payload) && payload.length > 0) {
      const rejections = payload.map(p => () => sdkReject(p, errorCode, errorMessage, errorData, analyticsProperties));
      await sequentialPromise(rejections);
    }
  } catch (err) {
    logger.error('Error while executing sdk reject: ', err);
  }
}
