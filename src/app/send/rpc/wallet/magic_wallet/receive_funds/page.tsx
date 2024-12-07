'use client';

import ShowAddress from '@components/show-ui/show-address';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';

export default function WalletReceiveFundsPage() {
  const router = useSendRouter();

  const handlePressBack = () => {
    router.replace('/send/rpc/wallet/magic_wallet/home');
  };

  return (
    <>
      <WalletPageHeader onPressBack={handlePressBack} />
      <Page.Content>
        <ShowAddress />
      </Page.Content>
    </>
  );
}
