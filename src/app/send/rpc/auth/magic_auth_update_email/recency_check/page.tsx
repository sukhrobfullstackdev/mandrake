'use client';

import { useUpdateEmailContext } from '@app/send/rpc/auth/magic_auth_update_email/update-email-context';
import PrimaryFactorRecencyCheck from '@components/recency-check/recency-check';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { MagicPayloadMethod } from '@magic-sdk/types';

export default function RecencyCheck() {
  const router = useSendRouter();
  const updateEmailContext = useUpdateEmailContext();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const method = activeRpcPayload?.method;
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const onSuccess = (credential: string) => {
    updateEmailContext.setUpdateEmailState({
      ...updateEmailContext,
      updateEmailCredential: credential,
    });
    router.replace('/send/rpc/auth/magic_auth_update_email/input_address');
  };

  const onClose = () => {
    if (method === MagicPayloadMethod.UserSettings && !deeplinkPage) {
      router.replace('/send/rpc/user/magic_auth_settings');
    } else {
      rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
    }
  };

  return <PrimaryFactorRecencyCheck onSuccess={onSuccess} onClosePress={onClose} />;
}
