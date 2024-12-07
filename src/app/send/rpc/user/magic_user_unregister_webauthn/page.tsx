'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUnregisterWebauthnQuery } from '@hooks/data/embedded/webauthn';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect, useState } from 'react';

export default function Page() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { authUserId } = useStore(state => state);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { mutateAsync: unregisterWebauthnMutation } = useUnregisterWebauthnQuery();

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (isHydrateSessionError && isHydrateSessionComplete && activeRpcPayload) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionError, isHydrateSessionComplete]);

  useEffect(() => {
    const doUnregisterWebauthn = async () => {
      try {
        if (!activeRpcPayload) return;
        const { webAuthnCredentialsId } = activeRpcPayload.params[0];
        await unregisterWebauthnMutation({ authUserId: authUserId || '', webauthnId: webAuthnCredentialsId || '' });
        resolveActiveRpcRequest(true);
      } catch (err) {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UnableToFindWebauthnDevice);
      }
      setHasResolvedOrRejected(true);
    };
    if (hasResolvedOrRejected) return;
    doUnregisterWebauthn();
  }, [authUserId, hasResolvedOrRejected, activeRpcPayload]);

  return <div />;
}
