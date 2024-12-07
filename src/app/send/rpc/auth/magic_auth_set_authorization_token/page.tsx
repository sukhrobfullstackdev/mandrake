'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type CustomAuthParams = { jwt: string };

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  useEffect(() => {
    if (!activeRpcPayload || !activeRpcPayload.params) return;

    const { jwt } = activeRpcPayload.params[0] as CustomAuthParams;
    if (!jwt) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MissingJWT);
      return;
    }

    useStore.setState({ customAuthorizationToken: jwt });
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
    resolveActiveRpcRequest(true);
  }, [activeRpcPayload]);

  return null;
}
