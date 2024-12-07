/* istanbul ignore file */
'use client';

import PageFooter from '@components/show-ui/footer';
import ShowSendTokensUI from '@components/show-ui/show-send-tokens-ui';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { getQueryClient } from '@lib/common/query-client';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function ShowSendTokensUIPage() {
  const queryClient = getQueryClient();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();

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
        <ShowSendTokensUI />
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
