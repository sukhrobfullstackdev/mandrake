'use client';
import EnterMfaLostRecoveryCode from '@components/mfa/enter-mfa-lost-recovery-code';
import { useSendRouter } from '@hooks/common/send-router';

const DisableMfaLostRecoveryCode = () => {
  const router = useSendRouter();

  const onPressBack = () => {
    router.replace('/send/rpc/auth/magic_auth_disable_mfa_flow/enter_recovery_code');
  };

  return <EnterMfaLostRecoveryCode onPressBack={onPressBack} />;
};

export default DisableMfaLostRecoveryCode;
