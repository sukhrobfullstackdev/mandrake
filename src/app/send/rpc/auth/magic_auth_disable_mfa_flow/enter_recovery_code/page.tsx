'use client';
import { useDisableMfaContext } from '@app/send/rpc/auth/magic_auth_disable_mfa_flow/disable-mfa-context';
import EnterMfaRecoveryCode from '@components/mfa/enter-mfa-recovery-code';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useDisableTemporaryOtpRecoveryCodeMutation } from '@hooks/data/embedded/mfa';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DisableMFAEventEmit, DisableMFAEventOnReceived, MagicPayloadMethod } from '@magic-sdk/types';
import { useEffect } from 'react';

const DisableMfaRecoveryCode = () => {
  const router = useSendRouter();
  const authUserId = useStore(state => state.authUserId);
  const authUserSessionToken = useStore(state => state.authUserSessionToken);
  const { recoveryCode } = useDisableMfaContext();
  const { mutate, isPending, isSuccess, error } = useDisableTemporaryOtpRecoveryCodeMutation();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;

  const onChangeRecoveryCode = (code: string) => {
    if (code.length !== 8) {
      if (!showUI && showUI !== undefined) {
        AtomicRpcPayloadService.emitJsonRpcEventResponse(DisableMFAEventOnReceived.InvalidRecoveryCode);
      }
      return;
    }
    if (authUserId && authUserSessionToken) {
      mutate(
        { authUserId, jwt: authUserSessionToken, recoveryCode: code },
        {
          onSuccess: () => {
            useStore.setState({
              mfaRecoveryCodes: [],
            });
            if (activeRpcPayload?.method === MagicPayloadMethod.UserSettings) {
              router.replace('/send/rpc/user/magic_auth_settings');
            } else if (activeRpcPayload?.method === MagicPayloadMethod.DisableMFA) {
              resolveActiveRpcRequest(true);
            } else {
              router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow');
            }
          },

          onError: () => {
            AtomicRpcPayloadService.emitJsonRpcEventResponse(DisableMFAEventOnReceived.InvalidRecoveryCode);
          },
        },
      );
    }
  };

  const onPressLostRecoveryCode = () => {
    router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/lost_recovery_code');
  };

  const onPressBack = () => {
    router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/enter_totp');
  };

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(DisableMFAEventEmit.LostDevice, (code: unknown) => {
      onChangeRecoveryCode(code as string);
    });
  }, []);

  useEffect(() => {
    if (!recoveryCode.length) return;
    onChangeRecoveryCode(recoveryCode);
  }, [recoveryCode]);

  return (
    <EnterMfaRecoveryCode
      isPending={isPending}
      isSuccess={isSuccess}
      errorCode={error?.response?.error_code}
      onChangeRecoveryCode={onChangeRecoveryCode}
      onPressLostRecoveryCode={onPressLostRecoveryCode}
      onPressBack={onPressBack}
    />
  );
};

export default DisableMfaRecoveryCode;
