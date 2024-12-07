'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import { useTranslation } from '@lib/common/i18n';
import { WalletNavigationType, WalletPage } from '@magiclabs/ui-components';
import { useCallback } from 'react';

export interface WalletNavigationProps {
  active: WalletNavigationType;
}

export default function WalletNavigation({ active }: WalletNavigationProps) {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();

  const onActivity = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet_activity');
  }, []);

  const onGallery = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet_nfts');
  }, []);

  const onHome = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet');
  }, []);

  const onSettings = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet_settings');
  }, []);

  return (
    <WalletPage.Navigation
      active={active}
      disabled={[
        { type: WalletNavigationType.Activity, label: t('Coming soon') },
        { type: WalletNavigationType.Settings, label: t('Coming soon') },
      ]}
      onActivity={onActivity}
      onGallery={onGallery}
      onHome={onHome}
      onSettings={onSettings}
    />
  );
}
