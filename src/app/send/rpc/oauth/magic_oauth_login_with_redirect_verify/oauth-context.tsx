'use client';

import { OAuthMetadata } from '@custom-types/oauth';
import { ReactNode, createContext, useContext, useState, useEffect, useRef } from 'react';
import { data } from '@services/web-storage/data-api';
import { OAUTH_METADATA_KEY } from '@constants/storage';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { OAuthVerifyParams } from '@app/send/rpc/oauth/magic_oauth_login_with_redirect_verify/page';
import { parseOAuthFields } from '@utils/oauth';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { RPC_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_redirect_verify/constants';
import { useSendRouter } from '@hooks/common/send-router';
import { useResetAuthState } from '@hooks/common/auth-state';

interface Context {
  metaData: OAuthMetadata | null;
  setMetaData: (metaData: OAuthMetadata) => void;
}

const contextDefaults = {
  metaData: null,
  setMetaData: () => null,
};

export const OAuthContext = createContext<Context>(contextDefaults);

export const OAuthProvider = ({ children }: { children: ReactNode }) => {
  const [metaData, setMetaData] = useState<OAuthMetadata | null>(null);
  const [fetchComplete, setFetchComplete] = useState(false);
  const router = useSendRouter();
  const { resetAuthState } = useResetAuthState();

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { authorizationResponseParams } = (activeRpcPayload?.params as OAuthVerifyParams)?.[0] || {};
  const oauthParsedQuery = useRef(parseOAuthFields(authorizationResponseParams));
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  useEffect(() => {
    const getMetadata = async () => {
      try {
        let item = (await data.getItem(OAUTH_METADATA_KEY)) as OAuthMetadata;

        if (!item) {
          logger.warn('Missing OAuth meta data within IndexedDB. Checking local storage');
          const backupItem = localStorage.getItem(OAUTH_METADATA_KEY);

          if (!backupItem) {
            logger.error('Missing OAuth meta data within local storage. Could not complete verification.');

            return rejectActiveRpcRequest(
              RpcErrorCode.InvalidRequest,
              RpcErrorMessage.MissingRequiredParamsFromStorage,
            );
          }
          item = JSON.parse(backupItem) as OAuthMetadata;
        }

        if (item) {
          setMetaData(item);
          logger.info('OAuthV2: Prepare to start verification', {
            authorizationResponseParams: activeRpcPayload?.params?.[0],
            oauthParsedQuery: oauthParsedQuery.current,
            OAuthMetadataFromLocalForage: item,
          });
          return;
        }
      } catch (error) {
        logger.error('OAuthV2: Missing OAuth meta data within local storage. GetItem Failed.', {
          error,
        });
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.MissingRequiredParamsFromStorage);
      } finally {
        setFetchComplete(true);
        logger.log('Cleaning up OAuth meta data from storages');
        data.removeItem(OAUTH_METADATA_KEY);
        localStorage.removeItem(OAUTH_METADATA_KEY);
      }
    };

    const initOAuthVerification = async () => {
      dispatchPhantomClearCacheKeys();
      await resetAuthState();

      if (oauthParsedQuery.current.error) {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, oauthParsedQuery.current.error as string);
        return;
      }

      router.prefetch(`${RPC_ROUTE}/resolve`);

      if (!metaData && !fetchComplete) {
        logger.log('OAuthV2: Fetching OAuth metadata');
        getMetadata();
      }
    };
    initOAuthVerification();
  }, []);

  return (
    <OAuthContext.Provider
      value={{
        metaData,
        setMetaData,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};

export const useOAuthContext = () => useContext(OAuthContext);
