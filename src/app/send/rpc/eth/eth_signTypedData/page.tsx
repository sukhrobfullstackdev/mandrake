'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import Web3Service from '@lib/utils/web3-services/web3-service';
import { EIP712LegacyData } from 'eth-sig-util';
import { useEffect, useState } from 'react';
import { useStore } from '@hooks/store';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { WalletType } from '@custom-types/wallet';

export default function EthSignTypedDataPage() {
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const { authUserId, authUserSessionToken } = useStore(state => state);

  // Hydrate or reject.
  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
      setHasResolvedOrRejected(true);
    }
  }, [activeRpcPayload, hasResolvedOrRejected, isHydrateSessionError, isHydrateSessionComplete]);

  const doSignTypedData = async () => {
    if (!authUserId || !authUserSessionToken) return;

    const [typedData, signerAddress] = activeRpcPayload?.params as [EIP712LegacyData, string];
    const { walletInfoData, awsCreds } = await getWalletInfoAndCredentials({
      authUserId,
      authUserSessionToken,
      walletType: WalletType.ETH,
    });

    const isExpectedSigner = await Web3Service.compareAddresses([signerAddress, walletInfoData.publicAddress]);
    if (!isExpectedSigner) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.SignerMismatch);
      return;
    }

    const privateKey = await DkmsService.reconstructSecret(awsCreds, walletInfoData.encryptedPrivateAddress);
    const signature = await Web3Service.signTypedDataV1(typedData, privateKey);
    resolveActiveRpcRequest(signature);
    setHasResolvedOrRejected(true);
  };

  useEffect(() => {
    if (hasResolvedOrRejected || !activeRpcPayload) return;
    doSignTypedData();
  }, [activeRpcPayload, hasResolvedOrRejected]);

  return null;
}
