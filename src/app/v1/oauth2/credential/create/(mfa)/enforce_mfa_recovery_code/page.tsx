'use client';

import EnforceMfaRecoveryCode from '@components/mfa/enforce-mfa-recovery-code';
import { useRouter } from 'next/navigation';

const EnforceMfaRecoveryCodePage = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.replace('/v1/oauth2/credential/create/resolve');
  };

  const onPressLostRecoveryCode = () => {
    router.replace('/v1/oauth2/credential/create/enforce_mfa_lost_recovery_code');
  };

  const onPressBack = () => {
    router.replace('/v1/oauth2/credential/create/enforce_mfa');
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
