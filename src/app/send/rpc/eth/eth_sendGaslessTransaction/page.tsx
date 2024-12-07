'use client';

import { SendGaslessTransactionUI } from '@app/send/rpc/eth/eth_sendGaslessTransaction/__components__/send-gasless-transaction-page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletType } from '@custom-types/wallet';
import { useGaslessTransaction } from '@hooks/blockchain/ethereum/send-gasless-transaction';
import { useClientConfigFeatureFlags, useClientId } from '@hooks/common/client-config';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserInfoQuery, userQueryKeys } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { useEffect, useState } from 'react';

export default function SendGaslessTransactionPage() {
  const { sendGaslessTransaction } = useGaslessTransaction();
  const features = useClientConfigFeatureFlags();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { clientId, error: clientIdError } = useClientId();
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });
  const { data: userInfoData, error: userInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId || '',
      authUserSessionToken: authUserSessionToken || '',
      walletType: WalletType.ETH,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken,
    },
  );

  // Hydrate or reject
  useEffect(() => {
    if (clientIdError) {
      logger.error('create-did-token - Error fetching client config', clientIdError);
      return rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToFetchConfig);
    }
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if ((isHydrateSessionComplete && isHydrateSessionError) || userInfoError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [clientIdError, activeRpcPayload, hasResolvedOrRejected, isHydrateSessionComplete, isHydrateSessionError]);

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload || !clientId || !userInfoData || !features) return;
    // Do not do gasless tx headlessly if the send transaction UI is enabled
    if (features?.isSendTransactionUiEnabled) {
      setShowUI(true);
      return;
    }

    const asyncSendGaslessTransaction = async () => {
      if (!authUserId || !authUserSessionToken) return;
      const { awsCreds: credentialsData, walletInfoData } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });
      sendGaslessTransaction({
        activeRpcPayload,
        publicAddress: userInfoData.publicAddress,
        credentialsData,
        walletInfoData,
      })
        .then(resolveActiveRpcRequest)
        .catch(error => {
          logger.error('Error sending gasless transaction', error);
          return rejectActiveRpcRequest(RpcErrorCode.InternalError, (error as Error).message);
        });
    };
    asyncSendGaslessTransaction();
  }, [activeRpcPayload, hasResolvedOrRejected, userInfoData, clientId, features]);

  useEffect(() => {
    if (showUI) {
      IFrameMessageService.showOverlay();
    }
  }, [showUI]);

  return showUI ? (
    <SendGaslessTransactionUI
      activeRpcPayload={activeRpcPayload as JsonRpcRequestPayload}
      publicAddress={userInfoData?.publicAddress as string}
    />
  ) : null;
}
