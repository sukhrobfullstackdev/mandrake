'use client';

import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getQueryClient } from '@lib/common/query-client';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default function EthSendTransactionLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const router = useSendRouter();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <WalletPageHeader
          onPressBack={
            activeRpcPayload?.method === 'magic_wallet'
              ? () => {
                  router.replace('/send/rpc/wallet/magic_wallet');
                }
              : undefined
          }
        />
        {children}
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
