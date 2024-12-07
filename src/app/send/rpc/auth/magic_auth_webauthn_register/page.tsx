'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWebauthnRegisterQuery } from '@hooks/data/embedded/webauthn';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { isEmpty } from '@lib/utils/is-empty';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const pathname = usePathname();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { mutateAsync: mutateWebauthRegister } = useWebauthnRegisterQuery();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { hydrateAndPersistAuthState } = useSetAuthState();

  const [hasCalledWebauthnRegister, setHasCalledWebauthnRegister] = useState(false);
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: !walletCreationError && areWalletsCreated,
  });

  const doWebAuthnRegister = async () => {
    setHasCalledWebauthnRegister(true);
    const params = activeRpcPayload?.params[0];
    const registrationResponse = {
      attObj: params.registration_response.attObj,
      clientData: params.registration_response.clientData,
    };

    const transport = isEmpty(params.transport) ? 'unknown' : params.transport[0];
    try {
      const { authUserId, authUserSessionToken } = await mutateWebauthRegister({
        webauthnUserId: params.id,
        nickname: params.nickname,
        transport,
        userAgent: params.user_agent,
        registrationResponse,
      });
      await hydrateAndPersistAuthState({
        authUserId,
        authUserSessionToken,
      });
    } catch (err) {
      rejectActiveRpcRequest(
        RpcErrorCode.InternalError,
        (err as ApiResponseError).message ?? RpcErrorMessage.UserDeniedAccountAccess,
      );
      setHasResolvedOrRejected(true);
    }
  };

  useEffect(() => {
    if (hasCalledWebauthnRegister) return;
    doWebAuthnRegister();
  }, [hasCalledWebauthnRegister]);

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

      logger.error('magic_auth_login_with_webauthn_register Page - Wallet hydrating or creation error', error);
    }
  }, [walletCreationError, didTokenError]);

  return null;
}
