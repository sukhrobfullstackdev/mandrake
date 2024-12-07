'use client';

import { RPC_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_redirect_verify/constants';
import EnterMfaLostRecoveryCode from '@components/mfa/enter-mfa-lost-recovery-code';
import { useSendRouter } from '@hooks/common/send-router';

const EnterMfaLostRecoveryCodePage = () => {
  const router = useSendRouter();

  const onPressBack = () => {
    router.replace(`${RPC_ROUTE}/enforce_mfa_recovery_code`);
  };

  return <EnterMfaLostRecoveryCode onPressBack={onPressBack} />;
};

export default EnterMfaLostRecoveryCodePage;
