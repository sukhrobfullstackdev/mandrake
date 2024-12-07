'use client';

import PageFooter from '@components/show-ui/footer';
import { getQueryClient } from '@lib/common/query-client';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default function ShowUILayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        {children}
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
