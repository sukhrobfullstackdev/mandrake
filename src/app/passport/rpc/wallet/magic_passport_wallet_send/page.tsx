'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import { useTranslation } from '@lib/common/i18n';
import { PassportPage, SegmentedControl, Tab, WalletPage } from '@magiclabs/ui-components';
import { useCallback, useState } from 'react';

export default function PassportShowUIPage() {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();
  const [selectedTab, setSelectedTab] = useState('tokens');

  const onHome = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet');
  }, []);

  return (
    <WalletPage.Content>
      <PassportPage onBack={onHome}>
        <PassportPage.Content>
          <SegmentedControl size="sm" selectedTab={selectedTab} onChange={setSelectedTab}>
            <Tab id="tokens" label={t('Tokens')} />
            <Tab id="collectibles" label={t('Collectibles')} />
          </SegmentedControl>
        </PassportPage.Content>
      </PassportPage>
    </WalletPage.Content>
  );
}
