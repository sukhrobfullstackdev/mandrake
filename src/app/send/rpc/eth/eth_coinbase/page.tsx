'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletType } from '@custom-types/wallet';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserInfoQuery, userQueryKeys } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import Web3Service from '@utils/web3-services/web3-service';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { isEthWalletHydrated, ethWalletHydrationError } = useHydrateOrCreateEthWallet();

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { authUserId, authUserSessionToken } = useStore(state => state);

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType: WalletType.ETH,
    }),
    {
      enabled:
        !!authUserId &&
        !!authUserSessionToken &&
        isHydrateSessionComplete &&
        !isHydrateSessionError &&
        isEthWalletHydrated,
    },
  );

  // Hydrate or reject.
  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if (isHydrateSessionError || userInfoError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionError, isHydrateSessionComplete]);

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if (userInfoData) {
      Web3Service.toChecksumAddress(userInfoData.publicAddress).then(checkSumAddr => {
        resolveActiveRpcRequest(checkSumAddr);
        setHasResolvedOrRejected(true);
      });
    }
  }, [activeRpcPayload, hasResolvedOrRejected, userInfoData]);

  useEffect(() => {
    if (ethWalletHydrationError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('eth_coinbase Page - Error hydrating or creating eth wallet', ethWalletHydrationError);
    }
  }, [ethWalletHydrationError]);

  return null;
}
