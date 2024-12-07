'use client';

import OnRamper from '@components/show-ui/fiat-on-ramps/on-ramper/on-ramper';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';

export default function OnRamperPage() {
  const router = useSendRouter();
  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/eth/eth_sendTransaction')} />
      <Page.Content>
        <OnRamper />
      </Page.Content>
      <PageFooter />
    </>
  );
}
