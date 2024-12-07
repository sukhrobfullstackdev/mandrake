'use client';

import PageFooter from '@components/show-ui/footer';
import ShowAddress from '@components/show-ui/show-address';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { getQueryClient } from '@lib/common/query-client';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default function ShowWalletAddressPage() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <WalletPageHeader />
        <Page.Content>
          <ShowAddress />
        </Page.Content>
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
