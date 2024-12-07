'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { LoadingSpinner, Page } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect } from 'react';

export default function RecoveryPage() {
  const { isComplete: isSessionHydrateComplete } = useHydrateSession();
  const authUserSessionToken = useStore(state => state.authUserSessionToken);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const router = useSendRouter();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { email } = activeRpcPayload?.params?.[0] || {};

  useEffect(() => {
    if (!email) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
    }
  }, [email]);

  useEffect(() => {
    if (!isSessionHydrateComplete) return;

    if (authUserSessionToken) {
      rejectActiveRpcRequest(RpcErrorCode.UserAlreadyLoggedIn, 'User is already logged in');
    } else {
      router.replace(`/send/rpc/auth/${activeRpcPayload?.method}/start`);
    }
  }, [authUserSessionToken, isSessionHydrateComplete]);

  return (
    <Page.Content>
      <VStack mt={12} mb={24}>
        <LoadingSpinner />
      </VStack>
    </Page.Content>
  );
}
