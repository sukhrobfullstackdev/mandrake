'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWebauthnRegisterDeviceStartQuery } from '@hooks/data/embedded/webauthn';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { transformCredentialCreateOptions } from '@lib/utils/webauthn';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const authUserId = useStore(state => state.authUserId);
  const { mutateAsync: mutateWebauthRegisterDeviceStart } = useWebauthnRegisterDeviceStartQuery();
  const [hasCalledWebauthnRegisterDeviceStart, setHasCalledWebauthnRegisterDeviceStart] = useState(false);

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
    if (hasResolvedOrRejected || hasCalledWebauthnRegisterDeviceStart) return;
    if (!authUserId) return;
    setHasCalledWebauthnRegisterDeviceStart(true);
    mutateWebauthRegisterDeviceStart({ authUserId })
      .then(res => {
        AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
        const credentialOptions = transformCredentialCreateOptions(res.credentialOptions);
        resolveActiveRpcRequest({ credential_options: credentialOptions });
        setHasResolvedOrRejected(true);
      })
      .catch(err => {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, err.message);
        setHasResolvedOrRejected(true);
      });
  }, [
    resolveActiveRpcRequest,
    rejectActiveRpcRequest,
    hasResolvedOrRejected,
    hasCalledWebauthnRegisterDeviceStart,
    authUserId,
    mutateWebauthRegisterDeviceStart,
  ]);

  return null;
}
