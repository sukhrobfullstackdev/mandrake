'use client';

import Sardine from '@components/show-ui/fiat-on-ramps/sardine/sardine';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';

export default function SardinePage() {
  const router = useSendRouter();
  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/eth/eth_sendTransaction')} />
      <Page.Content>
        <Sardine />
      </Page.Content>
      <PageFooter />
    </>
  );
}
