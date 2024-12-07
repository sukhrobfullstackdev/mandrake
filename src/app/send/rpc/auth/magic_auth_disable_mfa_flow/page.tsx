'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletType } from '@custom-types/wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { userQueryKeys, useUserInfoQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { useEffect } from 'react';

export default function DisableMFAPage() {
  const authUserId = useStore(state => state.authUserId);
  const authUserSessionToken = useStore(state => state.authUserSessionToken);
  const router = useSendRouter();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const { isComplete: isSessionHydrateComplete, isError: isSessionHydrateError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });

  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType: WalletType.ETH,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken,
    },
  );

  useEffect(() => {
    if (!isSessionHydrateComplete) return;
    if (isSessionHydrateError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [isSessionHydrateComplete, isSessionHydrateError]);

  useEffect(() => {
    if (userInfoError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
    }
    if (!userInfoData) return;
    if (!userInfoData.authUserMfaActive) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.MFAAlreadyDisabled);
    } else {
      router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/enter_totp');
    }
  }, [userInfoData, userInfoError]);

  return <LoadingSpinner size={36} strokeWidth={4} />;
}
