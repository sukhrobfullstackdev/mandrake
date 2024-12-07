'use client';

import { UpdateEmailHeader } from '@app/send/rpc/auth/magic_auth_update_email/__components__/update_email_header';
import { useUpdateEmailContext } from '@app/send/rpc/auth/magic_auth_update_email/update-email-context';
import { getQueryClient } from '@common/query-client';
import { useApiErrorText } from '@components/api-error-text';
import EmailOtpContentHeader from '@components/email-otp-content-header';
import PageFooter from '@components/show-ui/footer';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useVerifyUpdatedEmailMutation } from '@hooks/data/embedded/account-recovery';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { UpdateEmailEventEmit, UpdateEmailEventOnReceived } from '@magic-sdk/types';
import { IcoEmailOpen, Page, PinCodeInput, VerifyPincode } from '@magiclabs/ui-components';
import { usePathname } from 'next/navigation';
import { ComponentProps, useEffect } from 'react';

export default function UpdatedEmailEnterTotp() {
  const authUserId = useStore(state => state.authUserId);
  const queryClient = getQueryClient();
  const router = useSendRouter();
  const pathname = usePathname();

  const { attemptId, newEmail } = useUpdateEmailContext();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const { mutateAsync: verify, error, reset, isPending, isSuccess } = useVerifyUpdatedEmailMutation();
  const errorMessage = useApiErrorText(error?.response?.error_code) ?? '';

  const onChangeOtp = () => {
    if (error) reset();
  };

  const onCompleteOtp: ComponentProps<typeof PinCodeInput>['onComplete'] = async (otp: string) => {
    const credential = await verify({
      attemptId,
      response: otp,
      authUserId,
    });

    if (credential) {
      useStore.setState({
        email: newEmail,
      });
      await queryClient.resetQueries({
        queryKey: [['user', 'info']],
      });
      AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.EmailUpdated);
      router.replace('/send/rpc/auth/magic_auth_update_email/done');
    }
  };

  useEffect(() => {
    // Todo PDEEXP - 1850 abstract this to handle general email otp errors.
    if (error?.response?.error_code === MagicApiErrorCode.INCORRECT_VERIFICATION_CODE) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.InvalidEmailOtp);
    } else if (error?.response?.error_code === MagicApiErrorCode.VERIFICATION_CODE_EXPIRED) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(UpdateEmailEventOnReceived.EmailExpired);
    } else if (error?.response?.error_code) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, error?.response?.message);
    }
  }, [error]);

  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
    AtomicRpcPayloadService.onEvent(UpdateEmailEventEmit.VerifyEmailOtp, (otp: unknown) => {
      onCompleteOtp(otp as string);
    });
  }, []);

  return (
    <Page backgroundType="blurred">
      <UpdateEmailHeader />
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailOtpContentHeader email={newEmail} />
        <VerifyPincode
          pinLength={6}
          isPending={isPending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={onCompleteOtp}
          errorMessage={errorMessage}
        />
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
