'use client';

import EnforceMfaRecoveryCode from '@components/mfa/enforce-mfa-recovery-code';
import { useRouter } from 'next/navigation';

const EnforceMfaRecoveryCodePage = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.push('/confirm/resolve');
  };

  const onPressLostRecoveryCode = () => {
    router.push('/confirm/enforce_mfa_lost_recovery_code');
  };

  const onPressBack = () => {
    router.push('/confirm/enforce_mfa');
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
