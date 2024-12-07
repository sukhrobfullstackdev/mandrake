'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useOverrideEmailLinkRpcPayload } from '@hooks/common/email-link';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { IcoEmailOpen, LoadingSpinner, Page } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { isValidEmail } from '@utils/validators';
import { useEffect, useLayoutEffect, useState } from 'react';
import EmailLinkContentHeader from './__components__/email-link-content-header';

export default function LoginWithEmailLink() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const router = useSendRouter();
  const [hydrateSessionEnabled, setHydrationSessionEnabled] = useState(false);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { resetAuthState } = useResetAuthState();

  const { updatedPayload, isPayloadUpdated } = useOverrideEmailLinkRpcPayload(activeRpcPayload);

  const email = updatedPayload?.params?.[0]?.email as string;
  const showUI = updatedPayload?.params?.[0]?.showUI as boolean;

  const { email: emailFromStore } = useStore(state => state);

  const { isComplete: isSessionHydrateComplete, isError: isSessionHydrateError } = useHydrateSession({
    enabled: hydrateSessionEnabled,
  });

  /**
   * Mobile: ignore redirection and enforce security otp. (MagicLink API has been deprecated in recent versions)
   * Web:
   *  * If No redirect, trigger security code
   *  * Redirect, allow whitelabel
   */

  useLayoutEffect(() => {
    if (!isValidEmail(email)) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
      return;
    }
    setHydrationSessionEnabled(true);
  }, [email, isPayloadUpdated]);

  useEffect(() => {
    if (!isPayloadUpdated) return;
    if (!isSessionHydrateComplete) return;
    if (!isSessionHydrateError && email === emailFromStore) {
      router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/wallet');
      return;
    }
    dispatchPhantomClearCacheKeys();
    resetAuthState();
    if (showUI || showUI === undefined) {
      IFrameMessageService.showOverlay();
    }
    router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/start');
  }, [isSessionHydrateComplete, isPayloadUpdated]);

  return (
    <>
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailLinkContentHeader email={email} />
        <VStack gap={3} my={3}>
          <LoadingSpinner size={36} strokeWidth={4} />
        </VStack>
      </Page.Content>
    </>
  );
}
