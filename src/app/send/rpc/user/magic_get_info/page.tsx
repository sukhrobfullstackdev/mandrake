'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();

  const { userMetadata } = useUserMetadata(
    areWalletsCreated && isHydrateSessionComplete && !isHydrateSessionError,
    false,
  );

  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  useEffect(() => AtomicRpcPayloadService.handleVersionSkew(), []);

  // Hydrate or reject.
  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (isHydrateSessionError && isHydrateSessionComplete && activeRpcPayload) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [
    activeRpcPayload,
    hasResolvedOrRejected,
    isHydrateSessionError,
    isHydrateSessionComplete,
    rejectActiveRpcRequest,
  ]);

  // Resolve the user info.
  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (userMetadata && activeRpcPayload) {
      resolveActiveRpcRequest(userMetadata);
      setHasResolvedOrRejected(true);
    }
  }, [userMetadata, activeRpcPayload, resolveActiveRpcRequest, hasResolvedOrRejected]);

  useEffect(() => {
    if (walletCreationError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('magic_get_info Page - Wallet hydrating or creation error', walletCreationError);
    }
  }, [walletCreationError]);
}
