'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import Web3Service from '@utils/web3-services/web3-service';
import { useEffect, useState } from 'react';
import { useStore } from '@hooks/store';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { WalletType } from '@custom-types/wallet';

export default function Page() {
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  // Hydrate or reject.
  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionError, isHydrateSessionComplete]);

  const doEthSign = async () => {
    if (!authUserId || !authUserSessionToken) return;

    try {
      const { walletInfoData, awsCreds } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });
      const [signerAddress, message] = activeRpcPayload?.params as [string, string];
      const isExpectedSigner = await Web3Service.compareAddresses([signerAddress, walletInfoData.publicAddress]);
      if (!isExpectedSigner) {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.SignerMismatch);
        setHasResolvedOrRejected(true);
        return;
      }

      const privateKey = await DkmsService.reconstructSecret(awsCreds, walletInfoData.encryptedPrivateAddress);
      const signature = await Web3Service.ethSign(message, privateKey);
      resolveActiveRpcRequest(signature);
      setHasResolvedOrRejected(true);
    } catch (error) {
      logger.error('Signing Error', { error });
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.SigningError);
      setHasResolvedOrRejected(true);
    }
  };

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    doEthSign();
  }, [activeRpcPayload, hasResolvedOrRejected]);

  return null;
}
