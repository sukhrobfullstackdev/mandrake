'use client';

import { useResetAuthState } from '@hooks/common/auth-state';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserLogoutQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { useCallback, useEffect, useState } from 'react';

export default function DisconnectPage() {
  const { authUserId } = useStore(state => state);
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const { isError, isComplete } = useHydrateSession();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { resetAuthState } = useResetAuthState();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  /**
   * Regardless of the logout API result, we want to clear the user's
   * session on the client side and redirect to the send page
   */
  const handleLogout = useCallback(async () => {
    if (!activeRpcPayload || hasResolvedOrRejected) return;

    AtomicRpcPayloadService.emitJsonRpcEventResponse('disconnect');
    dispatchPhantomClearCacheKeys();
    await resetAuthState();
    resolveActiveRpcRequest(true);
    setHasResolvedOrRejected(true);
  }, [activeRpcPayload, hasResolvedOrRejected]);

  const { mutate: logout } = useUserLogoutQuery();

  useEffect(() => {
    if (!isComplete) return;

    if (isError || !authUserId) {
      handleLogout();
    } else {
      logout(
        { authUserId },
        {
          onSuccess: handleLogout,
          onError: handleLogout,
        },
      );
    }
  }, [isError, isComplete, authUserId, handleLogout]);

  return null;
}
