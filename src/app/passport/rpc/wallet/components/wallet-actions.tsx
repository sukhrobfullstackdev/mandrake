'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import { useTranslation } from '@lib/common/i18n';
import { WalletPage } from '@magiclabs/ui-components';
import { useCallback } from 'react';

export default function WalletActions() {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();

  const onBuy = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet_add_funds');
  }, []);

  const onSend = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet_send');
  }, []);

  const onReceive = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet_receive');
  }, []);

  return (
    <WalletPage.Actions
      buyLabel={t('Add funds')}
      buyDisabledLabel={t('Coming soon')}
      sendDisabledLabel={t('Coming soon')}
      sendLabel={t('Send')}
      receiveLabel={t('Receive')}
      onBuy={onBuy}
      onSend={onSend}
      onReceive={onReceive}
    />
  );
}
