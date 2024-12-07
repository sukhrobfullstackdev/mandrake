'use client';

import Stripe from '@components/show-ui/fiat-on-ramps/stripe/stripe';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { Page } from '@magiclabs/ui-components';
import PageFooter from '@components/show-ui/footer';
import { useSendRouter } from '@hooks/common/send-router';

export default function StripePage() {
  const router = useSendRouter();
  return (
    <>
      <WalletPageHeader onPressBack={() => router.replace('/send/rpc/wallet/magic_wallet/home')} />
      <Page.Content>
        <Stripe />
      </Page.Content>
      <PageFooter />
    </>
  );
}
