'use client';

import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { Page } from '@magiclabs/ui-components';
import PageFooter from '@components/show-ui/footer';
import { useSendRouter } from '@hooks/common/send-router';
import OnRamper from '@components/show-ui/fiat-on-ramps/on-ramper/on-ramper';

export default function OnRamperPage() {
  const router = useSendRouter();
  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/wallet/magic_wallet/home')} />
      <Page.Content>
        <OnRamper />
      </Page.Content>
      <PageFooter />
    </>
  );
}
