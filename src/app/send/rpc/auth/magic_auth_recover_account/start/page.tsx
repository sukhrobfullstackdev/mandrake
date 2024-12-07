'use client';
import { useLoginContext } from '@app/send/login-context';
import { SmsRecoverContentHeader } from '@app/send/rpc/auth/magic_auth_recover_account/__components__/sms-recover-content-header';
import {
  RecoveryFactorListResponse,
  useGetFactorMutation,
  useSendSmsMutation,
  useVerifyOtpMutation,
} from '@app/send/rpc/auth/magic_auth_recover_account/__hooks__/sms-recovery-attempt';
import { useApiErrorText } from '@components/api-error-text';
import RequestNewOtpCode from '@components/request-otp-code/request-otp-code';
import PageFooter from '@components/show-ui/footer';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { RecoverAccountEventEmit, RecoverAccountEventOnReceived, RecoveryMethodType } from '@magic-sdk/types';
import { Button, Header, IcoDismiss, IcoMessage, LoadingSpinner, Page, VerifyPincode } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect, useState } from 'react';

export default function RecoverAccountStart() {
  const router = useSendRouter();
  const { t } = useTranslation('send');
  const loginContext = useLoginContext();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const { email } = activeRpcPayload?.params?.[0] || {};

  const [utcRetrygateMs, setUtcRetryGateMs] = useState<null | number>();

  const {
    data: recoveryFactorList,
    mutate: getFactorId,
    isPending: isFactorIdLoading,
    failureCount: factorFailureCount,
  } = useGetFactorMutation();

  const { data: sendSmsResponse, mutate: sendSms, isPending: isSendingSms } = useSendSmsMutation();

  const {
    mutate: verifySms,
    error: verifySmsError,
    isPending: isVerifyingSms,
    reset: resetVerifyError,
    isSuccess: isSmsVerified,
  } = useVerifyOtpMutation();

  const activeSmsRecoveryFactor = Object.values(recoveryFactorList || {})?.find(
    factor => factor.type === RecoveryMethodType.PhoneNumber,
  );
  const errorMessage = useApiErrorText(verifySmsError?.response?.error_code) ?? '';
  const showRequestNewSms = Boolean(
    !(isFactorIdLoading || isSendingSms || isVerifyingSms || isSmsVerified) && utcRetrygateMs,
  );

  function onSendNewSms(factorList?: RecoveryFactorListResponse) {
    const activeFactor = Object.values(factorList || {})?.find(
      factor => factor.type === RecoveryMethodType.PhoneNumber,
    );

    if (!activeFactor) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.NoRecoveryMethodFound);
      return;
    }

    resetVerifyError();

    sendSms(
      { factorId: activeFactor.factorId },
      {
        onSuccess() {
          setUtcRetryGateMs(new Date().getTime() + 30000);
        },
        onError: error => {
          const apiResponseError = error as ApiResponseError;
          const errorCode = apiResponseError.response?.error_code;

          if (errorCode === MagicApiErrorCode.LOGIN_THROTTLED) {
            loginContext.setLoginState({
              ...loginContext,
              utcRetrygateMs: parseInt(apiResponseError.response?.message.replace(/\D/g, '') || '30', 10) * 1000,
            });

            AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.LoginThrottled);

            router.replace(`/send/rpc/auth/${activeRpcPayload?.method}/throttled`);
          } else {
            rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
          }
        },
      },
    );
  }

  function onCompleteOtp(otp: string) {
    if (!sendSmsResponse?.attemptId) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
      return;
    }

    if (otp.length < 6) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.InvalidSmsOtp, [
        {
          errorMessage: 'Invalid code, please try again.',
          errorCode: MagicApiErrorCode.INCORRECT_VERIFICATION_CODE,
        },
      ]);
      return;
    }

    verifySms(
      { attemptId: sendSmsResponse?.attemptId, otp },
      {
        onSuccess: async result => {
          await hydrateAndPersistAuthState(result);

          if (activeRpcPayload) {
            activeRpcPayload.params[0].credential = result.credential;
          }

          AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.SmsVerified);
          router.replace(`/send/rpc/auth/${activeRpcPayload?.method}/account-recovered`);
        },
        onError: error => {
          const apiError = error as ApiResponseError;

          AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.InvalidSmsOtp, [
            {
              errorMessage: apiError.response?.message || 'Invalid code, please try again.',
              errorCode: apiError.response?.error_code || MagicApiErrorCode.INCORRECT_VERIFICATION_CODE,
            },
          ]);
        },
      },
    );
  }

  function handleClose() {
    rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserRejectedAction);
  }

  function renderContent() {
    if (isFactorIdLoading) {
      return (
        <VStack mt={12} mb={24}>
          <LoadingSpinner />
        </VStack>
      );
    }

    return (
      <>
        <SmsRecoverContentHeader phoneNumber={activeSmsRecoveryFactor?.value || ''} />
        <VerifyPincode
          originName="sms"
          pinLength={6}
          isPending={isVerifyingSms || isSendingSms}
          isSuccess={isSmsVerified}
          onChange={resetVerifyError}
          onComplete={onCompleteOtp}
          errorMessage={errorMessage}
        >
          <VerifyPincode.RetryContent>
            <VStack>
              <RequestNewOtpCode
                isVisible={showRequestNewSms}
                utcRetrygateMs={utcRetrygateMs || 0}
                onPressSendNewCode={() => onSendNewSms(recoveryFactorList)}
              />
              <Button
                variant="text"
                onPress={() => {
                  router.replace(`/send/rpc/auth/${activeRpcPayload?.method}/contact-support`);
                }}
                label={t('Need help?')}
              />
            </VStack>
          </VerifyPincode.RetryContent>
        </VerifyPincode>
      </>
    );
  }

  useEffect(() => {
    getFactorId(
      { email },
      {
        onSuccess: data => {
          onSendNewSms(data);
        },
        onError: error => {
          const apiResponseError = error as ApiResponseError;
          const errorCode = apiResponseError.response?.error_code;

          if (errorCode === MagicApiErrorCode.RESOURCE_NOT_FOUND) {
            rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.UserNotFound);
          } else {
            if (factorFailureCount > 2) {
              rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
            }
          }
        },
      },
    );
  }, []);

  useEffect(() => {
    if (sendSmsResponse?.attemptId) {
      AtomicRpcPayloadService.onEvent(RecoverAccountEventEmit.VerifyOtp, otp => onCompleteOtp(otp as string));
      AtomicRpcPayloadService.onEvent(RecoverAccountEventEmit.ResendSms, () => onSendNewSms(recoveryFactorList));

      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.SmsOtpSent, [
        { phoneNumber: activeSmsRecoveryFactor?.value },
      ]);
    }
  }, [sendSmsResponse]);

  return (
    <>
      <Page.Header>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose} aria-label="close">
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Icon>
        <IcoMessage />
      </Page.Icon>
      <Page.Content>{renderContent()}</Page.Content>
      <PageFooter />
    </>
  );
}
