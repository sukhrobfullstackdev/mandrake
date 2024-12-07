'use client';

import MCLoginHeader from '@app/send/rpc/wallet/mc_login/__components__/header';
import PageFooter from '@components/show-ui/footer';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getQueryClient } from '@lib/common/query-client';

import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function MCLoginLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const shouldAutoPromptThirdPartyWallets = activeRpcPayload?.params[0]?.autoPromptThirdPartyWallets;

  useEffect(() => {
    // Don't show modal if auto prompting 3pw
    if (shouldAutoPromptThirdPartyWallets) return;
    IFrameMessageService.showOverlay();
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page overlay={false}>
        <MCLoginHeader />
        {children}
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
