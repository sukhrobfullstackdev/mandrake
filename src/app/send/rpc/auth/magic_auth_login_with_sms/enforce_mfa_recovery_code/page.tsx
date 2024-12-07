'use client';

import EnforceMfaRecoveryCode from '@components/mfa/enforce-mfa-recovery-code';
import { useSendRouter } from '@hooks/common/send-router';

const EnforceMfaRecoveryCodePage = () => {
  const router = useSendRouter();

  const onSuccess = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_sms/wallet');
  };

  const onPressLostRecoveryCode = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_sms/enforce_mfa_lost_recovery_code');
  };

  const onPressBack = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_sms/enforce_mfa');
  };

  return (
    <EnforceMfaRecoveryCode
      onPressLostRecoveryCode={onPressLostRecoveryCode}
      onPressBack={onPressBack}
      onSuccess={onSuccess}
    />
  );
};

export default EnforceMfaRecoveryCodePage;
