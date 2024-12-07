'use client';

import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { useResetAuthState, useSetAuthState } from '@hooks/common/auth-state';
import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserMetadata } from '@hooks/common/user-metadata';
import {
  LegacyOAuthVerifyResponse,
  useOAuthUserInfoQuery,
  useOAuthVerifyQuery,
} from '@hooks/data/embedded/legacy-oauth';
import { useUserLogoutQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { oauthScopeToArray, redirectResultHasError } from '@lib/utils/oauth';
import { camelizeKeys } from '@lib/utils/object-helpers';
import { getParsedQueryParams } from '@lib/utils/query-string';
import { RPCErrorCode } from '@magic-sdk/types';
import { usePathname } from 'next/navigation';
import QueryString from 'qs';
import { useEffect, useRef, useState } from 'react';

type JsonRPCParams = [string, string, string];

export default function OAuthRedirectResult() {
  const pathname = usePathname();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(null);
  const oauthParsedQuery = useRef<Partial<QueryString.ParsedQs> | null>(null);
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { hydrateAndPersistAuthState, setAndPersistEmail } = useSetAuthState();

  const { sdkMetaData } = useStore(state => state);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const { mutate: oauthVerifyMutate, data: oauthVerifyData } = useOAuthVerifyQuery();
  const { mutate: mutateUserLogout } = useUserLogoutQuery();

  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const { userMetadata } = useUserMetadata();
  const { resetAuthState } = useResetAuthState();

  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: verificationSuccess && areWalletsCreated,
    lifespan: activeRpcPayload?.params[0]?.lifespan || DEFAULT_TOKEN_LIFESPAN,
  });

  const { data: oauthUserInfoData, error: userInfoError } = useOAuthUserInfoQuery(
    {
      authorizationToken: authorizationToken!,
      provider: oauthParsedQuery.current?.provider as string,
    },
    {
      enabled: Boolean(authorizationToken) && Boolean(oauthParsedQuery.current?.provider),
    },
  );

  const verifyOauth = async (verifier: string) => {
    const oauthMetaData = oauthParsedQuery.current;

    // Dispatch a request to phantom to clear the global Cache
    dispatchPhantomClearCacheKeys();
    await resetAuthState();

    // verify oauth
    oauthVerifyMutate(
      {
        magicOAuthRequestID: oauthMetaData?.magicOauthRequestId as string,
        magicVerifier: verifier,
        magicCredential: oauthMetaData?.magicCredential as string,
        jwt: sdkMetaData?.webCryptoDpopJwt,
      },
      {
        onSuccess: async (data: LegacyOAuthVerifyResponse) => {
          await hydrateAndPersistAuthState({
            authUserId: data.authUserId,
            authUserSessionToken: data.authUserSessionToken,
            refreshToken: data.refreshToken,
            requestOriginMessage: verifier,
            defaultPersistEnabled: true,
          });

          setVerificationSuccess(true);
        },
        onError: () => {
          rejectActiveRpcRequest(RPCErrorCode.InvalidRequest, 'There was an issue verifying oauth credentials.');
        },
      },
    );
  };

  // check params and verify oauth credentials
  useEffect(() => {
    if (!activeRpcPayload || Boolean(oauthVerifyData?.authUserId) || verificationSuccess) return;

    // parse oauth query params
    const [queryString, verifier, state] = activeRpcPayload.params as unknown as JsonRPCParams;
    oauthParsedQuery.current = camelizeKeys(getParsedQueryParams(queryString.substring(1)));
    const oauthMetaData = oauthParsedQuery.current;

    // error parsing the query params from the oauth redirect
    if (!oauthMetaData) {
      rejectActiveRpcRequest(RPCErrorCode.MethodNotFound, 'There was an issue parsing oauth query params.');
      return;
    }

    // authorization code step produced an error
    if (redirectResultHasError(oauthMetaData)) {
      rejectActiveRpcRequest(RPCErrorCode.InvalidRequest, 'There was an error getting the OAuth authorization code.');
      return;
    }

    // compare state
    if (state !== oauthMetaData?.state) {
      rejectActiveRpcRequest(RPCErrorCode.InvalidRequest, 'OAuth state parameter mismatches.');
      return;
    }

    verifyOauth(verifier);
  }, []);

  // wait for DID token and then set id token
  useEffect(() => {
    if (authorizationToken) return;

    if (didToken && activeRpcPayload) {
      const oauthMetaData = oauthParsedQuery.current;
      const oauthAccessToken = oauthVerifyData?.accessToken;
      const authorization = oauthMetaData?.provider === 'apple' ? didToken : oauthAccessToken;
      setAuthorizationToken(authorization || null);
    }
  }, [didToken, activeRpcPayload]);

  // resolve oauth flow and json rpc response
  useEffect(() => {
    let email = null;

    if (oauthUserInfoData) {
      // assume true if email verified is null
      const isEmailVerified = oauthUserInfoData?.emailVerified ?? true;
      email = isEmailVerified && oauthUserInfoData?.email ? oauthUserInfoData.email : null;

      if (email) {
        setAndPersistEmail({ email: oauthUserInfoData.email || '' });
      }
    }

    if (userMetadata?.publicAddress && oauthUserInfoData) {
      const result = {
        oauth: {
          provider: oauthParsedQuery.current?.provider,
          scope: oauthScopeToArray(oauthParsedQuery.current?.scope as string),
          accessToken: oauthVerifyData?.accessToken,
          userHandle: oauthVerifyData?.providerUserHandle,
          userInfo: oauthUserInfoData,
        },
        magic: {
          idToken: didToken,
          userMetadata: {
            ...userMetadata,
            email: userMetadata.email || email || '',
          },
        },
      };

      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      resolveActiveRpcRequest(result);
    }
  }, [userMetadata?.publicAddress, oauthUserInfoData?.sub, oauthUserInfoData?.email]);

  // handle blocking errors
  useEffect(() => {
    if (walletCreationError || userInfoError || didTokenError) {
      mutateUserLogout(
        { authUserId: useStore.getState().authUserId || '' },
        {
          onSettled: () => {
            rejectActiveRpcRequest(RPCErrorCode.InternalError, 'Failed to retrieve OAuth access token.');
            logger.error('oauth_redirect Page - Wallet hydrating or creation error', walletCreationError);
          },
        },
      );
    }
  }, [walletCreationError, userInfoError, didTokenError]);

  return null;
}
