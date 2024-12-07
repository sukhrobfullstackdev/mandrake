'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { LoginWithSmsOTPEventEmit } from '@magic-sdk/types';
import { IcoMessage, LoadingSpinner, Page } from '@magiclabs/ui-components';
import { Center, VStack } from '@styled/jsx';
import { useEffect } from 'react';
import SmsContentHeader from './__components__/sms-content-header';

export default function LoginWithSmsPage() {
  const router = useSendRouter();
  const { isError, isComplete } = useHydrateSession();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { resetAuthState } = useResetAuthState();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const phoneNumberFromStore = useStore(state => state.phoneNumber);
  const { phoneNumber, showUI } = activeRpcPayload?.params?.[0] || {};

  // We only want this hook to re-run when isCmplete changes, nothing else.
  useEffect(() => {
    const loginWithSms = async () => {
      // if we have a valid session and the phone numbers match, proceed
      if (!isError && phoneNumber === phoneNumberFromStore) {
        return router.replace('/send/rpc/auth/magic_auth_login_with_sms/wallet');
      }

      dispatchPhantomClearCacheKeys();
      await resetAuthState();

      if (showUI || showUI === undefined) {
        IFrameMessageService.showOverlay();
      } else {
        AtomicRpcPayloadService.onEvent(LoginWithSmsOTPEventEmit.Cancel, () => {
          rejectActiveRpcRequest(RpcErrorCode.RequestCancelled, RpcErrorMessage.UserCanceledAction);
        });
      }
      router.replace('/send/rpc/auth/magic_auth_login_with_sms/start');
    };

    if (isComplete) {
      loginWithSms();
    }
  }, [isComplete]);

  return (
    <>
      <Page.Icon>
        <IcoMessage />
      </Page.Icon>
      <Page.Content>
        <SmsContentHeader phoneNumber={phoneNumber} />
        <VStack gap={3} my={3}>
          <Center h={12}>
            <LoadingSpinner size={36} strokeWidth={4} />
          </Center>
        </VStack>
      </Page.Content>
    </>
  );
}
