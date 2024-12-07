'use client';

import { RPC_VERIFY_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import EnforceMfaRecoveryCode from '@components/mfa/enforce-mfa-recovery-code';
import { useSendRouter } from '@hooks/common/send-router';

const EnforceMfaRecoveryCodePage = () => {
  const router = useSendRouter();

  const onSuccess = () => {
    router.replace(`${RPC_VERIFY_ROUTE}/resolve`);
  };

  const onPressLostRecoveryCode = () => {
    router.replace(`${RPC_VERIFY_ROUTE}/enforce_mfa_lost_recovery_code`);
  };

  const onPressBack = () => {
    router.replace(`${RPC_VERIFY_ROUTE}/enforce_mfa`);
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
