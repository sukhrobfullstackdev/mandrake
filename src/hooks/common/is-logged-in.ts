import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHydrateSession } from './hydrate-session';
import { useResolveActiveRpcRequest } from './json-rpc-request';

export function useIsLoggedIn() {
  const pathname = usePathname();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  useEffect(() => {
    if (!activeRpcPayload || hasResolvedOrRejected) return;
    if (isHydrateSessionComplete) {
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(!isHydrateSessionError);
      setHasResolvedOrRejected(true);
    }
  }, [
    isHydrateSessionComplete,
    hasResolvedOrRejected,
    isHydrateSessionError,
    activeRpcPayload,
    resolveActiveRpcRequest,
  ]);

  return {};
}
