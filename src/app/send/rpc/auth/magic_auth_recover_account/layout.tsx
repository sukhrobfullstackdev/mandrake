'use client';
import { LoginProvider } from '@app/send/login-context';
import { getQueryClient } from '@common/query-client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { RecoverAccountEventEmit } from '@magic-sdk/types';
import { Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  useEffect(() => {
    if (!activeRpcPayload) return;
    if (showUI || showUI === undefined) {
      IFrameMessageService.showOverlay();
    }

    AtomicRpcPayloadService.onEvent(RecoverAccountEventEmit.Cancel, () => {
      rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
    });
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LoginProvider>
        <Page backgroundType="blurred">{children}</Page>
      </LoginProvider>
    </HydrationBoundary>
  );
}
