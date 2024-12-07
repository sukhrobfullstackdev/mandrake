'use client';

import { useOAuthContext } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { PopupMessageType } from '@custom-types/popup';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Button, IcoBlock, Page, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PopupPage() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const router = useSendRouter();
  const oauthContext = useOAuthContext();
  const providerUri = oauthContext.providerURI;
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const { t } = useTranslation('send');
  const pathname = usePathname();

  const openPopup = useCallback(() => {
    if (!providerUri) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
      return;
    }

    if (popup) {
      setIsPopupBlocked(false);
      IFrameMessageService.hideOverlay();
      return;
    }

    const width = 448;
    const height = 568;
    const left = window.screenLeft + (window.outerWidth / 2 - width / 2);
    const top = window.screenTop + window.outerHeight * 0.15;

    const newPopup = window.open(providerUri, '_blank', `width=${width},height=${height},left=${left},top=${top}`);

    if (!newPopup) {
      setIsPopupBlocked(true);
      IFrameMessageService.showOverlay();
      return;
    } else {
      setPopup(newPopup);
      setIsPopupBlocked(false);
      IFrameMessageService.hideOverlay();
    }

    const checkPopupClosed = setInterval(() => {
      if (newPopup?.closed) {
        clearInterval(checkPopupClosed);
        rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
      }
    }, 1000);

    const messageListener = (event: MessageEvent) => {
      if (event.data.msgType !== PopupMessageType.MAGIC_POPUP_RESPONSE || event.source !== newPopup) return;

      window.removeEventListener('message', messageListener);
      clearInterval(checkPopupClosed);

      if (event.data.payload.authorizationResponseParams) {
        oauthContext.setOAuthState({
          ...oauthContext,
          providerResult: event.data.payload.authorizationResponseParams,
        });

        AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
        router.replace('/send/rpc/oauth/magic_oauth_login_with_popup/verify');
      } else {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
      }
    };

    window.addEventListener('message', messageListener);
  }, [providerUri, popup, rejectActiveRpcRequest, oauthContext, router]);

  const handleCancel = useCallback(() => {
    rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
  }, [rejectActiveRpcRequest]);

  useEffect(() => {
    openPopup();
  }, [providerUri]);

  return (
    isPopupBlocked && (
      <Page backgroundType="blurred">
        <Page.Icon>
          <IcoBlock />
        </Page.Icon>
        <Page.Content>
          <VStack gap={8}>
            <Text.H3>{t('Popup blocked!')}</Text.H3>
            <HStack gap={4}>
              <Button label={t('Go to Popup')} onPress={openPopup} />
              <Button variant="secondary" label={t('Cancel')} onPress={handleCancel} />
            </HStack>
          </VStack>
        </Page.Content>
        <PageFooter />
      </Page>
    )
  );
}
