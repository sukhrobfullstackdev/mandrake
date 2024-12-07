'use client';

import SpireKeyHeader from '@app/send/rpc/kda/__components__/spirekey-header';
import SpireKeyStatus from '@app/send/rpc/kda/__components__/spirekey-status';
import PageFooter from '@components/show-ui/footer';
import { KadenaLedgerBridge } from '@custom-types/ledger-bridge';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { Page } from '@magiclabs/ui-components';
import { useCallback, useEffect, useState } from 'react';

export default function KdaLoginWithSpireKeyPage() {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const [isPending, setIsPending] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const kdaGetAccount = () => '';

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  const handleConnectToSpireKey = useCallback(async () => {
    try {
      setErrorMessage('');
      const kadenaBridge = (await createBridge(kdaGetAccount, ethNetwork, ext)).ledgerBridge as KadenaLedgerBridge;
      const connectedAccount = await kadenaBridge.createSpireKeyWallet();

      setIsPending(false);

      sessionStorage.setItem('connectedAccount', JSON.stringify(connectedAccount));

      return router.replace('/send/rpc/kda/wallet');
    } catch (err) {
      return setErrorMessage((err as Error).message);
    }
  }, [ethNetwork, ext, kdaGetAccount, router]);

  useEffect(() => {
    handleConnectToSpireKey();
  }, []);

  return (
    <Page>
      <SpireKeyHeader showCloseButton={!!errorMessage} />
      <Page.Content>
        <SpireKeyStatus
          isPending={isPending}
          errorMessage={errorMessage}
          defaultText={t('Choose an account in SpireKey to continue')}
          retryCallback={handleConnectToSpireKey}
        />
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
