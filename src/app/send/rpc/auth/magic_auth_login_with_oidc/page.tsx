'use client';
import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useOidcLoginQuery } from '@hooks/data/embedded/oidc-login';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LoginWithOIDCParams {
  jwt: string;
  providerId: string;
}

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const [hasCompletedOidcLogin, setHasCompletedOidcLogin] = useState(false);

  const sdkMetaData = useStore(state => state.sdkMetaData);

  const { didToken, error: didError } = useCreateDidTokenForUser({
    enabled: !walletCreationError && areWalletsCreated && hasCompletedOidcLogin,
    lifespan: activeRpcPayload?.params[0]?.lifespan || DEFAULT_TOKEN_LIFESPAN,
  });
  const { mutateAsync: mutateOidcLoginAsync } = useOidcLoginQuery();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  useEffect(() => {
    if (!activeRpcPayload || !activeRpcPayload.params) return;
    const { jwt: oidcJwtFromParams, providerId } = activeRpcPayload.params[0] as unknown as LoginWithOIDCParams;
    if (!oidcJwtFromParams || !providerId) {
      return rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.InvalidJwtOrProviderId);
    }

    const doOidcLogin = async () => {
      try {
        // Dispatch a request to phantom to clear the global Cache
        dispatchPhantomClearCacheKeys();
        const response = await mutateOidcLoginAsync({
          token: oidcJwtFromParams,
          providerId: providerId,
          webCryptoDpopJwt: sdkMetaData?.webCryptoDpopJwt,
        });
        const { authUserId, authUserSessionToken, refreshToken } = response;
        await hydrateAndPersistAuthState({
          authUserId,
          authUserSessionToken,
          refreshToken,
        });
        setHasCompletedOidcLogin(true);
      } catch (error: unknown) {
        rejectActiveRpcRequest(
          RpcErrorCode.InternalError,
          (error as Error).message ?? RpcErrorMessage.UserDeniedAccountAccess,
        );
        setHasResolvedOrRejected(true);
      }
    };

    if (activeRpcPayload && oidcJwtFromParams && providerId && !hasResolvedOrRejected) {
      doOidcLogin();
    }
  }, [activeRpcPayload]);

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (walletCreationError || didError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      logger.error(
        'magic_auth_login_with_oidc Page - Wallet hydrating or creation error',
        walletCreationError || didError,
      );
      setHasResolvedOrRejected(true);
    }
    if (didToken && activeRpcPayload && hasCompletedOidcLogin) {
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(didToken);
      setHasResolvedOrRejected(true);
    }
  }, [
    didToken,
    activeRpcPayload,
    resolveActiveRpcRequest,
    hasResolvedOrRejected,
    hasCompletedOidcLogin,
    walletCreationError,
    didError,
  ]);

  return <div />;
}
