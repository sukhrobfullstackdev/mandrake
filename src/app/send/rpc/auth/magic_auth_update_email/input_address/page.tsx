'use client';

import { UpdateEmailHeader } from '@app/send/rpc/auth/magic_auth_update_email/__components__/update_email_header';
import { useUpdateEmailContext } from '@app/send/rpc/auth/magic_auth_update_email/update-email-context';
import PageFooter from '@components/show-ui/footer';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useAppName } from '@hooks/common/client-config';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import {
  RecoveryMethodType,
  useCreateFactorMutation,
  useEmailUpdateChallengeMutation,
} from '@hooks/data/embedded/account-recovery';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { isValidEmail } from '@lib/utils/validators';
import { MagicPayloadMethod, UpdateEmailEventEmit, UpdateEmailEventOnReceived } from '@magic-sdk/types';
import { Button, IcoEditEmail, Page, Text, TextInput } from '@magiclabs/ui-components';
import { IFrameMessageService } from '@message-channel/iframe/iframe-message-service';
import { css } from '@styled/css';
import { Box, Flex, VStack } from '@styled/jsx';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function useSendEmailOtp() {
  const authUserId = useStore(state => state.authUserId);
  const { updateEmailCredential } = useUpdateEmailContext();
  const { t } = useTranslation('send');

  const { mutateAsync: factor } = useCreateFactorMutation();
  const { mutateAsync: challenge } = useEmailUpdateChallengeMutation();

  const sendEmailOtp = async (email: string) => {
    let error = null;
    let attemptId = '';
    try {
      const factorId = await factor({ authUserId, value: email, type: RecoveryMethodType.EmailAddress });
      attemptId = await challenge({ authUserId, factorId, credential: updateEmailCredential });
    } catch (err) {
      const apiResponseError = err as ApiResponseError;
      const errorCode = apiResponseError.response?.error_code;

      switch (errorCode) {
        case MagicApiErrorCode.ACCOUNT_ALREADY_EXISTS:
          AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.EmailAlreadyExists);
          error = t('Email already exists');
          break;
        case MagicApiErrorCode.ENHANCED_EMAIL_VALIDATION:
          error = apiResponseError.message;
          AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.EmailNotDeliverable);
          break;
        case MagicApiErrorCode.MALFORMED_EMAIL:
          AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.InvalidEmail);
          error = t('Invalid email address');
          break;
        default:
          AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.EmailNotDeliverable);
          error = t('Unknown error');
          break;
      }
    }

    return { attemptId, error };
  };

  return sendEmailOtp;
}

export default function UpdateEmailInputAddress() {
  const router = useSendRouter();
  const pathname = usePathname();
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const [emailState, setEmail] = useState(activeRpcPayload?.params?.[0]?.email || '');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const updateEmailContext = useUpdateEmailContext();
  const appName = useAppName();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const method = activeRpcPayload?.method;
  const sendEmailOtp = useSendEmailOtp();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const onNextPress = async (newEmail?: string) => {
    const email = newEmail || emailState;
    if (!isValidEmail(email)) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.InvalidEmail);
      setError(t('Please enter a valid email address'));
      return;
    }

    setIsLoading(true);
    const { attemptId, error: factorError } = await sendEmailOtp(email);

    setIsLoading(false);

    if (factorError) {
      setError(factorError);
      return;
    }

    AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.EmailSent);

    updateEmailContext.setUpdateEmailState({
      ...updateEmailContext,
      newEmail: email,
      attemptId,
    });

    router.replace('/send/rpc/auth/magic_auth_update_email/updated_email_totp');
  };

  useEffect(() => {
    AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.NewAuthFactorNeedsVerification);
    if (showUI || showUI === undefined) {
      IFrameMessageService.showOverlay();
    } else {
      AtomicRpcPayloadService.onEvent(UpdateEmailEventEmit.RetryWithNewEmail, (newEmail: unknown) => {
        onNextPress(newEmail as string);
      });
      onNextPress();
    }
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
  }, []);

  const onClose = () => {
    if (method === MagicPayloadMethod.UserSettings && !deeplinkPage) {
      router.replace('/send/rpc/user/magic_auth_settings');
    } else {
      rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
    }
  };

  return (
    <Page backgroundType="blurred">
      <UpdateEmailHeader />
      <Page.Icon>
        <IcoEditEmail />
      </Page.Icon>
      <Page.Content>
        <VStack>
          <Text.H4>{t('Update email address')}</Text.H4>
          <Box my={3}>
            <Text styles={{ textAlign: 'center' }}>
              {t('This will be used to log in to your {{appName}} account going forward', { appName })}
            </Text>
          </Box>
          <TextInput
            aria-label={t('Email address')}
            onChange={v => {
              setEmail(v);
              setError(undefined);
            }}
            value={emailState}
            errorMessage={error}
            className={css({ w: 'full' })}
            placeholder={t('Email address')}
          />
          <Flex gap={6} w="full" mt={4}>
            <Button expand label={t('Cancel')} variant="neutral" onPress={onClose} />
            <Button
              validating={isLoading}
              disabled={isLoading}
              onPress={() => onNextPress()}
              expand
              label={t('Next')}
            />
          </Flex>
        </VStack>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
