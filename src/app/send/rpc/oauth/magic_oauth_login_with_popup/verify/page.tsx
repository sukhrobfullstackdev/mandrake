'use client';

import { useLoginContext } from '@app/send/login-context';
import { RPC_VERIFY_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import { useOAuthContext } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import { OAuthVerify } from '@components/oauth/oauth-verify';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { OAUTH_METADATA_KEY } from '@constants/storage';
import { OAuthFinishedResult, OAuthMetadata } from '@custom-types/oauth';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { OAuthVerifyResponse } from '@hooks/data/embedded/oauth';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { RPCErrorCode } from '@magic-sdk/types';
import { data } from '@services/web-storage/data-api';
import { parseOAuthFields } from '@utils/oauth';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

export type OAuthVerifyParams = [
  {
    authorizationResponseParams: string;
    magicApiKey: string;
    platform: string;
  },
];

export default function OAuthVerifyPage() {
  const router = useSendRouter();
  const pathname = usePathname();
  const { resetAuthState } = useResetAuthState();

  const startTime = useRef(performance.now());
  const { metaData, providerResult: authorizationResponseParams, ...oauthContext } = useOAuthContext();

  const loginContext = useLoginContext();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  if (!authorizationResponseParams) {
    rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.MissingRequiredParams);
  }

  const oauthParsedQuery = useRef(parseOAuthFields(authorizationResponseParams as string));

  const getMetadata = async () => {
    try {
      let item = (await data.getItem(OAUTH_METADATA_KEY)) as OAuthMetadata;

      if (!item) {
        const backupItem = localStorage.getItem(OAUTH_METADATA_KEY);

        if (!backupItem) {
          logger.error('Missing OAuth V2 popup meta data within local storage. Could not complete verification.', {
            activeRpcPayload,
            oauthContext: 'redirect',
            oauthStep: 'verify',
          });

          rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.MissingRequiredParamsFromStorage);
          return;
        }
        item = JSON.parse(backupItem) as OAuthMetadata;
      }

      oauthContext.setOAuthState({
        ...oauthContext,
        providerResult: authorizationResponseParams,
        metaData: item,
      });
      logger.info('OAuth V2 popup: Prepare to start verification', {
        authorizationResponseParams: activeRpcPayload?.params?.[0],
        oauthParsedQuery: oauthParsedQuery.current,
        OAuthMetadataFromLocalForage: item,
      });
    } catch (error) {
      logger.error('Missing OAuth V2 popup meta data within local storage. GetItem Failed.', {
        error,
        activeRpcPayload,
        oauthContext: 'redirect',
        oauthStep: 'verify',
      });
      rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.MissingRequiredParamsFromStorage);
    } finally {
      data.removeItem(OAUTH_METADATA_KEY);
      localStorage.removeItem(OAUTH_METADATA_KEY);
    }
  };

  // Once verification is complete, resolve the OAuth flow
  const onVerifyFinished = useCallback((result: OAuthFinishedResult<OAuthVerifyResponse>) => {
    if (!result.isSuccess) {
      logger.error('OAuth V2 popup verify error', {
        timeToError: Math.round(performance.now() - startTime.current),
        oauthContext: 'magic_oauth_login_with_popup',
        oauthStep: 'verify',
        code: result.data.errorCode,
        message: result.data.errorMessage,
        provider: metaData?.provider,
        redirectUri: metaData?.redirectUri,
      });

      rejectActiveRpcRequest(RPCErrorCode.InvalidRequest, result.data.errorMessage);
    }

    if (result.mfaEnabled) {
      loginContext.setLoginState({
        ...loginContext,
        loginFlowContext: result.data.loginFlowContext || '',
      });

      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      router.replace(`${RPC_VERIFY_ROUTE}/enforce_mfa`);
      return;
    }

    if (result.isSuccess) {
      logger.info('OAuth V2 popup verify success', {
        timeToSuccess: Math.round(performance.now() - startTime.current),
        oauthContext: 'magic_oauth_login_with_popup',
        oauthStep: 'verify',
        result: result.data,
        provider: metaData?.provider,
        redirectUri: metaData?.redirectUri,
      });

      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      router.replace(`${RPC_VERIFY_ROUTE}/resolve`);
    }
  }, []);

  useEffect(() => {
    const initOAuthVerification = async () => {
      dispatchPhantomClearCacheKeys();
      await resetAuthState();

      if (oauthParsedQuery.current.error) {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, oauthParsedQuery.current.error as string);
        return;
      }

      router.prefetch(`${RPC_VERIFY_ROUTE}/resolve`);

      if (!metaData) {
        getMetadata();
      }
    };
    initOAuthVerification();
  }, []);

  return (
    Boolean(metaData) && (
      <OAuthVerify
        redirectUri={metaData?.redirectUri || ''}
        authorizationResponseParams={authorizationResponseParams as string}
        state={metaData?.state || ''}
        codeVerifier={metaData?.codeVerifier || ''}
        appID={metaData?.appID || ''}
        onFinished={onVerifyFinished}
      />
    )
  );
}
