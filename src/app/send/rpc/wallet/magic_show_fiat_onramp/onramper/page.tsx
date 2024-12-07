'use client';

import OnRamper from '@components/show-ui/fiat-on-ramps/on-ramper/on-ramper';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { Page } from '@magiclabs/ui-components';
import PageFooter from '@components/show-ui/footer';

export default function OnRamperPage() {
  return (
    <>
      <WalletPageHeader />
      <Page.Content>
        <OnRamper />
      </Page.Content>
      <PageFooter />
    </>
  );
}
