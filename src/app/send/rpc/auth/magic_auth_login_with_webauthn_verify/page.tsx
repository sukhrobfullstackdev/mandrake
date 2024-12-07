'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWebauthnReauthVerifyQuery } from '@hooks/data/embedded/webauthn';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { mutateAsync: mutateWebauthReauthVerify } = useWebauthnReauthVerifyQuery();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { hydrateAndPersistAuthState } = useSetAuthState();

  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: !walletCreationError && areWalletsCreated,
  });

  const [hasCalledReauthVerify, setHasCalledReauthVerify] = useState(false);
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const doReauthVerify = async () => {
    if (!activeRpcPayload || !activeRpcPayload.params[0]) {
      return rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.InvalidParams);
    }
    try {
      const { username, assertion_response: assertionResponse } = activeRpcPayload.params[0];
      setHasCalledReauthVerify(true);
      const res = await mutateWebauthReauthVerify({ username, assertionResponse });
      await hydrateAndPersistAuthState({
        authUserId: res.authUserId,
        authUserSessionToken: res.authUserSessionToken,
      });
    } catch (err) {
      rejectActiveRpcRequest(
        RpcErrorCode.InternalError,
        (err as ApiResponseError).message ?? RpcErrorMessage.UserDeniedAccountAccess,
      );
    }
  };

  useEffect(() => {
    if (hasCalledReauthVerify) return;
    doReauthVerify();
  }, [hasCalledReauthVerify]);

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (didToken) {
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(didToken);
      setHasResolvedOrRejected(true);
    }
  }, [didToken, hasResolvedOrRejected, resolveActiveRpcRequest]);

  useEffect(() => {
    const error = walletCreationError || didTokenError;
    if (error) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('magic_auth_login_with_webauthn_verify Page - Wallet hydrating or creation error', error);
    }
  }, [walletCreationError, didTokenError]);

  return null;
}
