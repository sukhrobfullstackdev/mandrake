import { MagicInternalErrorMessage } from '@constants/error';
import { BaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { popupPostMessage } from '@lib/message-channel/popup/popup-post-message';
import { SDKError } from '@lib/message-channel/sdk-reject';
import { analytics } from '@services/analytics';
import {
  JsonRpcError,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  MagicIncomingWindowMessage,
} from 'magic-passport/types';

/**
 * Dispatches a payload response event to the SDK. Payloads can only be
 * handled once. This is either a succesfully resolved response, or an error
 */
export function resolvePopupJsonRpcResponse<T>(configuration: {
  payload: JsonRpcRequestPayload | null;
  analyticsProperties: BaseAnalyticsProperties;
  error?: JsonRpcError | SDKError;
  result?: T;
}) {
  const { payload } = configuration;
  if (!payload) {
    throw new Error(`resolveJsonRpcResponse: ${MagicInternalErrorMessage.NO_ACTIVE_RPC_PAYLOAD}`);
  }

  const { id, jsonrpc, method } = payload;

  const error =
    configuration.error instanceof SDKError ? configuration.error.jsonRpcError : (configuration.error ?? undefined);

  const hasError = Boolean(error);
  const hasResult = configuration.result !== undefined && !hasError;

  if (hasResult) {
    logger.info(`Resolved active RPC request ${JSON.stringify({ id, jsonrpc, method })}`, {
      json_rpc_method: method,
    });
    analytics(configuration?.analyticsProperties?.api_key).track('Resolved active RPC request', {
      jsonRpcMethod: method,
      ...configuration.analyticsProperties,
    });
  }

  if (hasError) {
    logger.info(
      `Rejected active RPC request ${JSON.stringify({ id, jsonrpc, method })} with errorCode: ${error?.code}, errorMessage: ${error?.message}, errorData: ${JSON.stringify(error?.data)}`,
      { json_rpc_method: method },
    );
  }

  const response: JsonRpcResponsePayload = {
    jsonrpc: jsonrpc ?? '2.0',
    id: id ?? null,
    result: hasResult ? configuration.result : undefined,
    error: hasError ? error : undefined,
  };

  popupPostMessage(MagicIncomingWindowMessage.POPUP_RPC_REQUEST_RESOLVE, response);
}
