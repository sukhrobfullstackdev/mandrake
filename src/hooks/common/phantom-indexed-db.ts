import { useStore } from '@hooks/store';
import { data } from '@lib/services/web-storage/data-api';
import { MD5 } from '@lib/utils/crypto';

export type UsePersistPhantomIndexedDBReturn = {
  persistPhantomIndexedDB: (params?: PersistAppStateParams | undefined) => Promise<void>;
};

export type UseHydratePhantomIndexedDBReturn = {
  hydratePhantomIndexedDB: (params?: PersistAppStateParams | undefined) => Promise<{
    parsedAuthUserID: string | null;
    parsedAuthUserSessionToken: string | null;
    parsedUserEmail: string | null;
    parsedUserPhoneNumber: string | null;
  }>;
};

type PersistAppStateParams = {
  authUserId: string;
  authUserSessionToken: string;
  email?: string;
  phoneNumber?: string;
  refreshToken?: string;
};

export function useHydratePhantomIndexedDB(): UseHydratePhantomIndexedDBReturn {
  const { magicApiKey } = useStore(state => state);
  const hydratePhantomIndexedDB = async () => {
    let parsedAuthUserSessionToken: string | null = null;
    let parsedAuthUserID: string | null = null;
    let parsedUserEmail: string | null = null;
    let parsedUserPhoneNumber: string | null = null;

    try {
      /**
       * Phantom stores the userID (authUserId) and ust (authUserSessionToken) in IndexedDB
       * under the key `persist:auth:${MD5.digest(apiKey)}`. If a user is authenticated via Phantom then Mandrake
       * needs to use the ust and userID from IndexedDB to hydrate the user session.
       *
       */
      const serializedStatePartial = await data.getItem(`persist:auth:${MD5.digest(magicApiKey ?? '')}`);
      if (serializedStatePartial) {
        const res: Record<string, string> = JSON.parse(serializedStatePartial as string);
        parsedAuthUserSessionToken = JSON.parse(res?.ust);
        parsedAuthUserID = JSON.parse(res?.userID);
        parsedUserEmail = JSON.parse(res?.userEmail);
        parsedUserPhoneNumber = JSON.parse(res?.userPhoneNumber);
      }
    } catch {
      // if we fail to get the ust and userID from IndexedDB carry on
    }

    return {
      parsedAuthUserID,
      parsedAuthUserSessionToken,
      parsedUserEmail,
      parsedUserPhoneNumber,
    };
  };

  return {
    hydratePhantomIndexedDB,
  };
}

export function usePersistPhantomIndexedDB(): UsePersistPhantomIndexedDBReturn {
  const { magicApiKey } = useStore(state => state);

  const { hydratePhantomIndexedDB } = useHydratePhantomIndexedDB();
  const persistPhantomIndexedDB = async (params: PersistAppStateParams | undefined) => {
    // TODO: throw if API key is not set before persistPhantomIndexedDB is called

    if (!magicApiKey) {
      logger.warn('API key is not set when calling usePersistPhantomIndexedDB.');
    }

    try {
      // if the params are undefined, we are clearing IndexedDB
      if (typeof params === 'undefined') {
        await data.setItem(
          `persist:auth:${MD5.digest(magicApiKey ?? '')}`,

          `{\"userID\":\"\\\"\\\"\",\"userEmail\":\"\\\"\\\"\",\"userPhoneNumber\":\"\\\"\\\"\",\"ust\":\"\\\"\\\"\",\"_persist\":\"{\\\"version\\\":-1,\\\"rehydrated\\\":true}\"}`,
        );

        return;
      }

      const { parsedUserEmail, parsedUserPhoneNumber, parsedAuthUserID, parsedAuthUserSessionToken } =
        await hydratePhantomIndexedDB();

      const persistState = {
        userID: params.authUserId,
        authUserSessionToken: params.authUserSessionToken,
        userEmail: '',
        phoneNumber: '',
      };

      // if the authUserId and authUserSessionToken are the same as the ones in IndexedDB
      // we want to merge the email and phoneNumber params with what is in IndexedDB
      // otherwise we have a different user and / or session and want to persist only what is passed in the params
      if (parsedAuthUserID === params.authUserId && parsedAuthUserSessionToken === params.authUserSessionToken) {
        persistState.userEmail = params.email || parsedUserEmail || '';
        persistState.phoneNumber = params.phoneNumber || parsedUserPhoneNumber || '';
      } else {
        persistState.userEmail = params.email || '';
        persistState.phoneNumber = params.phoneNumber || '';
      }

      await data.setItem(
        `persist:auth:${MD5.digest(magicApiKey ?? '')}`,

        `{\"userID\":\"\\\"${persistState.userID}\\\"\",\"userEmail\":\"\\\"${persistState.userEmail}\\\"\",\"userPhoneNumber\":\"\\\"${persistState.phoneNumber}\\\"\",\"ust\":\"\\\"${persistState.authUserSessionToken}\\\"\",\"_persist\":\"{\\\"version\\\":-1,\\\"rehydrated\\\":true}\"}`,
      );
    } catch (error) {
      logger.error('Error Persisting to IndexedDB', error);
    }
  };

  return {
    persistPhantomIndexedDB,
  };
}
