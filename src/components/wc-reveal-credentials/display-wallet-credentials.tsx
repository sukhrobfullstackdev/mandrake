'use client';

import { CredentialType, WalletCredentials } from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__types__';
import {
  CopyCredentialsButton,
  ShowCredentialsButton,
} from '@components/wc-reveal-credentials/wallet-credentials-buttons';
import WalletCredentialsContainer from '@components/wc-reveal-credentials/wallet-credentials-container';
import { SolanaLedgerBridge } from '@custom-types/ledger-bridge';
import { WalletType } from '@custom-types/wallet';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useTrackRevealWalletQuery } from '@hooks/data/reveal-key';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DkmsService } from '@lib/dkms';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { analytics } from '@lib/services/analytics';
import { getWalletType } from '@lib/utils/network-name';
import { VStack } from '@styled/jsx';
import { useCallback, useEffect, useState } from 'react';

const DisplayWalletCredentials = ({ credentialType }: WalletCredentials) => {
  const [wasCopied, setWasCopied] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState('');
  const {
    authUserId,
    magicApiKey,
    decodedQueryParams: { ethNetwork, ext },
  } = useStore.getState();

  const walletType = getWalletType(ethNetwork, ext);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  // multichain wallet info will also include ETH wallet info
  const {
    currentChainWalletCredential: credentialsData,
    currentChainWalletInfo: walletInfo,
    areWalletsCreated,
  } = useHydrateOrCreateWallets();

  const { mutate: trackRevealWallet } = useTrackRevealWalletQuery();

  const getPkOrSeedPhrase = async () => {
    if (!credentialsData || !walletInfo || !areWalletsCreated) return;
    const encryptedCredential =
      credentialType === CredentialType.PrivateKey || !walletInfo.encryptedSeedPhrase
        ? walletInfo.encryptedPrivateAddress
        : walletInfo.encryptedSeedPhrase;
    const pkOrSeedPhrase: string = await DkmsService.reconstructSecret(credentialsData, encryptedCredential);
    if (authUserId) trackRevealWallet({ auth_user_id: authUserId });
    if (walletType === WalletType.SOLANA) {
      const solGetAccount = () => walletInfo?.publicAddress || '';
      const solanaBridge = (await createBridge(solGetAccount, ethNetwork, ext)).ledgerBridge as SolanaLedgerBridge;
      const solPk = await solanaBridge.convertMnemonicToRawPrivateKey(activeRpcPayload, pkOrSeedPhrase);
      setCredentials(solPk as string);
    } else {
      setCredentials(pkOrSeedPhrase);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getPkOrSeedPhrase();
  }, [credentialsData, walletInfo, areWalletsCreated]);

  const handleCopytoClipboard = useCallback(() => {
    if (!credentials || !magicApiKey) return;
    const textarea = document.createElement('textarea');
    textarea.value = credentials;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setWasCopied(true);
    analytics(magicApiKey).track('Wallet Credentials Copied');
    setTimeout(() => setWasCopied(false), 1200);
  }, [credentials]);

  const handleShowCredentials = useCallback(() => {
    if (!magicApiKey) return;
    if (isHidden) analytics(magicApiKey).track('Wallet Credentials Revealed');
    setIsHidden(!isHidden);
  }, [isHidden, magicApiKey]);

  return (
    <VStack w="full" gap={6} mt={6}>
      <WalletCredentialsContainer isHidden={isHidden} isLoading={isLoading} rawWalletCredentials={credentials} />
      <VStack w="full" gap={3}>
        <CopyCredentialsButton wasCopied={wasCopied} onPress={handleCopytoClipboard} />
        <ShowCredentialsButton isHidden={isHidden} onPress={handleShowCredentials} />
      </VStack>
    </VStack>
  );
};

export default DisplayWalletCredentials;
