'use client';

import DisplayPrivateKey from '@components/reveal-private-key/display-private-key';
import RevealKeyButtons from '@components/reveal-private-key/reveal-key-buttons';
import RevealKeyHeader from '@components/reveal-private-key/reveal-key-header';
import { SolanaLedgerBridge } from '@custom-types/ledger-bridge';
import { WalletType } from '@custom-types/wallet';
import { useAssetUri } from '@hooks/common/client-config';
import { useTrackRevealWalletQuery } from '@hooks/data/reveal-key';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { DkmsService } from '@lib/dkms';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { getWalletType } from '@lib/utils/network-name';
import { Button, ClientAssetLogo, IcoKey, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useEffect, useState } from 'react';

export default function RevealPrivateKeyPage() {
  const { t } = useTranslation('send');
  const assetUri = useAssetUri();
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const isLegacyFlow = !!activeRpcPayload?.params[0]?.isLegacyFlow;
  const walletType = getWalletType(ethNetwork, ext);
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { mutate: trackRevealWallet } = useTrackRevealWalletQuery();

  const getPrivateKey = async () => {
    if (!authUserId || !authUserSessionToken) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { walletInfoData: walletInfo, privateKey: pk } = await DkmsService.reconstructSecretWithUserSession({
        authUserId,
        authUserSessionToken,
        walletType,
      });

      if (authUserId) trackRevealWallet({ auth_user_id: authUserId });
      if (walletType === WalletType.SOLANA) {
        const solGetAccount = () => walletInfo.publicAddress || '';
        const solanaBridge = (await createBridge(solGetAccount, ethNetwork, ext)).ledgerBridge as SolanaLedgerBridge;
        const res = await solanaBridge.convertMnemonicToRawPrivateKey(activeRpcPayload, pk);
        setPrivateKey(res as string);
      } else {
        setPrivateKey(pk);
      }
    } catch {
      setErrorMessage(t('An error occurred. Please try again.'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getPrivateKey();
  }, []);

  const handleRevealPrivateKey = useCallback(() => {
    setIsHidden(!isHidden);
  }, [isHidden]);

  const handleCopy = useCallback(() => {
    if (!privateKey) return;
    const textarea = document.createElement('textarea');
    textarea.value = privateKey;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1200);
  }, [privateKey]);

  const handleTryAgain = () => {
    getPrivateKey();
  };

  return (
    <>
      <RevealKeyHeader showLogout={!isLegacyFlow} />
      <Page.Icon>
        <ClientAssetLogo assetUri={assetUri}>
          <ClientAssetLogo.PlaceholderIcon>
            <IcoKey color={token('colors.brand.base')} />
          </ClientAssetLogo.PlaceholderIcon>
        </ClientAssetLogo>
      </Page.Icon>

      <Page.Content>
        <VStack gap={2} mb={5}>
          <Text.H3>{t('Wallet Private Key')}</Text.H3>
          <Text styles={{ textAlign: 'center', color: token('colors.warning.darker') }}>
            {t('Store this in a secure place that only you can access and do not share it with\u00A0anyone.')}
          </Text>
        </VStack>
        {errorMessage ? (
          <VStack gap={6}>
            <Text variant="error" styles={{ textAlign: 'center' }}>
              {errorMessage}
            </Text>
            <Button
              onPress={handleTryAgain}
              disabled={isLoading}
              validating={isLoading}
              variant="primary"
              size="md"
              label={t('Try Again')}
            />
          </VStack>
        ) : (
          <>
            <DisplayPrivateKey isHidden={isHidden} isLoading={isLoading} rawPrivateCredentials={privateKey} />
            {!isLoading && (
              <RevealKeyButtons
                isHidden={isHidden}
                isCopied={isCopied}
                handleRevealPrivateKey={handleRevealPrivateKey}
                handleCopy={handleCopy}
              />
            )}
          </>
        )}
      </Page.Content>
    </>
  );
}
