'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useCreateFactorMutation } from '@hooks/data/embedded/account-recovery';
import { useStore } from '@hooks/store';
import { useEffect } from 'react';

export default function UpdateEmailPage() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const authUserId = useStore(state => state.authUserId);
  const email = useStore(state => state.email);

  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const { mutateAsync: createFactorMutate } = useCreateFactorMutation();

  const router = useSendRouter();

  const initialize = async () => {
    try {
      await createFactorMutate({ authUserId, value: email, type: 'email_address', isRecoveryEnabled: true });
      router.replace('/send/rpc/auth/magic_auth_update_email/input_address');
    } catch (e) {
      router.replace('/send/rpc/auth/magic_auth_update_email/recency_check');
    }
  };

  useEffect(() => {
    if (!isHydrateSessionComplete) return;

    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [isHydrateSessionComplete]);

  useEffect(() => {
    initialize();
  }, []);

  return null;
}
