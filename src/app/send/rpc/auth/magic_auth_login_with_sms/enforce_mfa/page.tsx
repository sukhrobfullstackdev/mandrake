'use client';

import EnforceMFA from '@components/mfa/enforce-mfa';
import { useSendRouter } from '@hooks/common/send-router';

const EnforceMfaPage = () => {
  const router = useSendRouter();

  const onSuccess = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_sms/wallet');
  };

  const onPressLostDevice = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_sms/enforce_mfa_recovery_code');
  };

  return <EnforceMFA onSuccess={onSuccess} onPressLostDevice={onPressLostDevice} showLostDeviceButton />;
};

export default EnforceMfaPage;
