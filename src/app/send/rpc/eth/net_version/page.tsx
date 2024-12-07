'use client';

import { NodeError, useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect, useState } from 'react';

export default function Page() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload(); // net version request
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { genericEthereumProxy } = useEthereumProxy();

  const doResolveNetversion = async () => {
    if (!activeRpcPayload) return;
    try {
      resolveActiveRpcRequest(await genericEthereumProxy(activeRpcPayload));
      setHasResolvedOrRejected(true);
    } catch (error) {
      rejectActiveRpcRequest((error as NodeError).code, (error as NodeError).message);
      setHasResolvedOrRejected(true);
    }
  };

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    doResolveNetversion();
  }, [activeRpcPayload, hasResolvedOrRejected]);

  return null;
}
