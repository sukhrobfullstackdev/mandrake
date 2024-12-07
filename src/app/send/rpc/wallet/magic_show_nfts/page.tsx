'use client';

import PageFooter from '@components/show-ui/footer';
import NFTList from '@components/show-ui/nft-list';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useTranslation } from '@lib/common/i18n';
import { getQueryClient } from '@lib/common/query-client';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function ShowNFTsPage() {
  const queryClient = getQueryClient();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { t } = useTranslation('send');

  useEffect(() => {
    if (!isHydrateSessionComplete) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    } else {
      IFrameMessageService.showOverlay();
    }
  }, [isHydrateSessionComplete, isHydrateSessionError]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <WalletPageHeader />
        <Page.Content>
          <VStack alignItems="flex-start" w="full" gap={6}>
            <Text.H4>{t('Collectibles')}</Text.H4>
            <NFTList />
          </VStack>
        </Page.Content>
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
