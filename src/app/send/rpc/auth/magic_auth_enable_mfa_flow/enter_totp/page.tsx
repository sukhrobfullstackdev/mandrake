'use client';
import EnterMfaTotp from '@components/mfa/enter-mfa-totp';
import { useAppName } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useFinishTemporaryOtpEnrollMutation } from '@hooks/data/embedded/mfa';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { EnableMFAEventEmit, EnableMFAEventOnReceived } from '@magic-sdk/types';
import { useEffect } from 'react';

const EnableMfaTotpPage = () => {
  const router = useSendRouter();
  const authUserId = useStore(state => state.authUserId);
  const authUserSessionToken = useStore(state => state.authUserSessionToken);

  const { mutate, isPending, isSuccess, error, reset } = useFinishTemporaryOtpEnrollMutation();
  const mfaEnrollInfo = useStore(state => state.mfaEnrollInfo);
  const mfaEnrollSecret = useStore(state => state.mfaEnrollSecret);
  const appName = useAppName();

  const onChangeOtp = () => {
    // if a user types in the input, we need to reset the error state
    if (error) reset();
  };

  const onCompleteOtp = (totp: string) => {
    if (authUserId && authUserSessionToken && mfaEnrollInfo) {
      mutate(
        { authUserId, jwt: authUserSessionToken, totp, mfaInfo: mfaEnrollInfo },
        {
          onSuccess: response => {
            useStore.setState({ mfaRecoveryCodes: response.recoveryCodes });
            router.replace('/send/rpc/auth/magic_auth_enable_mfa_flow/recovery_codes');
          },
          onError: err => {
            AtomicRpcPayloadService.emitJsonRpcEventResponse(EnableMFAEventOnReceived.InvalidMFAOtp, [
              {
                errorCode: err.response?.error_code,
              },
            ]);
          },
        },
      );
    }
  };

  const onPressLostDevice = () => {
    router.replace('/send/rpc/auth/magic_auth_enable_mfa_flow/recovery_codes');
  };

  useEffect(() => {
    if (!mfaEnrollSecret) return;
    // Ensure event listener for the verify-mfa-code event is attched before sending mfa-secret-generated event
    AtomicRpcPayloadService.onEvent(EnableMFAEventEmit.VerifyMFACode, (otp: unknown) => {
      onCompleteOtp(otp as string);
    });

    AtomicRpcPayloadService.emitJsonRpcEventResponse(EnableMFAEventOnReceived.MFASecretGenerated, [
      {
        QRCode: `otpauth://totp/${encodeURIComponent(appName)}?secret=${mfaEnrollSecret}`,
        key: mfaEnrollSecret,
      },
    ]);
  }, [mfaEnrollSecret]);

  return (
    <EnterMfaTotp
      onCompleteOtp={onCompleteOtp}
      onChangeOtp={onChangeOtp}
      onPressLostDevice={onPressLostDevice}
      isPending={isPending}
      isSuccess={isSuccess}
      errorCode={error?.response?.error_code}
      showLostDeviceButton={false}
    />
  );
};

export default EnableMfaTotpPage;
