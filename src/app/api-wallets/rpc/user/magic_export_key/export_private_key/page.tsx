'use client';

import { RevealViewType } from '@components/reveal-private-key/__type__';
import DisplayPrivateKey from '@components/reveal-private-key/display-private-key';
import RevealKeyButtons from '@components/reveal-private-key/reveal-key-buttons';
import RevealKeyHeader from '@components/reveal-private-key/reveal-key-header';
import { useAssetUri } from '@hooks/common/client-config';
import { useExportPrivateKey } from '@hooks/data/export-key';
import { ApiWalletAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { decryptPemKey, generatePemRSAKeyPair } from '@lib/utils/web-crypto';
import { ClientAssetLogo, IcoKey, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useEffect, useState } from 'react';
import { EXPORT_KEY_PARAMS_INVALID, EXPORT_KEY_REQUEST_FAILED, EXPORT_KEY_WARNING_TEXT } from '../__constants__';
import { ExportKeyStateType } from '../__types__';

export default function ExportPKPage() {
  const { t } = useTranslation('send');
  const assetUri = useAssetUri();
  const activeRpcPayload = ApiWalletAtomicRpcPayloadService.getActiveRpcPayload();
  const [state, setState] = useState<ExportKeyStateType>({ hidden: true, loading: true });

  const { mutateAsync: exportPrivateKeyAsync } = useExportPrivateKey();

  const { encryptionContext, keyShard, walletId, exportRequestId } = activeRpcPayload?.params[0] || {};
  const { hidden, copied, privateKey, loading, errorMessage } = state;

  const getPrivateKey = useCallback(async () => {
    const isMissingParam = [encryptionContext, keyShard, walletId, exportRequestId].some(item => !item);
    if (isMissingParam) {
      setState(prev => ({ ...prev, errorMessage: EXPORT_KEY_PARAMS_INVALID, loading: false }));
      return;
    }

    try {
      const { publicKeyPem, privateKeyPem } = await generatePemRSAKeyPair();

      const response = await exportPrivateKeyAsync({
        encryption_context: encryptionContext,
        access_key: keyShard,
        wallet_id: walletId,
        rsa_public_key: publicKeyPem,
        payload: [],
        export_request_id: exportRequestId,
      });

      const decryptedKey = await decryptPemKey(response?.private_key, privateKeyPem);

      setState(prev => ({ ...prev, privateKey: decryptedKey }));
    } catch (e) {
      setState(prev => ({ ...prev, errorMessage: EXPORT_KEY_REQUEST_FAILED }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [encryptionContext, keyShard, walletId]);

  useEffect(() => {
    getPrivateKey();
  }, [encryptionContext, keyShard, walletId]);

  const handleExportKey = useCallback(() => {
    setState(prev => ({ ...prev, hidden: !prev.hidden }));
  }, []);

  const handleCopy = useCallback(() => {
    if (!privateKey) return;
    const textarea = document.createElement('textarea');
    textarea.value = privateKey;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setState(prev => ({ ...prev, copied: true }));
    setTimeout(() => setState(prev => ({ ...prev, copied: false })), 1200);
  }, [privateKey]);

  const warningOrErrorText = errorMessage || EXPORT_KEY_WARNING_TEXT;

  return (
    <>
      <RevealKeyHeader showLogout type={RevealViewType.EXPORT} />
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
          <Text styles={{ textAlign: 'center', color: token('colors.warning.darker') }}>{t(warningOrErrorText)}</Text>
        </VStack>
        {privateKey && <DisplayPrivateKey isHidden={hidden} isLoading={loading} rawPrivateCredentials={privateKey} />}
        <RevealKeyButtons
          isHidden={hidden}
          isCopied={!!copied}
          handleRevealPrivateKey={handleExportKey}
          handleCopy={handleCopy}
          type={RevealViewType.EXPORT}
        />
      </Page.Content>
    </>
  );
}
