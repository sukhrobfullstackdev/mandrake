'use client';

import { useLoginContext } from '@app/send/login-context';
import { useTranslation } from '@common/i18n';
import { useApiErrorText } from '@components/api-error-text';
import EmailOtpContentHeader from '@components/email-otp-content-header';
import { MagicApiErrorCode } from '@constants/error';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useEmailFromPayloadOrSearchParams } from '@hooks/common/email-from-payload-or-search-params';
import { useSendRouter } from '@hooks/common/send-router';
import { LoginWithEmailOtpVerifyResponse, useLoginWithEmailOtpVerify } from '@hooks/data/embedded/email-otp';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { mfaIsEnforced } from '@lib/utils/mfa';
import { LoginWithEmailOTPEventEmit, LoginWithEmailOTPEventOnReceived } from '@magic-sdk/types';
import { Button, IcoEmailOpen, Page, VerifyPincode } from '@magiclabs/ui-components';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginWithEmailOtpVerifyOtpCode() {
  const pathname = usePathname();
  const sdkMetaData = useStore(state => state.sdkMetaData);
  const loginContext = useLoginContext();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const { t } = useTranslation('send');
  const email = useEmailFromPayloadOrSearchParams();
  const jwt = (sdkMetaData?.webCryptoDpopJwt as string) || '';

  const {
    mutate: mutateSendEmailOtpVerify,
    isPending,
    error,
    reset,
    isSuccess: isSuccess,
  } = useLoginWithEmailOtpVerify();
  const router = useSendRouter();
  const errorCode = error?.response?.error_code;
  const errorMessage = useApiErrorText(errorCode) ?? '';
  const showButton =
    errorCode === MagicApiErrorCode.MAX_ATTEMPTS_EXCEEDED || errorCode === MagicApiErrorCode.VERIFICATION_CODE_EXPIRED;

  const onCompleteOtp = (oneTimeCode: string) => {
    const loginFlowContext = loginContext.loginFlowContext;
    mutateSendEmailOtpVerify(
      {
        email,
        requestOriginMessage: loginContext.requestOriginMessage,
        oneTimeCode,
        loginFlowContext,
        jwt,
      },
      {
        onSuccess: async ({
          authUserId,
          authUserSessionToken,
          refreshToken,
          factorsRequired,
        }: LoginWithEmailOtpVerifyResponse) => {
          // if mfa is enabled, hydrateAndPersistAuthState will be called on enforce_mfa after the user authenticates
          if (mfaIsEnforced(factorsRequired)) {
            return router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/enforce_mfa');
          }

          await hydrateAndPersistAuthState({
            email,
            authUserId,
            authUserSessionToken,
            refreshToken: refreshToken || '',
            requestOriginMessage: loginContext.requestOriginMessage,
          });

          return router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/wallet');
        },
        onError: (err: ApiResponseError) => {
          if (err.response?.error_code === MagicApiErrorCode.INCORRECT_VERIFICATION_CODE) {
            AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.InvalidEmailOtp);
          }
          if (err.response?.error_code === MagicApiErrorCode.VERIFICATION_CODE_EXPIRED) {
            AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.ExpiredEmailOtp);
          }
        },
      },
    );
  };

  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

    // Ensure event listener for the VerifyEmailOtp event is attched before sending EmailOTPSent event
    AtomicRpcPayloadService.onEvent(LoginWithEmailOTPEventEmit.VerifyEmailOtp, (otp: unknown) => {
      onCompleteOtp(otp as string);
    });
    AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.EmailOTPSent);
  }, []);

  // TODO count down timer

  const onChangeOtp = () => {
    // if a user types in the input, we need to reset the error state
    if (error) reset();
  };

  const onRequestNewCodePress = () => {
    router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/start');
  };

  return (
    <>
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailOtpContentHeader email={email} />
        <VerifyPincode
          originName="email"
          pinLength={6}
          isPending={isPending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={onCompleteOtp}
          errorMessage={errorCode !== MagicApiErrorCode.DEVICE_NOT_VERIFIED ? errorMessage : ''}
        >
          <VerifyPincode.RetryContent>
            {showButton && <Button variant="text" onPress={onRequestNewCodePress} label={t('Request a new code')} />}
          </VerifyPincode.RetryContent>
        </VerifyPincode>
      </Page.Content>
    </>
  );
}
