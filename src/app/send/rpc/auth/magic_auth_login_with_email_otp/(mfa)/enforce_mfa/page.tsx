'use client';

import EnforceMFA from '@components/mfa/enforce-mfa';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { LoginWithEmailOTPEventEmit } from '@magic-sdk/types';
import { useEffect } from 'react';

const EnforceMfaPage = () => {
  const router = useSendRouter();

  const onSuccess = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
  };

  const onPressLostDevice = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa_recovery_code');
  };

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(LoginWithEmailOTPEventEmit.LostDevice, () => {
      router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa_recovery_code');
    });
  }, []);

  // todo: handle onError when we start handling MFA related page level redirects
  return <EnforceMFA onSuccess={onSuccess} onPressLostDevice={onPressLostDevice} showLostDeviceButton />;
};

export default EnforceMfaPage;
