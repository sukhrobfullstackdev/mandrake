'use client';

import Stripe from '@components/show-ui/fiat-on-ramps/stripe/stripe';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { Page } from '@magiclabs/ui-components';
import PageFooter from '@components/show-ui/footer';

export default function StripePage() {
  return (
    <>
      <WalletPageHeader />
      <Page.Content>
        <Stripe />
      </Page.Content>
      <PageFooter />
    </>
  );
}
