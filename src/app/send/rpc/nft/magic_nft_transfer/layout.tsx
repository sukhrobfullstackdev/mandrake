/* istanbul ignore file */

'use client';

import CollectibleHeader from '@components/collectible/collectible-header';
import PageFooter from '@components/show-ui/footer';
import { getQueryClient } from '@lib/common/query-client';
import { Page } from '@magiclabs/ui-components';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

export default function CollectibleTransferLayout({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <CollectibleHeader />
        {children}
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
