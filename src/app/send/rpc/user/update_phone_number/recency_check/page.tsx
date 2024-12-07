'use client';

import { useUpdatePhoneNumberContext } from '@app/send/rpc/user/update_phone_number/update-phone-number-context';
import PrimaryFactorRecencyCheck from '@components/recency-check/recency-check';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

export default function RecencyCheck() {
  const router = useSendRouter();
  const updatePhoneNumberContext = useUpdatePhoneNumberContext();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const onSuccess = (credential: string, factorId: string) => {
    updatePhoneNumberContext.setUpdatePhoneNumberState({
      ...updatePhoneNumberContext,
      updatePhoneNumberCredential: credential,
      updatePhoneNumberFactorId: factorId,
    });
    router.replace(`/send/rpc/user/update_phone_number/input_new_phone_number`);
  };

  const onClose = () => {
    if (deeplinkPage) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
        closedByUser: true,
      });
    } else {
      router.replace('/send/rpc/user/magic_auth_settings');
    }
  };
  return <PrimaryFactorRecencyCheck onSuccess={onSuccess} onClosePress={onClose} />;
}
