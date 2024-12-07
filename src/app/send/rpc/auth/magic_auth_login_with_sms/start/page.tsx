'use client';

import { useLoginContext } from '@app/send/login-context';
import { useTranslation } from '@common/i18n';
import ApiErrorText from '@components/api-error-text';
import { GOOGLE_RECAPTCHA_KEY } from '@constants/env';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { LoginWithSmsStartResponse, useLoginWithSmsStartMutation } from '@hooks/data/embedded/sms';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { createRandomString } from '@lib/utils/crypto';
import { DeviceVerificationEventOnReceived } from '@magic-sdk/types';
import { Button, IcoMessage, LoadingSpinner, Page } from '@magiclabs/ui-components';
import { Box, Center, VStack } from '@styled/jsx';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SmsContentHeader from '../__components__/sms-content-header';

export default function LoginWithSmsStart() {
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const sdkMetaData = useStore(state => state.sdkMetaData);
  const loginContext = useLoginContext();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { mutate: mutateLoginWithSmsStart, error: smsStartError } = useLoginWithSmsStartMutation();
  const errorCode = smsStartError?.response?.error_code;
  const [isGoogleReCaptchaLoaded, setIsGoogleReCaptchaLoaded] = useState(false);
  const [requestOriginMessage] = useState(createRandomString(128));
  const router = useSendRouter();
  const pathname = usePathname();

  const phoneNumber = activeRpcPayload?.params?.[0]?.phoneNumber as string;

  /**
   * Listen for the Google ReCaptcha script to load
   * Show the overlay if session hydration fails
   */
  useEffect(() => {
    window?.grecaptcha?.ready(() => {
      setIsGoogleReCaptchaLoaded(true);
    });
  }, []);

  useEffect(() => {
    const loginWithSmsStart = async () => {
      try {
        const { grecaptcha } = window as Window;
        const googleReCaptchaToken = await grecaptcha.execute(GOOGLE_RECAPTCHA_KEY, { action: 'submit' });
        mutateLoginWithSmsStart(
          { phoneNumber, googleReCaptchaToken, requestOriginMessage, jwt: sdkMetaData?.webCryptoDpopJwt || '' },
          {
            onSuccess: (response: LoginWithSmsStartResponse) => {
              loginContext.setLoginState({
                ...loginContext,
                ...response,
                requestOriginMessage,
              });
              useStore.setState({ systemClockOffset: response.utcTimestampMs - Date.now() });
              AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
              router.replace('/send/rpc/auth/magic_auth_login_with_sms/verify_otp_code');
            },
            onError: (error: ApiResponseError) => {
              if (error.response?.error_code === MagicApiErrorCode.LOGIN_THROTTLED) {
                loginContext.setLoginState({
                  ...loginContext,
                  utcRetrygateMs: parseInt(error.response.message.replace(/\D/g, ''), 10) * 1000,
                });

                router.replace('/send/rpc/auth/magic_auth_login_with_sms/throttled');
              } else if (error.response?.error_code === MagicApiErrorCode.DEVICE_NOT_VERIFIED) {
                AtomicRpcPayloadService.emitJsonRpcEventResponse(DeviceVerificationEventOnReceived.DeviceNeedsApproval);
                loginContext.setLoginState({
                  ...loginContext,
                  deviceVerificationLink: error.response.headers.location,
                });
                router.replace('/send/rpc/auth/magic_auth_login_with_sms/device_verification');
              }
            },
          },
        );
      } catch (error) {
        logger.error('Error starting login with SMS', error);
        router.replace('/send/rpc/auth/magic_auth_login_with_sms/error');
      }
    };

    if (isGoogleReCaptchaLoaded && phoneNumber && requestOriginMessage) {
      loginWithSmsStart();
    }
  }, [isGoogleReCaptchaLoaded, phoneNumber, requestOriginMessage, sdkMetaData?.webCryptoDpopJwt]);

  const renderComponent = () => {
    if (errorCode && errorCode !== MagicApiErrorCode.DEVICE_NOT_VERIFIED) {
      return (
        <>
          <Box mb={1}>
            <ApiErrorText errorCode={errorCode} />
          </Box>

          <Button
            size="md"
            variant="primary"
            label={t('Close')}
            onPress={() =>
              rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.InvalidPhoneNumber, smsStartError)
            }
          />
        </>
      );
    }

    return (
      <Center h={12}>
        <LoadingSpinner size={36} strokeWidth={4} />
      </Center>
    );
  };

  return (
    <>
      <Page.Icon>
        <IcoMessage />
      </Page.Icon>
      <Page.Content>
        <SmsContentHeader phoneNumber={phoneNumber} />
        <VStack gap={3} my={3}>
          {renderComponent()}
        </VStack>
      </Page.Content>
    </>
  );
}
