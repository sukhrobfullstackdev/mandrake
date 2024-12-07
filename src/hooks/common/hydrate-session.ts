import { WalletType } from '@custom-types/wallet';
import { datadogRum } from '@datadog/browser-rum';
import { useResetAuthState, useSetAuthState } from '@hooks/common/auth-state';
import { useRefreshSessionMutation } from '@hooks/data/embedded/session';
import {
  useUserSessionTokenFromRefreshTokenMutation,
  useVerifyUserSessionMutation,
  userQueryKeys,
} from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { getQueryClient } from '@lib/common/query-client';
import { useIsMobileSDK } from '@lib/utils/platform';
import { useEffect, useState } from 'react';
import { useHydratePhantomIndexedDB } from './phantom-indexed-db';

export type UseHydrateSessionParams = {
  enabled?: boolean;
  defaultPersistEnabled?: boolean;
};

export type UseHydrateSessionReturn = {
  isComplete: boolean;
  isError: boolean;
};

export type HydrateSessionData = {
  authUserSessionToken: string;
  authUserId: string;
  publicAddress?: string;
  email?: string;
  phoneNumber?: string;
  refreshToken?: string;
};

export function useHydrateSession({
  enabled = true,
  defaultPersistEnabled = false,
}: UseHydrateSessionParams = {}): UseHydrateSessionReturn {
  const { authUserId, sdkMetaData, authUserSessionToken } = useStore(state => state);
  const jwt = (sdkMetaData?.webCryptoDpopJwt as string) ?? '';
  // you will only have a refresh token if you have custom session persistence enabled for the dApp
  const userSessionRefreshToken = (sdkMetaData?.userSessionRefreshToken as string) ?? '';
  const isMobileSdk = useIsMobileSDK();
  const [isError, setIsError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { mutateAsync: refreshSessionMutation } = useRefreshSessionMutation();
  const { mutateAsync: verifyUserSessionMutation } = useVerifyUserSessionMutation();
  const { mutateAsync: userSessionTokenFromRefreshTokenMutation } = useUserSessionTokenFromRefreshTokenMutation();
  const { resetAuthState } = useResetAuthState();
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const { hydratePhantomIndexedDB } = useHydratePhantomIndexedDB();
  const queryClient = getQueryClient();

  const setUserSessionData = async (data: HydrateSessionData) => {
    await hydrateAndPersistAuthState(data);
    setIsComplete(true);
  };

  const setHydrationError = async () => {
    try {
      await resetAuthState();
    } catch (error) {
      datadogRum.addError(error);
    }
    setIsError(true);
  };

  // DH: this ensures that isComplete is set to true only after isError is set
  useEffect(() => {
    if (isError) {
      setIsComplete(true);
    }
  }, [isError]);

  useEffect(() => {
    const hydrateUserSession = async () => {
      if (authUserId && authUserSessionToken) {
        try {
          const data = queryClient.getQueryData(
            userQueryKeys.info({ authUserId, authUserSessionToken, walletType: WalletType.ETH }),
          );
          // Found User info in cache, skip session hydration
          if (data) {
            setIsComplete(true);
            return;
          }
          const verifyUserSessionData = await verifyUserSessionMutation({
            authUserId,
            authUserSessionToken,
            walletType: WalletType.ETH,
          });
          await setUserSessionData({
            authUserId,
            authUserSessionToken,
            email: verifyUserSessionData.email,
            phoneNumber: verifyUserSessionData.phoneNumber,
          });
          queryClient.setQueriesData(
            { queryKey: userQueryKeys.info({ authUserId, authUserSessionToken, walletType: WalletType.ETH }) },
            () => verifyUserSessionData,
          );
          return;
        } catch {
          // if verifyUserSession fails, try hydrating it from indexedDB.
        }
      }
      const { parsedAuthUserID, parsedAuthUserSessionToken } = await hydratePhantomIndexedDB();
      if (parsedAuthUserID && parsedAuthUserSessionToken) {
        try {
          const verifyUserSessionData = await verifyUserSessionMutation({
            authUserId: parsedAuthUserID,
            authUserSessionToken: parsedAuthUserSessionToken,
            walletType: WalletType.ETH,
          });
          await setUserSessionData({
            authUserId: parsedAuthUserID,
            authUserSessionToken: parsedAuthUserSessionToken,
            email: verifyUserSessionData.email,
            phoneNumber: verifyUserSessionData.phoneNumber,
          });
          queryClient.setQueriesData(
            {
              queryKey: userQueryKeys.info({
                authUserId: parsedAuthUserID,
                authUserSessionToken: parsedAuthUserSessionToken,
                walletType: WalletType.ETH,
              }),
            },
            () => verifyUserSessionData,
          );
          return;
        } catch {
          // if verifyUserSession fails we will attempt to get a user session token from the refresh token
        }
      }
      // custom session persistence
      if (userSessionRefreshToken && jwt) {
        try {
          const userSessionTokenResponse = await userSessionTokenFromRefreshTokenMutation({
            jwt,
            userSessionRefreshToken,
          });
          await setUserSessionData(userSessionTokenResponse);

          return;
        } catch {
          // if we fail to get a user session token from the refresh token we will try to refresh the session
        }
      } else if (isMobileSdk || defaultPersistEnabled) {
        // default session persistence
        try {
          const refreshSessionData = await refreshSessionMutation();
          await setUserSessionData(refreshSessionData);

          return;
        } catch {
          // if default session persistence fails we will set an error
        }
      }

      // if everything fails we will set an error
      await setHydrationError();
    };
    if (!isComplete && enabled) {
      hydrateUserSession();
    }
  }, [isComplete, enabled]);

  return {
    isComplete,
    isError,
  };
}
