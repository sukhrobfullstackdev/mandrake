'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWebauthnRegisterDeviceQuery } from '@hooks/data/embedded/webauthn';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { isEmpty } from '@lib/utils/is-empty';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const authUserId = useStore(state => state.authUserId);
  const { mutateAsync: mutateWebauthRegisterDevice } = useWebauthnRegisterDeviceQuery();
  const [hasCalledWebauthnRegisterDevice, setHasCalledWebauthnRegisterDevice] = useState(false);

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  // Hydrate or reject
  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (isHydrateSessionError && isHydrateSessionComplete && activeRpcPayload) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [
    activeRpcPayload,
    hasResolvedOrRejected,
    isHydrateSessionError,
    isHydrateSessionComplete,
    rejectActiveRpcRequest,
  ]);

  useEffect(() => {
    if (hasResolvedOrRejected || hasCalledWebauthnRegisterDevice) return;
    if (!authUserId) return;
    const params = activeRpcPayload?.params[0];
    const registrationResponse = {
      attObj: params.registration_response.attObj,
      clientData: params.registration_response.clientData,
    };

    const transport = isEmpty(params.transport) ? 'unknown' : params.transport[0];
    setHasCalledWebauthnRegisterDevice(true);
    mutateWebauthRegisterDevice({
      authUserId,
      nickname: params.nickname,
      userAgent: params.user_agent,
      transport,
      registrationResponse,
    })
      .then(() => {
        AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
        resolveActiveRpcRequest(true);
        setHasResolvedOrRejected(true);
      })
      .catch(err => {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, err.message);
        setHasResolvedOrRejected(true);
      });
  }, [
    resolveActiveRpcRequest,
    rejectActiveRpcRequest,
    mutateWebauthRegisterDevice,
    hasCalledWebauthnRegisterDevice,
    hasResolvedOrRejected,
    authUserId,
    activeRpcPayload,
  ]);

  return null;
}
