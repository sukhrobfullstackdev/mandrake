import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { ApiWalletAtomicRpcPayloadService, AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

export function useRouteNextPendingRpcRequest() {
  const router = useSendRouter();
  return () => {
    const nextRpcPayload = AtomicRpcPayloadService.getNextPendingRpcRequest();
    AtomicRpcPayloadService.setActiveRpcPayload(nextRpcPayload);
    if (!nextRpcPayload) return;
    // Similar to what we do in router.ts but with a different router.
    // Also we can be sure that this is a mandrake route because we've already checked in router.ts.
    const path = AtomicRpcPayloadService.constructRpcPath(useStore.getState().sdkMetaData?.webCryptoDpopJwt);
    router.replace(path);
  };
}

export function useApiWalletRouteNextPendingRpcRequest() {
  const router = useSendRouter();
  return () => {
    const nextRpcPayload = ApiWalletAtomicRpcPayloadService.getNextPendingRpcRequest();
    ApiWalletAtomicRpcPayloadService.setActiveRpcPayload(nextRpcPayload);
    if (!nextRpcPayload) return;
    // Similar to what we do in router.ts but with a different router.
    // Also we can be sure that this is a mandrake route because we've already checked in router.ts.
    const path = ApiWalletAtomicRpcPayloadService.constructRpcPath(useStore.getState().sdkMetaData?.webCryptoDpopJwt);
    router.replace(path);
  };
}
