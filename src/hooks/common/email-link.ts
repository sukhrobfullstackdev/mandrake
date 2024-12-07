import { useLoginContext } from '@app/send/login-context';
import { MagicApiErrorCode } from '@constants/error';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useSendRouter } from '@hooks/common/send-router';
import { useEmailLinkStatusPollerQuery } from '@hooks/data/embedded/email-link';
import { EmailLinkStatusResponse } from '@hooks/data/embedded/email-link/fetchers';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { useIsMobileSDK } from '@utils/platform';
import { useEffect, useState } from 'react';

type UseEmailLinkPollerParams = {
  enabled?: boolean;
  email: string;
};

export const useEmailLinkPoller = ({ email, enabled }: UseEmailLinkPollerParams) => {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const redirectURI = activeRpcPayload?.params?.[0]?.redirectURI as string;
  const [isEmailLinkExpired, setIsEmailLinkExpired] = useState(false);
  const [isEmailLinkVerified, setIsEmailLinkVerified] = useState(false);
  const [isEmailLinkRedirected, setIsEmailLinkRedirected] = useState(false);
  const sdkMetaData = useStore(state => state.sdkMetaData);
  const router = useSendRouter();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const { loginFlowContext, requestOriginMessage } = useLoginContext();
  // const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  // Define the expiration duration and start time
  const expirationDuration = 20 * 60 * 1000; // 20 minutes in milliseconds
  const startTime = Date.now();

  if (Date.now() - startTime > expirationDuration) {
    setIsEmailLinkExpired(true);
  }

  const { data: response, error: pollerError } = useEmailLinkStatusPollerQuery(
    {
      email,
      requestOriginMessage,
      jwt: sdkMetaData?.webCryptoDpopJwt,
      loginFlowContext,
    },
    {
      enabled: !!email && !isEmailLinkVerified && !isEmailLinkExpired && enabled,
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true, // Continue polling in the background
    },
  );

  useEffect(() => {
    if (pollerError?.response?.error_code === MagicApiErrorCode.REDIRECT_CONTEXT_LOGIN_COMPLETED) {
      setIsEmailLinkRedirected(true);
    }
  }, [pollerError?.response?.error_code]);

  useEffect(() => {
    // Login Successfully
    const handleRedirectLoginAsync = async (res: EmailLinkStatusResponse) => {
      const isRedirectEnabled = Boolean(redirectURI);
      if (isRedirectEnabled) {
        setIsEmailLinkRedirected(true);
      } else {
        await hydrateAndPersistAuthState({
          email,
          authUserId: res.authUserId,
          authUserSessionToken: res.authUserSessionToken,
          refreshToken: res.refreshToken || '',
          requestOriginMessage,
        });
        setIsEmailLinkVerified(true);
        return router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/wallet');
      }
    };
    if (response && response?.authUserId) {
      handleRedirectLoginAsync(response);
    }
  }, [response]);

  return {
    isEmailLinkExpired,
    isEmailLinkVerified,
    isEmailLinkRedirected,
  };
};

/**
 * This is used for security otp check for email link login
 */
export const useOverrideEmailLinkRpcPayload = (activeRpcPayload: JsonRpcRequestPayload | null) => {
  const [isPayloadUpdated, setIsPayloadUpdated] = useState(false);
  const [updatedPayload, setUpdatedPayload] = useState(activeRpcPayload);

  const isMobileSdk = useIsMobileSDK();

  useEffect(() => {
    if (!activeRpcPayload) return;
    // it's ok to not deepclone, as we need to mutate it anyway
    const clonePayload = activeRpcPayload;
    const [{ redirectURI, ...rest }] = activeRpcPayload.params || [];

    if (!redirectURI || isMobileSdk) {
      clonePayload.params = [
        {
          ...rest,
          redirectURI: isMobileSdk ? undefined : redirectURI,
          showUI: true,
        },
      ];
    }

    // Set the modified clone as the new active payload
    AtomicRpcPayloadService.setActiveRpcPayload(clonePayload);

    setUpdatedPayload(clonePayload);
    setIsPayloadUpdated(true);
  }, [activeRpcPayload]);

  return {
    isPayloadUpdated,
    updatedPayload,
  };
};

/**
 * timer countdown hook in second
 * @param initialSeconds
 */
export function useCountdownTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const isRunning = secondsLeft > 0;

  useEffect(() => {
    // Only set up the interval if there are seconds remaining
    if (secondsLeft > 0) {
      const intervalId = setInterval(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);

      // Clear the interval on component unmount or when secondsLeft changes
      return () => clearInterval(intervalId);
    }
    return;
  }, [secondsLeft]);

  return {
    secondsLeft,
    isRunning,
  };
}
