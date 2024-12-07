/* istanbul ignore file */
'use client';
import { POPUP_VERIFY_URL } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/constants';
import GenerateProviderURI from '@app/send/rpc/oauth/magic_oauth_login_with_popup/generate-provider-uri';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { JsonRpcRequestPayload } from '@custom-types/json-rpc';
import { PlatformType } from '@custom-types/oauth';
import { NodeError } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { oauthStartClient } from '@lib/server/oauth-start-client';
import { getDecodedQueryParams } from '@utils/query-string';
import qs from 'qs';
import { useEffect, useState } from 'react';

export type OAuthStartParams = {
  provider: string;
  apiKey: string;
  scope?: string;
  platform: PlatformType;
  loginHint?: string | undefined;
};

interface SearchParams {
  encodedQueryParams?: string;
  activeRpcPayload?: JsonRpcRequestPayload | null;
  webCryptoDpopJwt?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default function OAuthLoginWithPopupStartPage({ searchParams }: Props) {
  const startTime = performance.now();
  const parsedParams: SearchParams = qs.parse(qs.stringify(searchParams));
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const flags = useFlags();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const params = activeRpcPayload?.params?.[0] as OAuthStartParams;

  const [loading, setLoading] = useState(true);
  const { magicApiKey } = useStore(state => state);
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey: magicApiKey || '' }, { enabled: !!magicApiKey });

  useEffect(() => {
    if (parsedParams.encodedQueryParams) {
      const decodedQueryParams = getDecodedQueryParams(parsedParams.encodedQueryParams);
      useStore.setState({ decodedQueryParams });
    }
  }, [parsedParams.encodedQueryParams]);

  // check for params
  useEffect(() => {
    if (!params?.provider) {
      logger.error('Invalid params', {
        timeToFail: Math.round(performance.now() - startTime),
        oauthContext: 'magic_oauth_login_with_popup',
        oauthStep: 'start',
        provider: params?.provider || 'no provider given',
        redirectURI: POPUP_VERIFY_URL,
      });
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.InvalidParams);
    }
  }, [params?.provider]);

  // begin oauth start flow
  useEffect(() => {
    const oauthStartFunc = async () => {
      try {
        await oauthStartClient({
          provider: params.provider,
          redirectURI: POPUP_VERIFY_URL,
          flags,
          clientConfig,
        });
        logger.info('OAuth V2 popup start prepare finished', {
          timeToSuccess: Math.round(performance.now() - startTime),
          oauthContext: 'magic_oauth_login_with_popup',
          oauthStep: 'start',
          provider: params.provider,
        });
        setLoading(false);
      } catch (e) {
        const error = e as NodeError;
        rejectActiveRpcRequest(error.code, error?.message);
      }
    };
    if (flags?.oauthV2Providers?.providers) oauthStartFunc();
  }, [params?.provider, flags]);

  if (!loading) {
    return <GenerateProviderURI />;
  }
}
