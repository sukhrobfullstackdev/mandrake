import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { shared } from '@constants/providers';
import { OAUTH_METADATA_KEY } from '@constants/storage';
import { OAuthPrompt } from '@custom-types/oauth';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { useOAuthAppQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { data } from '@lib/services/web-storage/data-api';
import { CreateCryptoChallengeReturn, createCryptoChallenge } from '@lib/utils/crypto';
import { formatOAuthFields, getProviderConfig, normalizeOAuthScope, oauthScopeToArray } from '@lib/utils/oauth';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { encodeBase64 } from '@utils/base64';

export interface OauthStartResult {
  oauthAuthoriationURI: string;
  useMagicServerCallback?: boolean;
}

export interface Props {
  provider: string;
  redirectUri: string;
  scope?: string;
  customData?: string;
  prompt?: OAuthPrompt;
  loginHint?: string;
  bundleId?: string;
  onSuccess: (result: OauthStartResult) => void;
  onError: (error: RpcErrorCode, message: string) => void;
}

export const OauthStart = ({
  provider,
  redirectUri,
  scope,
  customData,
  loginHint,
  bundleId,
  prompt,
  onSuccess,
  onError,
}: Props) => {
  const flags = useFlags();
  const [cryptoChallenge, setCryptoChallenge] = useState<CreateCryptoChallengeReturn | null>(null);
  const providerConfig = getProviderConfig(provider);
  const { data: oauthAppDataArray, error: oauthAppError, failureCount } = useOAuthAppQuery({ provider });
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const oauthAppData = oauthAppDataArray?.[0] || null;

  const useMagicServerCallback: boolean =
    (!!providerConfig.useMagicServerCallback || !!flags?.oauthV2ServerDetour) && !!oauthAppData?.redirectId;

  const providerRedirectUri = useMagicServerCallback
    ? new URL(`/v1/oauth2/${oauthAppData?.redirectId}/callback`, window.origin).href
    : redirectUri;

  const generateCodeVerifier = async () => {
    const { state: cryptoChallengeState, codeVerifier, challenge } = createCryptoChallenge();

    const oauthMetadata = {
      codeVerifier,
      state: encodeBase64(
        JSON.stringify({
          customData,
          cryptoChallengeState,
        }),
      ),
      provider,
      redirectUri: providerRedirectUri,
      appID: oauthAppData?.id,
      dpop: useStore.getState().sdkMetaData?.webCryptoDpopJwt,
      apiKey: useStore.getState().magicApiKey,
    };

    // store for later post-redirect
    await data.removeItem(OAUTH_METADATA_KEY);
    await data.setItem(OAUTH_METADATA_KEY, oauthMetadata);

    try {
      localStorage.removeItem(OAUTH_METADATA_KEY);
      localStorage.setItem(OAUTH_METADATA_KEY, JSON.stringify(oauthMetadata));
    } catch (err) {
      logger.info('localStorage setItem fail', { error: err });
    }

    setCryptoChallenge({ state: cryptoChallengeState, codeVerifier, challenge });
  };

  // start and generage code verifier
  useEffect(() => {
    if (oauthAppDataArray !== undefined && !oauthAppDataArray[0]) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.MissingOAuthProviderConfiguration);
    }
    if (!oauthAppData || cryptoChallenge?.state) return;

    generateCodeVerifier();
  }, [oauthAppData?.id]);

  // construct authorization code url
  useEffect(() => {
    if (!oauthAppData || !cryptoChallenge?.state) return;
    const fields = formatOAuthFields(
      shared.authorizationRequestFields,
      {
        appID: oauthAppData?.appId,
        redirectURI: providerRedirectUri,
        scope: normalizeOAuthScope([
          ...(providerConfig.authorization.defaultScopes || []),
          ...oauthScopeToArray(scope),
        ]),
        state: encodeBase64(
          JSON.stringify({
            customData,
            cryptoChallengeState: cryptoChallenge?.state,
          }),
        ),
        loginHint: loginHint,
        bundleId: bundleId,
        codeChallenge: cryptoChallenge?.challenge,
        codeChallengeMethod: 'S256',
        ...(!!prompt && { prompt: prompt as OAuthPrompt }),
      },

      providerConfig.authorization.defaultParams,
    );

    let oauthAuthoriationURI = new URL(`?${qs.stringify(fields)}`, providerConfig.authorization.endpoint).href;

    if (useMagicServerCallback) {
      const query = {
        magic_api_key: useStore.getState().magicApiKey,
        state: encodeBase64(
          JSON.stringify({
            customData,
            cryptoChallengeState: cryptoChallenge?.state,
          }),
        ),
        redirect_uri: redirectUri,
        bundleId: bundleId,
        provider_authorization_url: oauthAuthoriationURI,
      };

      oauthAuthoriationURI = `/v2/oauth2/${provider}/start?${qs.stringify(query)}`;
    }

    const result: OauthStartResult = {
      oauthAuthoriationURI,
      useMagicServerCallback,
    };

    onSuccess(result);
  }, [cryptoChallenge?.state, oauthAppData?.id]);

  // handle oauth app errors if retrying fails
  useEffect(() => {
    if (oauthAppError && failureCount > 2) {
      onError(RpcErrorCode.InternalError, oauthAppError.message);
    }
  }, [oauthAppError, failureCount]);
  return null;
};
