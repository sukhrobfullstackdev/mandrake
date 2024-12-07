/* istanbul ignore file */
'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { LoginMethodType } from '@custom-types/api-response';
import { KadenaUserMetadata } from '@custom-types/kadena';
import { WalletType } from '@custom-types/wallet';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { userQueryKeys, useUserInfoQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect, useState } from 'react';

export default function KdaGetInfoPage() {
  const [kadenaUserMetadata, setKadenaUserMetadata] = useState<KadenaUserMetadata | null>(null);
  const { authUserId, authUserSessionToken, email, phoneNumber } = useStore(state => state);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const connectedAccount = JSON.parse(localStorage.getItem('spireKeyAccount') || '{}');

  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType: WalletType.KADENA,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken && isHydrateSessionComplete && !isHydrateSessionError,
      refetchOnMount: 'always',
      gcTime: 0,
    },
  );

  const { walletCreationError } = useHydrateOrCreateWallets({
    enabled: !!userInfoData && userInfoData?.login.type !== LoginMethodType.SpireKey,
  });

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

  // Set Kadena and SpireKey-specific user metadata.
  useEffect(() => {
    if (userInfoData) {
      const isSpireKey = userInfoData.login.type === LoginMethodType.SpireKey;
      setKadenaUserMetadata({
        accountName: isSpireKey ? connectedAccount?.accountName : userInfoData.publicAddress,
        publicKey: isSpireKey
          ? connectedAccount?.devices?.[0]?.guard.keys?.[0]
          : userInfoData.publicAddress.substring(2),
        loginType: userInfoData.login.type,
        email: userInfoData?.email?.toLowerCase() ?? email?.toLowerCase() ?? undefined,
        phoneNumber: userInfoData?.phoneNumber ?? phoneNumber ?? undefined,
        isMfaEnabled: userInfoData.authUserMfaActive,
        spireKeyInfo: isSpireKey ? connectedAccount : undefined,
      });
    }
  }, [userInfoData]);

  // Resolve the user info.
  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (kadenaUserMetadata && activeRpcPayload) {
      resolveActiveRpcRequest(kadenaUserMetadata);
      setHasResolvedOrRejected(true);
    }
  }, [kadenaUserMetadata, activeRpcPayload, resolveActiveRpcRequest, hasResolvedOrRejected]);

  useEffect(() => {
    if (walletCreationError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('kda_getInfo Page - Wallet hydrating or creation error', walletCreationError);
    }

    if (userInfoError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserNotFound);
      setHasResolvedOrRejected(true);

      logger.error('kda_getInfo Page - Error fetching user info', userInfoError);
    }
  }, [walletCreationError, userInfoError]);
}
