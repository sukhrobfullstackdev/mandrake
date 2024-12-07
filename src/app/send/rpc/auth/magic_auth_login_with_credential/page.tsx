'use client';
import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useRedirectLoginQuery } from '@hooks/data/embedded/redirect-login';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { usePathname } from 'next/navigation';
import qs from 'qs';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const [credential, setCredential] = useState('' as string | undefined);

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const sdkMetaData = useStore(state => state.sdkMetaData);

  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { hydrateAndPersistAuthState } = useSetAuthState();

  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: !walletCreationError && isHydrateSessionComplete && areWalletsCreated,
    lifespan: activeRpcPayload?.params[0]?.lifespan || DEFAULT_TOKEN_LIFESPAN,
  });
  const { mutateAsync: mutateRedirectLoginAsync } = useRedirectLoginQuery();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  useEffect(() => {
    if (!activeRpcPayload || !activeRpcPayload.params) return;
    const credentialOrQuery = (activeRpcPayload.params[0] as unknown as string) ?? '';
    if (!credentialOrQuery) return;
    try {
      const maybeCredential = qs.parse(credentialOrQuery.slice(1)).magic_credential as string | undefined;
      setCredential(maybeCredential ?? (credentialOrQuery as string | undefined) ?? '');
    } catch {
      setCredential(credentialOrQuery ?? '');
    }
  }, []);

  useEffect(() => {
    const handleRedirectLoginAsync = async () => {
      try {
        const response = await mutateRedirectLoginAsync({
          magicCredential: credential,
          jwt: sdkMetaData?.webCryptoDpopJwt,
        });
        const { authUserId, authUserSessionToken, email, refreshToken } = response;
        await hydrateAndPersistAuthState({
          email,
          authUserId,
          authUserSessionToken,
          refreshToken,
        });
      } catch (error: unknown) {
        rejectActiveRpcRequest(
          RpcErrorCode.InternalError,
          (error as Error).message ?? RpcErrorMessage.UserDeniedAccountAccess,
        );
        setHasResolvedOrRejected(true);
      }
    };
    if (isHydrateSessionError && isHydrateSessionComplete && credential && sdkMetaData) {
      handleRedirectLoginAsync();
    }
  }, [credential, sdkMetaData?.webCryptoDpopJwt, isHydrateSessionError, isHydrateSessionComplete]);

  useEffect(() => {
    if (didToken && activeRpcPayload && !hasResolvedOrRejected) {
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(didToken);
      setHasResolvedOrRejected(true);
    }
  }, [didToken, activeRpcPayload, hasResolvedOrRejected]);

  useEffect(() => {
    const error = walletCreationError || didTokenError;
    if (error) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('magic_auth_login_with_credentials Page - Wallet hydrating or creation error', error);
    }
  }, [walletCreationError, didTokenError]);

  return <div />;
}
