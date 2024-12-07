'use client';

import Stripe from '@components/show-ui/fiat-on-ramps/stripe/stripe';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { Page } from '@magiclabs/ui-components';

export default function StripePage() {
  const router = useSendRouter();
  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/eth/eth_sendTransaction')} />
      <Page.Content>
        <Stripe />
      </Page.Content>
      <PageFooter />
    </>
  );
}
