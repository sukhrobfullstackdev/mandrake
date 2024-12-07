import { MagicInternalErrorMessage } from '@constants/error';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { BaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';
import {
  JsonRpcError,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  MagicIncomingWindowMessage,
} from '@magic-sdk/types';
import { analytics } from '@services/analytics';
import { SDKError } from './sdk-reject';

const METHODS_WITH_RESULTS = ['reveal_page_login'];

export interface SdkMetadata {
  /**
   * An optional refresh token to be used for the request.
   */
  userSessionRefreshToken?: string;

  /**
   * A DPoP proof jwt that is required to use the optional refresh token
   * and as such is also optional.
   */
  webCryptoDpopJwt?: string;

  /**
   * For split key dkms, the device share is the Client Plaintext Share
   * encrypted with the Magic KMS, stored only on the user's device
   * If present, this saves a call to the Client KMS
   */
  deviceShare?: string;
}

/**
 * Dispatches a payload response event to the SDK. Payloads can only be
 * handled once. This is either a succesfully resolved response, or an error
 */
export function resolveJsonRpcResponse<T>(configuration: {
  payload: JsonRpcRequestPayload | null;
  sdkMetadata: SdkMetadata;
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
  const withResult = METHODS_WITH_RESULTS.includes(method)
    ? `with result: ${JSON.stringify(configuration.result)}`
    : '';

  // Calculate duration
  let duration = null;
  const startTime = AtomicRpcPayloadService.getPerformanceTimer(method)?.startTime;
  if (startTime) {
    duration = performance.now() - startTime;
  }

  if (hasResult) {
    logger.info(`Resolved active RPC request ${JSON.stringify({ id, jsonrpc, method })} ${withResult}`, {
      json_rpc_method: method,
      duration,
      isUIFlow: AtomicRpcPayloadService.getIsUIFlow(),
    });
    analytics(configuration?.analyticsProperties?.api_key).track('Resolved active RPC request', {
      jsonRpcMethod: method,
      ...configuration.analyticsProperties,
    });
  }

  if (hasError) {
    logger.info(
      `Rejected active RPC request ${JSON.stringify({ id, jsonrpc, method })} with errorCode: ${error?.code}, errorMessage: ${error?.message}, errorData: ${JSON.stringify(error?.data)}`,
      { json_rpc_method: method, duration },
    );
  }

  const response: JsonRpcResponsePayload = {
    jsonrpc: jsonrpc ?? '2.0',
    id: id ?? null,
    result: hasResult ? configuration.result : undefined,
    error: hasError ? error : undefined,
  };

  iFramePostMessage(
    MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,
    response,
    configuration?.sdkMetadata?.userSessionRefreshToken,
    configuration?.sdkMetadata?.deviceShare,
  );

  // If activePayload is an array, do an unshift. otherwise wipe it.
  // NOTE: This might not work depending on how Batch payloads are rejected.
  // store.dispatch(resetActivePayload());
}
