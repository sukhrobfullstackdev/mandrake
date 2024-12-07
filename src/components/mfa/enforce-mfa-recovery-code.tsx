'use client';
import { useLoginContext } from '@app/send/login-context';
import EnterMfaRecoveryCode from '@components/mfa/enter-mfa-recovery-code';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useVerifyTemporaryOtpRecoveryCodeMutation } from '@hooks/data/embedded/mfa';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useEffect } from 'react';

interface EnforceMfaRecoveryCodeProps {
  onSuccess: () => void;
  onPressLostRecoveryCode: () => void;
  onPressBack: () => void;
  onError?: () => void;
  defaultRecoveryCode?: string;
}

const EnforceMfaRecoveryCode = ({
  onSuccess,
  onPressLostRecoveryCode,
  onPressBack,
  onError,
  defaultRecoveryCode,
}: EnforceMfaRecoveryCodeProps) => {
  const { loginFlowContext, requestOriginMessage } = useLoginContext();
  const { mutate, isPending, isSuccess, error } = useVerifyTemporaryOtpRecoveryCodeMutation();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const email = activeRpcPayload?.params?.[0]?.email as string;

  const onChangeRecoveryCode = (code: string) => {
    if (code.length === 8) {
      mutate(
        { loginFlowContext, totp: code },
        {
          onSuccess: async response => {
            const { authUserId, authUserSessionToken, refreshToken } = response;
            await hydrateAndPersistAuthState({
              email,
              authUserId,
              authUserSessionToken,
              refreshToken: refreshToken || '',
              requestOriginMessage,
            });
            onSuccess();
          },
          onError: () => {
            if (onError) onError();
          },
        },
      );
    } else if (onError) {
      onError();
    }
  };

  useEffect(() => {
    if (defaultRecoveryCode) {
      onChangeRecoveryCode(defaultRecoveryCode);
    }
  }, [defaultRecoveryCode]);

  return (
    <EnterMfaRecoveryCode
      onChangeRecoveryCode={onChangeRecoveryCode}
      onPressLostRecoveryCode={onPressLostRecoveryCode}
      onPressBack={onPressBack}
      errorCode={error?.response?.error_code}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

export default EnforceMfaRecoveryCode;
