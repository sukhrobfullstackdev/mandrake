'use client';

import EnterMfaLostRecoveryCode from '@components/mfa/enter-mfa-lost-recovery-code';
import { useRouter } from 'next/navigation';

const EnterMfaLostRecoveryCodePage = () => {
  const router = useRouter();

  const onPressBack = () => {
    router.push('/confirm/enforce_mfa_recovery_code');
  };

  return <EnterMfaLostRecoveryCode onPressBack={onPressBack} showCloseButton={false} />;
};

export default EnterMfaLostRecoveryCodePage;
