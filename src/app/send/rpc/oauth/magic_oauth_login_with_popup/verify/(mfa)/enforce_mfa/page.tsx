'use client';

import { RPC_VERIFY_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import EnforceMFA from '@components/mfa/enforce-mfa';
import { useSendRouter } from '@hooks/common/send-router';

const EnforceMfaPage = () => {
  const router = useSendRouter();

  const onSuccess = () => {
    router.replace(`${RPC_VERIFY_ROUTE}/resolve`);
  };

  const onPressLostDevice = () => {
    router.replace(`${RPC_VERIFY_ROUTE}/enforce_mfa_recovery_code`);
  };

  return <EnforceMFA onSuccess={onSuccess} onPressLostDevice={onPressLostDevice} showLostDeviceButton={true} />;
};

export default EnforceMfaPage;
