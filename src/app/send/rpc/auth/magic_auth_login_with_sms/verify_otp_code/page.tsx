'use client';

import { useLoginContext } from '@app/send/login-context';
import { useApiErrorText } from '@components/api-error-text';
import RequestNewOtpCode from '@components/request-otp-code/request-otp-code';
import { MagicApiErrorCode } from '@constants/error';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useSendRouter } from '@hooks/common/send-router';
import { LoginWithSmsVerifyResponse, useLoginWithSmsVerifyMutation } from '@hooks/data/embedded/sms';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { mfaIsEnforced } from '@lib/utils/mfa';
import { LoginWithSmsOTPEventEmit, LoginWithSmsOTPEventOnReceived } from '@magic-sdk/types';
import { IcoMessage, Page, VerifyPincode } from '@magiclabs/ui-components';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SmsContentHeader from '../__components__/sms-content-header';

export default function LoginWithSmsVerifyOtpCode() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const sdkMetaData = useStore(state => state.sdkMetaData);
  const loginContext = useLoginContext();
  const phoneNumber = activeRpcPayload?.params?.[0]?.phoneNumber as string;
  const jwt = (sdkMetaData?.webCryptoDpopJwt as string) || '';
  const {
    mutateAsync: verifyOtpCodeMutation,
    isPending,
    error: smsVerifyError,
    isSuccess,
    reset,
  } = useLoginWithSmsVerifyMutation();
  const router = useSendRouter();
  const pathname = usePathname();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const errorCode = smsVerifyError?.response?.error_code;
  const errorMessage = useApiErrorText(errorCode) ?? '';
  const [showRequestOtpCode, setShowRequestOtpCode] = useState(true);

  useEffect(() => {
    loginContext.setLoginState({ ...loginContext, showCloseButton: true });
  }, []);

  const onPressSendNewCode = () => {
    loginContext.setLoginState({ ...loginContext, showCloseButton: false });
    router.replace('/send/rpc/auth/magic_auth_login_with_sms/start');
  };

  const onCompleteOtp = (oneTimeCode: string) => {
    setShowRequestOtpCode(false);
    loginContext.setLoginState({ ...loginContext, showCloseButton: false });
    try {
      verifyOtpCodeMutation(
        {
          phoneNumber,
          requestOriginMessage: loginContext.requestOriginMessage,
          oneTimeCode,
          loginFlowContext: loginContext.loginFlowContext,
          jwt,
        },
        {
          onSuccess: async ({
            authUserId,
            authUserSessionToken,
            refreshToken,
            factorsRequired,
          }: LoginWithSmsVerifyResponse) => {
            await hydrateAndPersistAuthState({
              phoneNumber,
              authUserId,
              authUserSessionToken,
              refreshToken: refreshToken || '',
              requestOriginMessage: loginContext.requestOriginMessage,
            });

            if (mfaIsEnforced(factorsRequired)) {
              return router.replace('/send/rpc/auth/magic_auth_login_with_sms/enforce_mfa');
            }

            return router.replace('/send/rpc/auth/magic_auth_login_with_sms/wallet');
          },
          onError: (err: ApiResponseError) => {
            loginContext.setLoginState({ ...loginContext, showCloseButton: true });
            setShowRequestOtpCode(true);

            if (err.response?.error_code === MagicApiErrorCode.INCORRECT_VERIFICATION_CODE) {
              AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithSmsOTPEventOnReceived.InvalidSmsOtp);
            }
            if (err.response?.error_code === MagicApiErrorCode.VERIFICATION_CODE_EXPIRED) {
              AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithSmsOTPEventOnReceived.ExpiredSmsOtp);
            }
          },
        },
      );
    } catch (error) {
      logger.error('Error verifying OTP code', error);
    }
  };

  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

    // Ensure event listener for the VerifySmsOtp event is attched before sending SmsOTPSent event
    AtomicRpcPayloadService.onEvent(LoginWithSmsOTPEventEmit.VerifySmsOtp, (otp: unknown) => {
      onCompleteOtp(otp as string);
    });
    AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithSmsOTPEventOnReceived.SmsOTPSent);
  }, []);

  const onChangeOtp = () => {
    // if a user types in the input, we need to reset the error state.
    if (smsVerifyError) reset();
  };

  return (
    <>
      <Page.Icon>
        <IcoMessage />
      </Page.Icon>
      <Page.Content>
        <SmsContentHeader phoneNumber={phoneNumber} />
        <VerifyPincode
          originName="sms"
          pinLength={6}
          isPending={isPending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={onCompleteOtp}
          errorMessage={errorCode !== MagicApiErrorCode.DEVICE_NOT_VERIFIED ? errorMessage : ''}
        >
          <VerifyPincode.RetryContent>
            <RequestNewOtpCode
              isVisible={showRequestOtpCode}
              utcRetrygateMs={loginContext.utcRetrygateMs}
              onPressSendNewCode={onPressSendNewCode}
            />
          </VerifyPincode.RetryContent>
        </VerifyPincode>
      </Page.Content>
    </>
  );
}
