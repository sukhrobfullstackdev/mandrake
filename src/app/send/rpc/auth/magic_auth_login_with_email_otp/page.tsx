'use client';

import { useLoginContext } from '@app/send/login-context';
import EmailOtpContentHeader from '@components/email-otp-content-header';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useEmailFromPayloadOrSearchParams } from '@hooks/common/email-from-payload-or-search-params';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { LoginWithEmailOTPEventEmit } from '@magic-sdk/types';
import { IcoEmailOpen, LoadingSpinner, Page } from '@magiclabs/ui-components';
import { Center, VStack } from '@styled/jsx';
import { isValidEmail } from '@utils/validators';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useCloseMagicWindowListener } from '@hooks/common/close-magic-window';

export default function LoginWithEmailOtp() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const router = useSendRouter();
  const loginContext = useLoginContext();
  const [hydrateSessionEnabled, setHydrationSessionEnabled] = useState(false);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const email = useEmailFromPayloadOrSearchParams();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;
  const { resetAuthState } = useResetAuthState();
  useCloseMagicWindowListener();
  const { isComplete: isSessionHydrateComplete, isError: isSessionHydrateError } = useHydrateSession({
    enabled: hydrateSessionEnabled,
  });
  const { email: emailFromStore } = useStore(state => state);

  useEffect(() => {
    loginContext.setLoginState({
      ...loginContext,
      emailFromPayload: email,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isValidEmail(email)) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
      return;
    }
    setHydrationSessionEnabled(true);
  }, [email]);
  // DH: Need to be very careful what goes in this dependency array.
  // We only ever want to rerun this entire hook when isSessionHydrateComplete changes. NOT when isSessionHydrateError changes
  // Putting other values in here will cause the hook to rerun when they change, which is not what we want.
  // All other values (active payload, email, etc) should be present during the initial render cycle, and should only be evaluated when isSessionHydrateComplete is true.

  useEffect(() => {
    const loginWithEmailOtp = async () => {
      // if we have a valid session and the emails match, proceed
      if (!isSessionHydrateError && email === emailFromStore) {
        return router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
      }

      dispatchPhantomClearCacheKeys();
      await resetAuthState();
      if (showUI || showUI === undefined) {
        IFrameMessageService.showOverlay();
      } else {
        AtomicRpcPayloadService.onEvent(LoginWithEmailOTPEventEmit.Cancel, () => {
          rejectActiveRpcRequest(RpcErrorCode.RequestCancelled, RpcErrorMessage.UserCanceledAction);
        });
      }
      router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/start');
    };

    if (isSessionHydrateComplete) {
      loginWithEmailOtp();
    }
  }, [isSessionHydrateComplete]);

  return (
    <>
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailOtpContentHeader email={email} />
        <VStack gap={3} my={3}>
          <Center h={12}>
            <LoadingSpinner size={36} strokeWidth={4} />
          </Center>
        </VStack>
      </Page.Content>
    </>
  );
}
