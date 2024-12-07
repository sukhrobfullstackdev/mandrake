'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWebauthnReauthStartQuery } from '@hooks/data/embedded/webauthn';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { transformCredentialRequestOptions } from '@lib/utils/webauthn';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { mutateAsync: mutateWebauthReauthStart } = useWebauthnReauthStartQuery();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const [hasCalledReauthStart, setHasCalledReauthStart] = useState(false);

  useEffect(() => {
    if (hasCalledReauthStart) return;
    setHasCalledReauthStart(true);
    mutateWebauthReauthStart({ username: activeRpcPayload?.params[0]?.username })
      .then(res => {
        const result = transformCredentialRequestOptions(res.assertionOptions);
        AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
        resolveActiveRpcRequest(result);
      })
      .catch(err => {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, err.message ?? RpcErrorMessage.UserDeniedAccountAccess);
      });
  }, [
    hasCalledReauthStart,
    activeRpcPayload,
    mutateWebauthReauthStart,
    resolveActiveRpcRequest,
    rejectActiveRpcRequest,
  ]);
  return null;
}
