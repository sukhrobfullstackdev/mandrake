'use client';

import SpireKeyHeader from '@app/send/rpc/kda/__components__/spirekey-header';
import SpireKeyStatus from '@app/send/rpc/kda/__components__/spirekey-status';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { KadenaLedgerBridge } from '@custom-types/ledger-bridge';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { kadenaVerifySpireKeyLogin } from '@hooks/data/embedded/multichain/kadena';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { Page } from '@magiclabs/ui-components';
import { useCallback, useEffect, useState } from 'react';

export default function KdaWalletPage() {
  const { t } = useTranslation('send');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSigning, setIsSigning] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { isEthWalletHydrated, ethWalletHydrationError } = useHydrateOrCreateEthWallet();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const connectedAccount = JSON.parse(sessionStorage.getItem('connectedAccount') || '{}');
  const kdaGetAccount = () => '';

  const handleSpireKeySign = useCallback(async () => {
    try {
      setErrorMessage('');
      const kadenaBridge = (await createBridge(kdaGetAccount, ethNetwork, ext)).ledgerBridge as KadenaLedgerBridge;
      const { hash, cmd, sigs } = await kadenaBridge.signSpireKeyLogin(connectedAccount);
      const parsedSig = JSON.parse(sigs[0].sig);
      setIsSigning(false);
      setIsConfirming(true);

      const { authUserId, authUserSessionToken } = await kadenaVerifySpireKeyLogin({
        transactionHash: hash,
        signature: parsedSig.signature,
        publicKey: sigs[0].pubKey,
        transactionCommand: cmd,
        authenticatorData: parsedSig.authenticatorData,
        clientDataJson: parsedSig.clientDataJSON,
      });

      await hydrateAndPersistAuthState({
        authUserId,
        authUserSessionToken,
      });
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  }, [connectedAccount, ethNetwork, ext, hydrateAndPersistAuthState, kdaGetAccount, resolveActiveRpcRequest]);

  useEffect(() => {
    if (!isEthWalletHydrated && !ethWalletHydrationError) {
      handleSpireKeySign();
    }

    if (isEthWalletHydrated) {
      localStorage.setItem('spireKeyAccount', JSON.stringify(connectedAccount));
      setIsConfirming(false);
      setTimeout(() => {
        resolveActiveRpcRequest(connectedAccount);
      }, 1000);
    }

    if (ethWalletHydrationError) {
      setTimeout(() => {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.WalletHydrationError);
      }, 1000);
    }
  }, [isEthWalletHydrated, ethWalletHydrationError]);

  return (
    <Page>
      <SpireKeyHeader showCloseButton={!!errorMessage} />
      <Page.Content>
        <SpireKeyStatus
          isPending={isSigning}
          isConfirming={isConfirming}
          errorMessage={errorMessage}
          defaultText={t('Approve the request in SpireKey to continue')}
          retryCallback={handleSpireKeySign}
        />
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
