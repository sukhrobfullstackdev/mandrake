'use client';

import { useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';
import EnforceMFA from '@components/mfa/enforce-mfa';
import { EmailLinkConfirmErrorState } from '@constants/email-link';
import { MagicApiErrorCode } from '@constants/error';
import { useEmailLinkLoginVerifyQuery } from '@hooks/data/embedded/email-link';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const EnforceMfaPage = () => {
  const router = useRouter();
  const { securityOtpChallenge, redirectUrl, tlt, e: env } = useEmailLinkConfirmContext();
  const { mutate: mutateEmailLinkLoginVerify } = useEmailLinkLoginVerifyQuery();

  const onSuccess = useCallback(() => {
    if (redirectUrl) {
      router.push('/confirm/redirect');
    } else if (!JSON.parse(securityOtpChallenge || 'false')) {
      mutateEmailLinkLoginVerify(
        { tlt: tlt!, env: env || 'testnet' },
        {
          onSuccess: () => {
            router.push('/confirm/success');
          },
          onError: (error: ApiResponseError) => {
            if (
              error.response?.error_code === MagicApiErrorCode.ANOMALOUS_REQUEST_DETECTED ||
              error.response?.error_code === MagicApiErrorCode.ANOMALOUS_REQUEST_APPROVAL_REQUIRED
            ) {
              router.push('/confirm/anomaly_detected');
            } else if (error.response?.error_code === MagicApiErrorCode.MAGIC_LINK_REQUESTED_FROM_DIFFERENT_IP) {
              router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.MismatchedIP}`);
            } else {
              router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.AuthExpired}`);
            }
          },
        },
      );
    } else {
      router.push('/confirm/security_otp_challenge');
    }
  }, [securityOtpChallenge]);

  const onPressLostDevice = () => {
    router.push('/confirm/enforce_mfa_recovery_code');
  };

  return (
    <EnforceMFA
      onSuccess={onSuccess}
      onPressLostDevice={onPressLostDevice}
      showLostDeviceButton={true}
      showCloseButton={false}
      skipPersist={true}
    />
  );
};

export default EnforceMfaPage;
