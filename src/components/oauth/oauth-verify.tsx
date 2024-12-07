import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { OAuthFinishedResult } from '@custom-types/oauth';
import { useSetAuthState } from '@hooks/common/auth-state';
import { OAuthVerifyResponse, useOAuthVerifyMutation } from '@hooks/data/embedded/oauth';
import { useStore } from '@hooks/store';
import { isIframe } from '@lib/utils/context';
import { mfaIsEnforced } from '@lib/utils/mfa';
import { parseOAuthFields } from '@lib/utils/oauth';
import { useEffect, useRef } from 'react';

export interface Props {
  redirectUri: string;
  authorizationResponseParams: string;
  state: string;
  codeVerifier: string;
  appID: string;
  onFinished: (result: OAuthFinishedResult<OAuthVerifyResponse>) => void;
}

export const OAuthVerify = ({
  redirectUri,
  authorizationResponseParams,
  state,
  codeVerifier,
  appID,
  onFinished,
}: Props) => {
  const oauthParsedQuery = parseOAuthFields(authorizationResponseParams);
  const { authorizationCode, state: queryState } = oauthParsedQuery;
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const { mutate: verifyMutation } = useOAuthVerifyMutation();
  const oauthV2DebugObject = useRef({
    oauthV2FromLocalStorage: {
      redirectUri,
      state,
      codeVerifier,
    },
    oauthV2FromResponseParams: {
      authorizationResponseParams,
      oauthParsedQuery,
      queryState,
      authorizationCode,
    },
  });

  const handleError = (errorCode: RpcErrorCode, errorMessage: string) => {
    onFinished({
      isSuccess: false,
      data: {
        errorCode,
        errorMessage,
      },
    });
  };

  useEffect(() => {
    if (!queryState || !authorizationCode) {
      logger.error('OAuthV2: Missing required parameters from authorizationResponseParams', { oauthV2DebugObject });
      handleError(RpcErrorCode.InvalidRequest, RpcErrorMessage.MissingRequiredParams as string);
      return;
    }

    // check for OAuth provider error
    if (oauthParsedQuery.error) {
      logger.error('OAuthV2: Parsed Query Error', {
        oauthV2DebugObject,
      });
      handleError(RpcErrorCode.InvalidRequest, oauthParsedQuery.error as string);
      return;
    }

    // compare state
    if (!state || state !== queryState) {
      logger.error('OAuthV2: State parameter mismatches.', {
        oauthV2DebugObject,
      });
      handleError(RpcErrorCode.InvalidRequest, RpcErrorMessage.StateParameterMismatches);
      return;
    }

    logger.info('OAuthV2: Verifying OAuth credentials.', {
      oauthV2DebugObject,
    });
    verifyMutation(
      {
        appID,
        authorizationCode: (authorizationCode as string) || '',
        codeVerifier: codeVerifier || '',
        redirectURI: redirectUri,
        jwt: useStore.getState().sdkMetaData?.webCryptoDpopJwt || '',
      },
      {
        onSuccess: async (res: OAuthVerifyResponse) => {
          // handle MFA enforcement
          if (res.loginFlowContext && res.factorsRequired && mfaIsEnforced(res.factorsRequired)) {
            onFinished({
              isSuccess: true,
              mfaEnabled: true,
              data: res,
            });

            return;
          }

          await hydrateAndPersistAuthState({
            authUserId: res.authUserId,
            authUserSessionToken: res.authUserSessionToken,
            refreshToken: res.refreshToken,
            phoneNumber: res.userInfo?.phoneNumber || '',
            persistToPhantom: isIframe,
          });

          onFinished({
            isSuccess: true,
            data: res,
          });
        },
        onError: (err: unknown) => {
          const errorMessage = 'There was an issue verifying OAuth credentials.';
          logger.error(errorMessage, err);
          handleError(RpcErrorCode.InternalError, errorMessage);
        },
      },
    );
  }, []);

  return null;
};
