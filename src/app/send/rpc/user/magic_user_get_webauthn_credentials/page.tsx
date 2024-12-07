'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { LoginMethodType, WebAuthnInfoType } from '@custom-types/api-response';
import { WalletType } from '@custom-types/wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserInfoQuery, userQueryKeys } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect, useState } from 'react';

export default function Page() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType: WalletType.ETH,
    }),
    { enabled: !!authUserId && !!authUserSessionToken && isHydrateSessionComplete && !isHydrateSessionError },
  );

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (isHydrateSessionError && isHydrateSessionComplete && activeRpcPayload) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionError, isHydrateSessionComplete]);

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (userInfoError) {
      rejectActiveRpcRequest(
        RpcErrorCode.InternalError,
        userInfoError.message ?? RpcErrorMessage.UserDeniedAccountAccess,
      );
      setHasResolvedOrRejected(true);
    } else if (userInfoData && activeRpcPayload) {
      const { login } = userInfoData;
      if (login.type === LoginMethodType.WebAuthn) {
        const result = {
          devicesInfo: (login?.webauthn as WebAuthnInfoType)?.devicesInfo.map(d => ({ ...d, user_agent: d.userAgent })),
          username: (login?.webauthn as WebAuthnInfoType)?.username,
        };
        resolveActiveRpcRequest(result);
      } else {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UserNotLoggedInWithWebAuthn);
      }
      setHasResolvedOrRejected(true);
    }
  }, [hasResolvedOrRejected, activeRpcPayload, userInfoError, userInfoData]);

  return <div />;
}
