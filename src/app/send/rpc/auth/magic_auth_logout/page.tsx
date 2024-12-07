'use client';

import { useResetAuthState } from '@hooks/common/auth-state';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserLogoutQuery } from '@hooks/data/embedded/user';

import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { usePathname, useSearchParams } from 'next/navigation';

import { useEffect, useState } from 'react';

export default function LogoutPage() {
  const pathname = usePathname();
  const { authUserId } = useStore(state => state);
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const { isComplete } = useHydrateSession();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { resetAuthState } = useResetAuthState();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const searchParams = useSearchParams();
  const resolveValue = searchParams.get('sdkResult');
  /**
   * Regardless of the logout API result, we want to clear the user's
   * session on the client side and redirect to the send page
   */
  const handleLogout = async () => {
    if (!activeRpcPayload || hasResolvedOrRejected) return;
    AtomicRpcPayloadService.emitJsonRpcEventResponse('disconnect');
    dispatchPhantomClearCacheKeys();
    await resetAuthState();

    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

    // Always expecting sdkResult to be an object if value is passed in, can extend if needed
    try {
      resolveActiveRpcRequest(resolveValue ? JSON.parse(decodeURIComponent(resolveValue)) : true);
    } catch (error) {
      resolveActiveRpcRequest(true);
    }
    setHasResolvedOrRejected(true);
  };

  const { mutate: mutateUserLogout } = useUserLogoutQuery();

  useEffect(() => {
    if (!isComplete) return;

    if (authUserId) {
      mutateUserLogout(
        { authUserId },
        {
          onSuccess: () => {
            handleLogout();
          },
          onError: () => {
            handleLogout();
          },
        },
      );
    } else {
      handleLogout();
    }
  }, [isComplete, authUserId]);

  return null;
}
