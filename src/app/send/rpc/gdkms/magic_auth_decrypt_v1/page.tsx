'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import { createHashNative } from '@lib/g-dkms/hash';
import { AES } from '@utils/crypto';
import { isBrowserSecureContext } from '@utils/is-browser-secure-context';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();

  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const cipherText = activeRpcPayload?.params?.[0]?.ciphertext;

  const { credentialsData, walletInfoData, ethWalletHydrationError } = useHydrateOrCreateEthWallet();

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

  useEffect(() => {
    if (hasResolvedOrRejected) return;
    if (!isBrowserSecureContext) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InsecureBrowserContext);
      setHasResolvedOrRejected(true);
      return;
    }
    const decryptCipherText = async () => {
      if (!credentialsData || !walletInfoData) return;

      let pk: null | string = await DkmsService.reconstructSecret(
        credentialsData,
        walletInfoData.encryptedPrivateAddress,
      );

      // Hash the pk to avoid passing plaintext pk
      const hash = await createHashNative(pk);
      pk = null;
      const originalMessage = AES.decrypt(cipherText as string, hash);
      resolveActiveRpcRequest(originalMessage);
    };

    decryptCipherText();
  }, [hasResolvedOrRejected, credentialsData, walletInfoData]);

  useEffect(() => {
    if (ethWalletHydrationError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      setHasResolvedOrRejected(true);

      logger.error('magic_auth_decrypt_v1 Page - Error hydrating or creating eth wallet', ethWalletHydrationError);
    }
  }, [ethWalletHydrationError]);

  return null;
}
