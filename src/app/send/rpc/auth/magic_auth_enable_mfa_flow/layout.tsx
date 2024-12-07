/* istanbul ignore file */
'use client';

import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { EnableMFAEventEmit, MagicPayloadMethod } from '@magic-sdk/types';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useSendRouter();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  useEffect(() => {
    if (!activeRpcPayload) return;
    if (showUI || showUI === undefined) {
      IFrameMessageService.showOverlay();
    }
  }, []);

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(EnableMFAEventEmit.Cancel, () => {
      useStore.setState({
        mfaEnrollSecret: null,
        mfaEnrollInfo: null,
        mfaRecoveryCodes: [],
      });
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
    });
  }, []);

  const handleClose = () => {
    if (activeRpcPayload?.method === MagicPayloadMethod.UserSettings) {
      if (deeplinkPage) {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
      } else {
        router.replace('/send/rpc/user/magic_auth_settings');
      }
    } else {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
    }
  };
  return (
    <Page backgroundType="blurred">
      <Page.Header>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose}>
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      {children}
      <PageFooter />
    </Page>
  );
}
