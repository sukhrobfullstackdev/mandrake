'use client';

import { useApiErrorText } from '@components/api-error-text';
import EmailOtpContentHeader from '@components/email-otp-content-header';
import PageFooter from '@components/show-ui/footer';
import { MagicApiErrorCode } from '@constants/error';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import {
  useCreateFactorMutation,
  useFactorChallengeMutation,
  useFactorVerifyMutation,
} from '@hooks/data/embedded/account-recovery';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { RecencyCheckEventEmit, RecencyCheckEventOnReceived } from '@magic-sdk/types';
import { Button, Header, IcoDismiss, IcoEmailOpen, Page, PinCodeInput, VerifyPincode } from '@magiclabs/ui-components';
import { IFrameMessageService } from '@message-channel/iframe/iframe-message-service';
import { usePathname } from 'next/navigation';
import { ComponentProps, useEffect, useState } from 'react';

interface PrimaryFactorRecencyCheckProps {
  onSuccess: (credential: string, factorId: string) => void;
  onClosePress: () => void;
}

function useAuthFactorAttemptId() {
  const authUserId = useStore(state => state.authUserId);
  const [attemptId, setAttemptId] = useState('');
  const [factorId, setFactorId] = useState('');
  const email = useStore(state => state.email);

  const { mutateAsync: factor, error: factorError } = useCreateFactorMutation();
  const { mutateAsync: challenge } = useFactorChallengeMutation();

  const sendEmailOtp = async () => {
    const factorIdResponse = await factor({ authUserId, value: email, type: 'email_address' });
    AtomicRpcPayloadService.emitJsonRpcEventResponse(RecencyCheckEventOnReceived.EmailSent);
    setFactorId(factorIdResponse);
    setAttemptId(await challenge({ authUserId, factorId: factorIdResponse }));
  };

  useEffect(() => {
    if (factorError) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecencyCheckEventOnReceived.EmailNotDeliverable);
    }
  }, [factorError]);

  useEffect(() => {
    sendEmailOtp();
  }, []);

  return { attemptId, factorId, retry: sendEmailOtp };
}

export default function PrimaryFactorRecencyCheck({ onSuccess, onClosePress }: PrimaryFactorRecencyCheckProps) {
  const pathname = usePathname();
  const authUserId = useStore(state => state.authUserId);
  const email = useStore(state => state.email);

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const showUI = activeRpcPayload?.params?.[0]?.showUI;

  const { attemptId, factorId, retry } = useAuthFactorAttemptId();
  const { mutateAsync: verifyFactor, error, reset, isPending, isSuccess } = useFactorVerifyMutation();
  const errorMessage = useApiErrorText(error?.response?.error_code) ?? '';

  const onChangeOtp = () => {
    if (error) reset();
  };

  const onCompleteOtp: ComponentProps<typeof PinCodeInput>['onComplete'] = async (otp: string) => {
    const credential = await verifyFactor({
      attemptId,
      authUserId,
      response: otp,
    });

    if (credential) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecencyCheckEventOnReceived.PrimaryAuthFactorVerified);
      onSuccess(credential, factorId);
    }
  };

  useEffect(() => {
    if (error?.response?.error_code === MagicApiErrorCode.INCORRECT_VERIFICATION_CODE) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecencyCheckEventOnReceived.InvalidEmailOtp);
    } else if (error?.response?.error_code === MagicApiErrorCode.VERIFICATION_CODE_EXPIRED) {
      AtomicRpcPayloadService.emitJsonRpcEventResponse(RecencyCheckEventOnReceived.EmailExpired);
    }
  }, [error]);

  // Placing onEvent here ensures that the event handler has access to attemptId and factorId.
  // If it’s included in the initial load of the component, the onCompleteOtp function may not be able to access the required state
  useEffect(() => {
    if (!attemptId || !factorId) return;
    AtomicRpcPayloadService.onEvent(RecencyCheckEventEmit.VerifyEmailOtp, (otp: unknown) => {
      onCompleteOtp(otp as string);
    });
  }, [attemptId, factorId]);

  useEffect(() => {
    AtomicRpcPayloadService.emitJsonRpcEventResponse(RecencyCheckEventOnReceived.PrimaryAuthFactorNeedsVerification);
    if (showUI || showUI === undefined) {
      IFrameMessageService.showOverlay();
    } else {
      AtomicRpcPayloadService.onEvent(RecencyCheckEventEmit.Cancel, () =>
        rejectActiveRpcRequest(RpcErrorCode.RequestCancelled, RpcErrorMessage.UserCanceledAction),
      );
      AtomicRpcPayloadService.onEvent(RecencyCheckEventEmit.Retry, () => {
        retry();
      });
    }
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
  }, []);

  return (
    <Page backgroundType="blurred">
      <Page.Header>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={onClosePress} aria-label="close">
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Icon>
        <IcoEmailOpen />
      </Page.Icon>
      <Page.Content>
        <EmailOtpContentHeader email={email!} />
        <VerifyPincode
          originName="email"
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
