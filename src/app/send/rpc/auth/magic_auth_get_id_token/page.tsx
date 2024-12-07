'use client';
import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: !walletCreationError && isHydrateSessionComplete && areWalletsCreated,
    lifespan: activeRpcPayload?.params ? (activeRpcPayload?.params[0]?.lifespan as number) : DEFAULT_TOKEN_LIFESPAN,
  });

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

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (didToken && activeRpcPayload) {
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(didToken);
      setHasResolvedOrRejected(true);
    }
  }, [didToken, activeRpcPayload, resolveActiveRpcRequest, hasResolvedOrRejected]);

  useEffect(() => {
    const error = walletCreationError || didTokenError;
    if (error) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('magic_auth_login_with_oidc Page - Wallet hydrating or creation error', error);
    }
  }, [walletCreationError, didTokenError]);

  return <div />;
}
