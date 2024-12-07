'use client';

import { NodeError } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import Web3Service from '@utils/web3-services/web3-service';
import { useEffect, useState } from 'react';

export default function Page() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const doPersonalEcRecover = async () => {
    try {
      const [message, signature] = activeRpcPayload?.params as [string, string];
      const address = await Web3Service.verifyMessage(message, signature);
      const checksumAddress = await Web3Service.toChecksumAddress(address);
      resolveActiveRpcRequest(checksumAddress);
      setHasResolvedOrRejected(true);
    } catch (error) {
      rejectActiveRpcRequest((error as NodeError).code, (error as NodeError).message);
      setHasResolvedOrRejected(true);
    }
  };

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    doPersonalEcRecover();
  }, [activeRpcPayload, hasResolvedOrRejected]);

  return null;
}
