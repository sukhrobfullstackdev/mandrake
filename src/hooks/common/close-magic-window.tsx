import { useEffect } from 'react';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { UiEventsEmit } from '@magic-sdk/types';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { METHODS_TO_RESOLVE_WITH_TRUE } from '@constants/route-methods';

export const useCloseMagicWindowListener = () => {
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  useEffect(() => {
    AtomicRpcPayloadService.onEvent(UiEventsEmit.CloseMagicWindow, () => {
      if (METHODS_TO_RESOLVE_WITH_TRUE.includes(activeRpcPayload?.method as string)) {
        return resolveActiveRpcRequest(true);
      }
      return rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
    });
  }, []);
};
