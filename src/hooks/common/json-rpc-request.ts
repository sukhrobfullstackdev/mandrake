import { RpcErrorCode } from '@constants/json-rpc';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { ApiWalletAtomicRpcPayloadService, AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ServerRpcError } from '@lib/common/custom-errors';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { resolveJsonRpcResponse } from '@lib/message-channel/resolve-json-rpc-response';
import { sdkReject } from '@lib/message-channel/sdk-reject';
import { analytics } from '@lib/services/analytics';
import { UserEventsOnReceived } from '@magic-sdk/types';
import { useEffect } from 'react';

type ConfigProps = {
  closedByUser: boolean;
};

export function useResolveActiveRpcRequest() {
  const { sdkMetaData } = useStore(state => state);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const analyticsProperties = getBaseAnalyticsProperties();
  const router = useSendRouter();

  return (result: object | string | number | boolean | unknown) => {
    resolveJsonRpcResponse({
      payload: activeRpcPayload,
      sdkMetadata: sdkMetaData || {},
      analyticsProperties,
      result,
    });
    IFrameMessageService.hideOverlay();
    router.replace('/send/idle');
  };
}

export function useRejectActiveRpcRequest() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const {
    magicApiKey,
    decodedQueryParams: { meta },
  } = useStore.getState();
  const router = useSendRouter();

  return (errorCode: string | number, errorMessage?: string, errorData?: object, config?: ConfigProps) => {
    if (config?.closedByUser && meta?.allowAllEvents) {
      return AtomicRpcPayloadService.emitJsonRpcEventResponse(UserEventsOnReceived.ClosedByUser);
    }
    sdkReject(activeRpcPayload, errorCode, errorMessage, errorData);
    IFrameMessageService.hideOverlay();
    analytics(magicApiKey).track('Rejected active RPC request', {
      jsonRpcMethod: activeRpcPayload?.method,
      errorCode,
      errorMessage,
      ...getBaseAnalyticsProperties(),
    });
    router.replace('/send/idle');
  };
}

export function useApiWalletRejectActiveRpcRequest() {
  const activeRpcPayload = ApiWalletAtomicRpcPayloadService.getActiveRpcPayload();

  const {
    magicApiKey,
    decodedQueryParams: { meta },
  } = useStore.getState();
  const router = useSendRouter();

  return (errorCode: string | number, errorMessage?: string, errorData?: object, config?: ConfigProps) => {
    if (config?.closedByUser && meta?.allowAllEvents) {
      ApiWalletAtomicRpcPayloadService.emitJsonRpcEventResponse(UserEventsOnReceived.ClosedByUser);
      return;
    }
    sdkReject(activeRpcPayload, errorCode, errorMessage, errorData);

    IFrameMessageService.hideOverlay();
    analytics(magicApiKey).track('Rejected active RPC request', {
      jsonRpcMethod: activeRpcPayload?.method,
      errorCode,
      errorMessage,
      ...getBaseAnalyticsProperties(),
    });
    router.replace('/api-wallet/idle');
  };
}

export function useApiWalletResolveActiveRpcRequest() {
  const { sdkMetaData } = useStore(state => state);
  const activeRpcPayload = ApiWalletAtomicRpcPayloadService.getActiveRpcPayload();
  const analyticsProperties = getBaseAnalyticsProperties();
  const router = useSendRouter();

  return (result: object | string | number | boolean | unknown) => {
    resolveJsonRpcResponse({
      payload: activeRpcPayload,
      sdkMetadata: sdkMetaData || {},
      analyticsProperties,
      result,
    });

    IFrameMessageService.hideOverlay();

    router.replace('/api-wallet/idle');
  };
}

export function useServerRejectActiveRpcRequest(error?: ServerRpcError | null) {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  useEffect(() => {
    if (!error) return;
    const message = Object.keys(RpcErrorCode)[Object.values(RpcErrorCode).indexOf(parseInt(error.message))];
    rejectActiveRpcRequest(parseInt(error.message), message);
    logger.error(message || `There was an unknown issue: ${error.message}`, { error });
  }, [error]);

  if (!error) return;
}
