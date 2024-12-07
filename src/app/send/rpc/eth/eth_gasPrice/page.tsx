'use client';

import { NodeError, useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect, useState } from 'react';

export default function Page() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { getGasPrice } = useEthereumProxy();

  const doResolveChainId = async () => {
    try {
      resolveActiveRpcRequest(await getGasPrice());
      setHasResolvedOrRejected(true);
    } catch (error) {
      rejectActiveRpcRequest((error as NodeError).code, (error as NodeError).message);
      setHasResolvedOrRejected(true);
    }
  };

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    doResolveChainId();
  }, [activeRpcPayload, hasResolvedOrRejected]);

  return null;
}
