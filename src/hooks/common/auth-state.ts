import { usePersistPhantomIndexedDB } from '@hooks/common/phantom-indexed-db';
import { launchDarklyQueryKeys } from '@hooks/data/embedded/launch-darkly';
import { magicClientQueryKeys } from '@hooks/data/embedded/magic-client';
import { usePersistSessionMutation } from '@hooks/data/embedded/session';
import { initialState, useStore } from '@hooks/store';
import { getQueryClient } from '@lib/common/query-client';
import { analytics } from '@lib/services/analytics';
import { useIsMobileSDK } from '@lib/utils/platform';
import { areArraysEqual } from '@utils/array-helpers';

export type UseResetAuthStateReturn = {
  resetAuthState: () => Promise<void>;
};

// react query cache key prefixes that should not be cleared by a reset
const protectedCacheKeys = [
  [...magicClientQueryKeys.base, 'config'],
  [...launchDarklyQueryKeys.base, 'all-flags-server-state'],
  [...launchDarklyQueryKeys.base, 'all-flags'],
];

export function useResetAuthState(): UseResetAuthStateReturn {
  const queryClient = getQueryClient();
  const { persistPhantomIndexedDB } = usePersistPhantomIndexedDB();
  const resetAuthState = async () => {
    try {
      await persistPhantomIndexedDB();
    } catch (e) {
      logger.error('Error persisting auth state', e);
    }
    useStore.setState({
      authUserId: initialState.authUserId,
      authUserSessionToken: initialState.authUserSessionToken,
      email: initialState.email,
      phoneNumber: initialState.phoneNumber,
      mfaEnrollSecret: initialState.mfaEnrollSecret,
      mfaEnrollInfo: initialState.mfaEnrollInfo,
      mfaRecoveryCodes: initialState.mfaRecoveryCodes,
    });

    // iterate through react query cache and invalidate all queries that are not protected
    queryClient.invalidateQueries({
      predicate: query => !protectedCacheKeys.some(key => areArraysEqual(query.queryKey[0] as string[], key)),
      refetchType: 'none',
    });
  };

  return {
    resetAuthState,
  };
}

export type HydrateAndPersistAuthStateParams = {
  authUserId: string;
  authUserSessionToken: string;
  email?: string;
  phoneNumber?: string;
  refreshToken?: string;
  requestOriginMessage?: string;
  defaultPersistEnabled?: boolean;
  persistToPhantom?: boolean;
};

export type SetAndPersistEmailParams = {
  email: string;
  persistToPhantom?: boolean;
};

export function useSetAuthState() {
  const { persistPhantomIndexedDB } = usePersistPhantomIndexedDB();
  const { mutateAsync: mutatePersistSession } = usePersistSessionMutation();
  const { sdkMetaData, magicApiKey } = useStore(state => state);
  const isMobileSdk = useIsMobileSDK();

  const hydrateAndPersistAuthState = async ({
    authUserId,
    authUserSessionToken,
    email,
    phoneNumber,
    refreshToken,
    requestOriginMessage,
    defaultPersistEnabled = false,
    persistToPhantom = true,
  }: HydrateAndPersistAuthStateParams) => {
    const shouldPersist = (!refreshToken && isMobileSdk) || defaultPersistEnabled;

    analytics(magicApiKey).identify(`auth-user:${authUserId}`);

    // globally store auth state
    useStore.setState({
      authUserId,
      authUserSessionToken,
      sdkMetaData: {
        ...sdkMetaData,
        userSessionRefreshToken: refreshToken,
      },
      email,
      phoneNumber,
    });

    // persist state to phantom indexedDB
    if (persistToPhantom) {
      await persistPhantomIndexedDB({
        authUserId,
        authUserSessionToken,
        email,
        phoneNumber,
      });
    }

    // request default session persistance
    if (shouldPersist && authUserId && requestOriginMessage) {
      try {
        await mutatePersistSession({
          authUserId: authUserId,
          requestOriginMessage: requestOriginMessage,
        });
      } catch (err) {
        logger.error(`Error persisting session ${err}`);
      }
    }
  };

  const setAndPersistEmail = async ({ email, persistToPhantom = true }: SetAndPersistEmailParams) => {
    useStore.setState({ email });
    const { authUserId, authUserSessionToken, phoneNumber } = useStore.getState();

    // persist state to phantom indexedDB
    if (persistToPhantom) {
      await persistPhantomIndexedDB({
        authUserId: authUserId || '',
        authUserSessionToken: authUserSessionToken || '',
        email,
        phoneNumber: phoneNumber || '',
      });
    }
  };

  return {
    hydrateAndPersistAuthState,
    setAndPersistEmail,
  };
}
