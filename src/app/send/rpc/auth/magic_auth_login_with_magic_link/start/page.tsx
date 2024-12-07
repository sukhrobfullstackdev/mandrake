'use client';

import { useLoginContext } from '@app/send/login-context';
import EmailLinkContentHeader from '@app/send/rpc/auth/magic_auth_login_with_magic_link/__components__/email-link-content-header';
import { useTranslation } from '@common/i18n';
import ApiErrorText from '@components/api-error-text';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useEmailLinkPoller } from '@hooks/common/email-link';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { LoginWithEmailLinkStartResponse, useSendEmailLinkStartQuery } from '@hooks/data/embedded/email-link';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { createRandomString } from '@lib/utils/crypto';
import {
  DeviceVerificationEventOnReceived,
  LoginWithMagicLinkEventEmit,
  LoginWithMagicLinkEventOnReceived,
} from '@magic-sdk/types';
import { Button, IcoEmailOpen, LoadingSpinner, Page, SecurityOtp, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { copyToClipboard } from '@utils/copy';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function LoginWithEmailLinkStart() {
  const [pollerEnabled, setPollerEnabled] = useState(false);
  const [securityOtp, setSecurityOtp] = useState('');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const sdkMetaData = useStore(state => state.sdkMetaData);
  const loginContext = useLoginContext();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { t } = useTranslation('send');
  const pathname = usePathname();

  const email = activeRpcPayload?.params?.[0]?.email as string;
  const redirectURI = activeRpcPayload?.params?.[0]?.redirectURI as string;
  const showUI = activeRpcPayload?.params?.[0]?.showUI as string;

  const { isEmailLinkExpired, isEmailLinkVerified, isEmailLinkRedirected } = useEmailLinkPoller({
    email,
    enabled: pollerEnabled,
  });

  const requestOriginMessage = useMemo(() => createRandomString(128), []);
  const router = useSendRouter();
  const { mutate: mutateSendEmailLinkStart, error: sendEmailLinkStartError } = useSendEmailLinkStartQuery();

  const loginWithEmailLinkStart = () => {
    try {
      mutateSendEmailLinkStart(
        { email, redirectURI, jwt: sdkMetaData?.webCryptoDpopJwt, requestOriginMessage },
        {
          onSuccess: (response: LoginWithEmailLinkStartResponse) => {
            const { oneTimePasscode, ...restOfResponse } = response;
            loginContext.setLoginState({
              ...loginContext,
              ...restOfResponse,
              requestOriginMessage,
            });
            useStore.setState({ systemClockOffset: response.utcTimestampMs - Date.now() });
            AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithMagicLinkEventOnReceived.EmailSent, [
              { security_otp: oneTimePasscode },
            ]);
            AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
            setPollerEnabled(true);
            setSecurityOtp(oneTimePasscode);
          },
          onError: (error: ApiResponseError) => {
            AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithMagicLinkEventOnReceived.EmailNotDeliverable);
            switch (error.response?.error_code) {
              case MagicApiErrorCode.MALFORMED_EMAIL:
              case MagicApiErrorCode.ENHANCED_EMAIL_VALIDATION:
                rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
                break;
              case MagicApiErrorCode.LOGIN_THROTTLED:
              case MagicApiErrorCode.AUTH_PASSWORDLESS_LOGIN_EMAIL_SENT:
                router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/try_again');
                break;
              case MagicApiErrorCode.DEVICE_NOT_VERIFIED:
                AtomicRpcPayloadService.emitJsonRpcEventResponse(DeviceVerificationEventOnReceived.DeviceNeedsApproval);
                loginContext.setLoginState({
                  ...loginContext,
                  deviceVerificationLink: error.response.headers.location,
                });
                router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/device_verification');
                break;
            }
          },
        },
      );
    } catch (error) {
      logger.error('error', error);
      // TODO handle error
    }
  };

  useEffect(() => {
    if (isEmailLinkExpired) {
      router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/expired');
    }
    if (isEmailLinkVerified) {
      router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/wallet');
    }
    if (isEmailLinkRedirected) {
      router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/redirect_login_complete');
    }
  }, [isEmailLinkExpired, isEmailLinkVerified, isEmailLinkRedirected]);

  const renderError = () => {
    if (
      sendEmailLinkStartError &&
      sendEmailLinkStartError?.response?.error_code !== MagicApiErrorCode.DEVICE_NOT_VERIFIED &&
      sendEmailLinkStartError?.response?.error_code !== MagicApiErrorCode.AUTH_PASSWORDLESS_LOGIN_EMAIL_SENT
    ) {
      return (
        <>
          <Box mb={1}>
            <ApiErrorText errorCode={sendEmailLinkStartError?.response?.error_code} />
          </Box>
          <Button
            size="md"
            variant="primary"
            label="Close"
            onPress={() =>
              rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
                closedByUser: true,
              })
            }
          />
        </>
      );
    }
    return null;
  };

  useEffect(() => {
    if (showUI || showUI === undefined) {
      AtomicRpcPayloadService.onEvent(LoginWithMagicLinkEventEmit.Retry, () => {
        loginWithEmailLinkStart();
      });
    }
    if (email && requestOriginMessage) {
      loginWithEmailLinkStart();
    } else {
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MalformedEmail);
    }
  }, []);

  return (
    <>
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailLinkContentHeader email={email} />
        {sendEmailLinkStartError && <VStack gap={4}>{renderError()}</VStack>}
        {!redirectURI && securityOtp && !sendEmailLinkStartError ? (
          pollerEnabled ? (
            <VStack>
              <Text>{t('Then enter this security code')}:</Text>
              <SecurityOtp
                color={token('colors.brand.base')}
                otp={securityOtp}
                onCopy={(value: string) => copyToClipboard(value)}
              />
            </VStack>
          ) : (
            <VStack gap={3} my={3}>
              <LoadingSpinner size={36} strokeWidth={4} />
            </VStack>
          )
        ) : null}
      </Page.Content>
    </>
  );
}
