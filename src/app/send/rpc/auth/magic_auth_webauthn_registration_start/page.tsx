'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWebauthnRegistrationStartQuery } from '@hooks/data/embedded/webauthn';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { transformCredentialCreateOptions } from '@lib/utils/webauthn';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { mutateAsync: mutateWebauthRegistrationStart } = useWebauthnRegistrationStartQuery();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const [hasCalledWebauthnRegistrationStart, setHasCalledWebauthnRegistrationStart] = useState(false);

  const doWebAuthnRegistrationStart = async () => {
    setHasCalledWebauthnRegistrationStart(true);
    try {
      const res = await mutateWebauthRegistrationStart({ username: activeRpcPayload?.params[0]?.username });
      const credentialOptions = transformCredentialCreateOptions(res.credentialOptions);
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest({
        id: res.webauthnUserId,
        credential_options: credentialOptions,
      });
    } catch (err) {
      rejectActiveRpcRequest(
        RpcErrorCode.InternalError,
        (err as ApiResponseError).message ?? RpcErrorMessage.UserDeniedAccountAccess,
      );
    }
  };

  useEffect(() => {
    if (hasCalledWebauthnRegistrationStart) return;
    doWebAuthnRegistrationStart();
  }, [hasCalledWebauthnRegistrationStart]);
  return null;
}
