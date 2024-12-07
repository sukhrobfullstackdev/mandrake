'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AlgorandLedgerBridge } from '@custom-types/ledger-bridge';
import { WalletType } from '@custom-types/wallet';
import { useHydrateOrCreateMultichainWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { useEffect, useState } from 'react';

export default function AlgodSignBidPage() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  useEffect(() => AtomicRpcPayloadService.handleVersionSkew(), []);
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const { isComplete: isSessionHydrateComplete, isError: isSessionHyrateError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });
  const { walletInfoData, credentialsData, multichainWalletHydrationError } = useHydrateOrCreateMultichainWallet({
    walletType: WalletType.ALGOD,
  });
  const getAccount = () => walletInfoData?.publicAddress || '';
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const doAlgodSignBidForUser = async () => {
    if (!walletInfoData || !credentialsData) return;
    try {
      const pk = await DkmsService.reconstructSecret(credentialsData, walletInfoData.encryptedPrivateAddress);
      const algorandBridge = (await createBridge(getAccount, ethNetwork, ext)).ledgerBridge as AlgorandLedgerBridge;
      const res = await algorandBridge.signBid(activeRpcPayload, pk);
      resolveActiveRpcRequest(res);
    } catch (err) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedSigning);
    }
    setHasResolvedOrRejected(true);
  };

  useEffect(() => {
    if (!walletInfoData || !credentialsData || hasResolvedOrRejected) return;
    doAlgodSignBidForUser();
  }, [walletInfoData, credentialsData, hasResolvedOrRejected]);

  // Hydrate or reject.
  useEffect(() => {
    if (!isSessionHydrateComplete) return;
    if (isSessionHyrateError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [isSessionHydrateComplete, isSessionHyrateError]);

  useEffect(() => {
    if (multichainWalletHydrationError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error(
        'algod_signBid Page - Error hydrating or creating multichain wallet',
        multichainWalletHydrationError,
      );
    }
  }, [multichainWalletHydrationError]);
  return null;
}
