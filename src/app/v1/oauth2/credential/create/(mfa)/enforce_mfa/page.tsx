'use client';

import EnforceMFA from '@components/mfa/enforce-mfa';
import { useRouter } from 'next/navigation';

const EnforceMfaPage = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.replace('/v1/oauth2/credential/create/resolve');
  };

  const onPressLostDevice = () => {
    router.replace('/v1/oauth2/credential/create/enforce_mfa_recovery_code');
  };

  return (
    <EnforceMFA
      onSuccess={onSuccess}
      onPressLostDevice={onPressLostDevice}
      showLostDeviceButton={true}
      showCloseButton={false}
    />
  );
};

export default EnforceMfaPage;
