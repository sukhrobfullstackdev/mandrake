/* istanbul ignore file */

'use client';

import { UpdatePhoneNumberProvider } from '@app/send/rpc/user/update_phone_number/update-phone-number-context';
import { getQueryClient } from '@common/query-client';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  useEffect(() => {
    if (
      !activeRpcPayload ||
      activeRpcPayload.method !== 'magic_auth_settings' ||
      (showUI === false && deeplinkPage === 'recovery')
    )
      return;
    IFrameMessageService.showOverlay();
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UpdatePhoneNumberProvider>{children}</UpdatePhoneNumberProvider>
    </HydrationBoundary>
  );
}
