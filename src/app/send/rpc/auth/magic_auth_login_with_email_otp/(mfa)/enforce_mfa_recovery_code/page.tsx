'use client';

import EnforceMfaRecoveryCode from '@components/mfa/enforce-mfa-recovery-code';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { LoginWithEmailOTPEventEmit, LoginWithEmailOTPEventOnReceived } from '@magic-sdk/types';
import { useEffect, useState } from 'react';

const EnforceMfaRecoveryCodePage = () => {
  const router = useSendRouter();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;
  const [recoveryCode, setRecoveryCode] = useState('');

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(LoginWithEmailOTPEventEmit.VerifyRecoveryCode, (code: unknown) => {
      setRecoveryCode(code as string);
    });

    AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.RecoveryCodeSentHandle);
  }, []);

  const onSuccess = () => {
    AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.RecoveryCodeSuccess);
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
  };

  const onError = () => {
    if (showUI || showUI === undefined) return;
    AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.InvalidRecoveryCode);
  };

  const onPressLostRecoveryCode = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa_lost_recovery_code');
  };

  const onPressBack = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa');
  };

  return (
    <EnforceMfaRecoveryCode
      onPressLostRecoveryCode={onPressLostRecoveryCode}
      onPressBack={onPressBack}
      onSuccess={onSuccess}
      onError={onError}
      defaultRecoveryCode={recoveryCode}
    />
  );
};

export default EnforceMfaRecoveryCodePage;
