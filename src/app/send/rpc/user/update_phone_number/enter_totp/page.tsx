'use client';

import SmsContentHeader from '@app/send/rpc/auth/magic_auth_login_with_sms/__components__/sms-content-header';
import { useUpdatePhoneNumberContext } from '@app/send/rpc/user/update_phone_number/update-phone-number-context';
import { getQueryClient } from '@common/query-client';
import { useApiErrorText } from '@components/api-error-text';
import RequestNewOtpCode from '@components/request-otp-code/request-otp-code';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import {
  RecoveryMethodType,
  useCreateFactorMutation,
  useDeleteRecoveryFactorMutation,
  useFactorChallengeMutation,
  useFactorVerifyMutation,
  useGetRecoveryFactorsQuery,
} from '@hooks/data/embedded/account-recovery';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { RecoveryFactorEventEmit, RecoveryFactorEventOnReceived } from '@magic-sdk/types';
import { Button, Header, IcoDismiss, IcoMessage, Page, PinCodeInput, VerifyPincode } from '@magiclabs/ui-components';
import { ComponentProps, useEffect, useState } from 'react';

export default function EnterTotp() {
  const queryClient = getQueryClient();
  const authUserId = useStore(state => state.authUserId);
  const [showRequestOtpCode, setShowRequestOtpCode] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [utcRetrygateMs, setUtcRetryGateMs] = useState(new Date().getTime() + 30000);
  const router = useSendRouter();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const updatePhoneNumberContext = useUpdatePhoneNumberContext();
  const { userMetadata } = useUserMetadata();
  const recoveryPhoneNumber = userMetadata?.recoveryFactors.find(
    factor => factor.type === RecoveryMethodType.PhoneNumber,
  );
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { mutateAsync: verifyFactor, error, reset } = useFactorVerifyMutation();
  const errorMessage = useApiErrorText(error?.response?.error_code) ?? '';
  const { mutateAsync: factor } = useCreateFactorMutation();
  const { mutateAsync: challenge } = useFactorChallengeMutation();
  const { mutateAsync: getRecoveryFactor } = useGetRecoveryFactorsQuery();
  const { mutateAsync: deleteFactor } = useDeleteRecoveryFactorMutation();

  const deleteOldPhoneNumber = async () => {
    if (authUserId) {
      const recoveryFactorList = await getRecoveryFactor(authUserId);

      const { id } = Object.values(recoveryFactorList).find(f => f.type === RecoveryMethodType.PhoneNumber)!;

      await deleteFactor({ authUserId, factorId: id });
    }
  };
  const onPressSendNewCode = async () => {
    setShowRequestOtpCode(false);
    setUtcRetryGateMs(new Date().getTime() + 30000);
    const factorId = await factor({
      authUserId,
      value: updatePhoneNumberContext.newPhoneNumber,
      type: RecoveryMethodType.PhoneNumber,
      isRecoveryEnabled: true,
      isAuthenticatedEnabled: true,
      credential: updatePhoneNumberContext.updatePhoneNumberCredential,
    });

    const attemptId = await challenge({
      authUserId,
      factorId,
      credential: updatePhoneNumberContext.updatePhoneNumberCredential,
    });

    updatePhoneNumberContext.setUpdatePhoneNumberState({
      ...updatePhoneNumberContext,
      attemptId,
      newPhoneNumber: updatePhoneNumberContext.newPhoneNumber,
    });
    router.replace('/send/rpc/user/update_phone_number/enter_totp');
  };

  const onChangeOtp = () => {
    if (error) reset();
  };

  const onCompleteOtp: ComponentProps<typeof PinCodeInput>['onComplete'] = async (otp: string) => {
    setIsPending(true);
    try {
      const credential = await verifyFactor({
        attemptId: updatePhoneNumberContext.attemptId,
        authUserId,
        response: otp,
      });

      if (credential) {
        // delete old recovery phone number
        if (recoveryPhoneNumber || updatePhoneNumberContext.oldPhoneNumber) {
          await deleteOldPhoneNumber();
        }
        await queryClient.resetQueries({
          queryKey: [['user', 'info']],
        });
        router.replace(`/send/rpc/user/update_phone_number/done`);
      }
      setIsSuccess(true);
    } catch {
      setIsSuccess(false);
      setShowRequestOtpCode(true);
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoveryFactorEventOnReceived.InvalidOtpCode);
    }
    setIsPending(false);
  };
  useEffect(() => {
    if (showUI === false) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoveryFactorEventOnReceived.EnterOtpCode);
      AtomicRpcPayloadService.onEvent(RecoveryFactorEventEmit.SendOtpCode, (otp: unknown) => {
        onCompleteOtp(otp as string);
      });
    }
  }, []);
  const handleClose = () => {
    if (deeplinkPage) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
        closedByUser: true,
      });
    } else {
      router.replace('/send/rpc/user/magic_auth_settings');
    }
  };

  return (
    <Page backgroundType="blurred">
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
      <Page.Content>
        <SmsContentHeader phoneNumber={updatePhoneNumberContext.newPhoneNumber!} />
        <VerifyPincode
          originName="sms"
          pinLength={6}
          isPending={isPending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={onCompleteOtp}
          errorMessage={errorMessage}
        >
          <VerifyPincode.RetryContent>
            <RequestNewOtpCode
              isVisible={showRequestOtpCode}
              utcRetrygateMs={utcRetrygateMs}
              onPressSendNewCode={onPressSendNewCode}
            />
          </VerifyPincode.RetryContent>
        </VerifyPincode>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
