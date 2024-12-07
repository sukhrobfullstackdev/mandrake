'use client';
import { useLoginContext } from '@app/send/login-context';
import EnterMfaTotp from '@components/mfa/enter-mfa-totp';
import { MagicApiErrorCode } from '@constants/error';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useVerifyTemporaryOtpMutation } from '@hooks/data/embedded/mfa';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { LoginWithEmailOTPEventOnReceived } from '@magic-sdk/types';

interface EnforceMFAProps {
  onSuccess: () => void;
  onPressLostDevice: () => void;
  showLostDeviceButton: boolean;
  showCloseButton?: boolean;
  skipPersist?: boolean;
}

const EnforceMFA = ({
  onSuccess,
  onPressLostDevice,
  showLostDeviceButton,
  showCloseButton,
  skipPersist = false,
}: EnforceMFAProps) => {
  const { sdkMetaData } = useStore(state => state);
  const jwt = (sdkMetaData?.webCryptoDpopJwt as string) || '';
  const { loginFlowContext, requestOriginMessage } = useLoginContext();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const email = activeRpcPayload?.params?.[0]?.email as string;

  const {
    mutate: verifyTemporaryTotp,
    isPending: isPendingVerifyTemporaryTotp,
    error: errorVerifyTemporaryTotp,
    reset: resetVerifyTemporaryTotp,
    isSuccess: isSuccessVerifyTemporaryTotp,
  } = useVerifyTemporaryOtpMutation();

  const onChangeOtp = () => {
    // if a user types in the input, we need to reset the error state
    if (errorVerifyTemporaryTotp) resetVerifyTemporaryTotp();
  };

  const onCompleteOtp = (oneTimeCode: string) => {
    if (loginFlowContext) {
      verifyTemporaryTotp(
        {
          totp: oneTimeCode,
          loginFlowContext,
          jwt,
        },
        {
          onSuccess: async response => {
            if (!skipPersist) {
              const { authUserId, authUserSessionToken, refreshToken } = response;
              await hydrateAndPersistAuthState({
                email,
                authUserId,
                authUserSessionToken,
                refreshToken: refreshToken || '',
                requestOriginMessage,
              });

              useStore.setState({
                authUserId: response.authUserId,
                authUserSessionToken: response.authUserSessionToken,
                sdkMetaData: { ...sdkMetaData, userSessionRefreshToken: response.refreshToken ?? '' },
              });
            }
            onSuccess();
          },

          onError: (err: ApiResponseError) => {
            if (err.response?.error_code === MagicApiErrorCode.INCORRECT_TWO_FA_CODE) {
              if (activeRpcPayload) {
                AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.InvalidMfaOtp);
              }
            }
          },
        },
      );
    }
  };

  return (
    <EnterMfaTotp
      onCompleteOtp={onCompleteOtp}
      onChangeOtp={onChangeOtp}
      onPressLostDevice={onPressLostDevice}
      isPending={isPendingVerifyTemporaryTotp}
      isSuccess={isSuccessVerifyTemporaryTotp}
      errorCode={errorVerifyTemporaryTotp?.response?.error_code}
      showLostDeviceButton={showLostDeviceButton}
      showCloseButton={showCloseButton}
    />
  );
};

export default EnforceMFA;
