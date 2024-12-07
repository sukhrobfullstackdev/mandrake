'use client';

import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { Page } from '@magiclabs/ui-components';
import PageFooter from '@components/show-ui/footer';
import Sardine from '@components/show-ui/fiat-on-ramps/sardine/sardine';

export default function SardinePage() {
  return (
    <>
      <WalletPageHeader />
      <Page.Content>
        <Sardine />
      </Page.Content>
      <PageFooter />
    </>
  );
}
