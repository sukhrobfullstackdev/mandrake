'use client';

import EnterMfaLostRecoveryCode from '@components/mfa/enter-mfa-lost-recovery-code';
import { useSendRouter } from '@hooks/common/send-router';

const EnterMfaLostRecoveryCodePage = () => {
  const router = useSendRouter();

  const onPressBack = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa_recovery_code');
  };

  return <EnterMfaLostRecoveryCode onPressBack={onPressBack} />;
};

export default EnterMfaLostRecoveryCodePage;
