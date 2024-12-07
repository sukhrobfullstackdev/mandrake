'use client';

import { useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';
import { useLoginContext } from '@app/send/login-context';
import { EmailLinkConfirmErrorState } from '@constants/email-link';
import { MagicApiErrorCode } from '@constants/error';
import { useFlags } from '@hooks/common/launch-darkly';
import { useEmailLinkLoginVerifyQuery } from '@hooks/data/embedded/email-link';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { LoadingSpinner, Page } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { isValidBase64 } from '@utils/base64';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginWithEmailLinkConfirm() {
  const router = useRouter();

  const confirmContext = useEmailLinkConfirmContext();
  const loginContext = useLoginContext();
  const flags = useFlags();
  const {
    tlt,
    e: env,
    ct,
    location,
    flowContext,
    redirectUrl,
    securityOtpChallenge,
    ak,
    nextFactor,
    isQueryHydrated,
  } = confirmContext;

  const { data: clientConfig } = useClientConfigQuery({ magicApiKey: ak! });

  const { mutate: mutateEmailLinkLoginVerify } = useEmailLinkLoginVerifyQuery();

  /**
   * Step 1
   * Navigate to error page if the magic link received is likely broken,
   * malformed, or mis-copied from the email client. We infer this by testing
   * whether known base64-encoded properties in the URL query are valid and
   * parseable.
   */
  useEffect(() => {
    // note ct (Client theme) is not required any more in Mandrake
    if (!isQueryHydrated) return;
    if (!(ct && location && flowContext && isValidBase64(ct) && isValidBase64(location))) {
      router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.LinkBroken}`);
      return;
    }

    loginContext.setLoginState({ ...loginContext, loginFlowContext: flowContext });

    if (nextFactor) {
      //trigger MFA before security otp or redirection
      //Todo there is flaw in the UI where we shouldn't verify mfa before security otp
      router.push(`/confirm/enforce_mfa`);
      return;
    }

    // Only throw error if the allowlists.redirect_url is not empty & redirectUrl is not included
    if (redirectUrl) {
      if (flags?.isRedirectAllowlistEnabled?.enabled) {
        const redirectUrlWithoutQueryParams = redirectUrl.split('?')[0];
        // Only throw error if the allowlists.redirect_url is not empty & redirectUrl is not included
        if (
          clientConfig?.accessAllowlists.redirectUrl &&
          clientConfig?.accessAllowlists.redirectUrl.length > 0 &&
          !clientConfig?.accessAllowlists.redirectUrl.includes(redirectUrlWithoutQueryParams)
        ) {
          router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.RedirectFailed}`);
          return;
        }
      }
    }

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
    return;
  }, [isQueryHydrated]);

  return (
    <Page.Content>
      <VStack gap={3} my={3}>
        <LoadingSpinner size={36} strokeWidth={4} />
      </VStack>
    </Page.Content>
  );
}
