'use client';

import { useLoginContext } from '@app/send/login-context';
import { useTranslation } from '@common/i18n';
import ApiErrorText from '@components/api-error-text';
import EmailOtpContentHeader from '@components/email-otp-content-header';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useEmailFromPayloadOrSearchParams } from '@hooks/common/email-from-payload-or-search-params';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useSendEmailOtpStartQuery } from '@hooks/data/embedded/email-otp';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { createRandomString } from '@lib/utils/crypto';
import { DeviceVerificationEventOnReceived } from '@magic-sdk/types';
import { Button, IcoEmailOpen, LoadingSpinner, Page } from '@magiclabs/ui-components';
import { Box, Center, VStack } from '@styled/jsx';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginWithEmailOtpStart() {
  const pathname = usePathname();
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const sdkMetaData = useStore(state => state.sdkMetaData);
  const loginContext = useLoginContext();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const email = useEmailFromPayloadOrSearchParams();
  const overrides = activeRpcPayload?.params?.[0]?.overrides as { variation: string };

  const [requestOriginMessage] = useState(createRandomString(128));
  const router = useSendRouter();
  const { mutateAsync: mutateSendEmailOtpStartAsync, error: sendEmailOtpStartError } = useSendEmailOtpStartQuery();

  const doLoginWithEmailOtpStart = async () => {
    try {
      const response = await mutateSendEmailOtpStartAsync({
        email,
        jwt: sdkMetaData?.webCryptoDpopJwt,
        requestOriginMessage,
        overrides,
      });
      loginContext.setLoginState({
        ...response,
        emailFromPayload: email,
        requestOriginMessage,
        showCloseButton: true,
      });
      useStore.setState({ systemClockOffset: response.utcTimestampMs - Date.now() });

      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

      router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/verify_otp_code');
    } catch (error: unknown) {
      const apiResponseError = error as ApiResponseError;
      if (
        apiResponseError.response?.error_code === MagicApiErrorCode.MALFORMED_EMAIL ||
        apiResponseError.response?.error_code === MagicApiErrorCode.ENHANCED_EMAIL_VALIDATION
      ) {
        if (activeRpcPayload?.params[0].showUI === false) {
          rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
        }
      } else if (apiResponseError.response?.error_code === MagicApiErrorCode.LOGIN_THROTTLED) {
        router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/throttled');
      } else if (apiResponseError.response?.error_code === MagicApiErrorCode.DEVICE_NOT_VERIFIED) {
        AtomicRpcPayloadService.emitJsonRpcEventResponse(DeviceVerificationEventOnReceived.DeviceNeedsApproval);
        loginContext.setLoginState({
          ...loginContext,
          deviceVerificationLink: apiResponseError.response?.headers.location,
        });
        router.replace('/send/rpc/auth/magic_auth_login_with_email_otp/device_verification');
      }
    }
  };

  useEffect(() => {
    doLoginWithEmailOtpStart();
  }, []);

  const renderComponent = () => {
    if (
      sendEmailOtpStartError &&
      sendEmailOtpStartError?.response?.error_code !== MagicApiErrorCode.DEVICE_NOT_VERIFIED
    ) {
      return (
        <>
          <Box mb={1}>
            <ApiErrorText errorCode={sendEmailOtpStartError?.response?.error_code} />
          </Box>

          <Button
            size="md"
            variant="primary"
            label={t('Close')}
            onPress={() =>
              rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
                closedByUser: true,
              })
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
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailOtpContentHeader email={email} />
        <VStack gap={3} my={3}>
          {renderComponent()}
        </VStack>
      </Page.Content>
    </>
  );
}
