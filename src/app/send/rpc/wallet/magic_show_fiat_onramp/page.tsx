/* istanbul ignore file */
'use client';

import FiatOnramp from '@components/show-ui/fiat-on-ramps/FiatOnramp';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Page } from '@magiclabs/ui-components';
import { useEffect } from 'react';

export default function ShowUI() {
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
    <>
      <WalletPageHeader />
      <Page.Content>
        <FiatOnramp
          stripeRoute="/send/rpc/wallet/magic_show_fiat_onramp/stripe"
          sardineRoute="/send/rpc/wallet/magic_show_fiat_onramp/sardine"
          onramperRoute="/send/rpc/wallet/magic_show_fiat_onramp/onramper"
        />
      </Page.Content>
      <PageFooter />
    </>
  );
}
