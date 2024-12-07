'use client';

import { useDisableMfaContext } from '@app/send/rpc/auth/magic_auth_disable_mfa_flow/disable-mfa-context';
import { getQueryClient } from '@common/query-client';
import EnterMfaTotp from '@components/mfa/enter-mfa-totp';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useDisableTemporaryOtpMutation } from '@hooks/data/embedded/mfa';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { DisableMFAEventEmit, DisableMFAEventOnReceived, MagicPayloadMethod } from '@magic-sdk/types';
import { useEffect } from 'react';

const DisableMfaEnterTotp = () => {
  const queryClient = getQueryClient();
  const router = useSendRouter();
  const authUserId = useStore(state => state.authUserId);
  const authUserSessionToken = useStore(state => state.authUserSessionToken);
  const { mutate, isPending, isSuccess, error, reset } = useDisableTemporaryOtpMutation();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;
  const { setRecoveryCode } = useDisableMfaContext();

  useEffect(() => {
    if (showUI || showUI === undefined) {
      IFrameMessageService.showOverlay();
    }
  }, [showUI]);

  const onChangeOtp = () => {
    // if a user types in the input, we need to reset the error state
    if (error) reset();
  };

  const onCompleteOtp = (totp: string) => {
    if (authUserId && authUserSessionToken) {
      mutate(
        { authUserId, jwt: authUserSessionToken, totp },
        {
          onSuccess: async () => {
            await queryClient.resetQueries({
              queryKey: [['user', 'info']],
            });
            // disable mfa flow doesn't have CTA button, we need to add a delay to automatically close the modal
            setTimeout(() => {
              if (activeRpcPayload?.method === MagicPayloadMethod.UserSettings) {
                router.replace('/send/rpc/user/magic_auth_settings');
              } else {
                resolveActiveRpcRequest(true);
              }
            }, 2000);
          },
          onError: err => {
            AtomicRpcPayloadService.emitJsonRpcEventResponse(DisableMFAEventOnReceived.InvalidMFAOtp, [
              {
                errorCode: err.response?.error_code,
              },
            ]);
          },
        },
      );
    }
  };

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(DisableMFAEventEmit.VerifyMFACode, (otp: unknown) => {
      onCompleteOtp(otp as string);
    });
    AtomicRpcPayloadService.onEvent(DisableMFAEventEmit.LostDevice, (recoveryCode: unknown) => {
      setRecoveryCode(recoveryCode as string);
      router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/enter_recovery_code');
    });

    AtomicRpcPayloadService.emitJsonRpcEventResponse(DisableMFAEventOnReceived.MFACodeRequested);
  }, []);

  const onPressLostDevice = () => {
    router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/enter_recovery_code');
  };

  return (
    <EnterMfaTotp
      onCompleteOtp={onCompleteOtp}
      onChangeOtp={onChangeOtp}
      onPressLostDevice={onPressLostDevice}
      isPending={isPending}
      isSuccess={isSuccess}
      errorCode={error?.response?.error_code}
      showLostDeviceButton
    />
  );
};

export default DisableMfaEnterTotp;
