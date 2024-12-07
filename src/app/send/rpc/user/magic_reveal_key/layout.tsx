/* istanbul ignore file */

'use client';

import PageFooter from '@components/show-ui/footer';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getQueryClient } from '@lib/common/query-client';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default function RevealPrivateKeyLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const isLegacyFlow = !!activeRpcPayload?.params[0]?.isLegacyFlow;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType={isLegacyFlow ? 'solid' : 'blurred'}>
        {children}
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
