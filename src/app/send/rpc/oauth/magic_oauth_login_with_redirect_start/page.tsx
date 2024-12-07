/* istanbul ignore file */
'use client';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { JsonRpcRequestPayload } from '@custom-types/json-rpc';
import { PlatformType } from '@custom-types/oauth';
import { NodeError } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { getQueryClient } from '@lib/common/query-client';
import { oauthStartClient } from '@lib/server/oauth-start-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getDecodedQueryParams } from '@utils/query-string';
import qs from 'qs';
import { useEffect, useState } from 'react';
import OAuthStart from './oauth-start';

export type OAuthStartParams = {
  provider: string;
  redirectURI: string;
  apiKey: string;
  scope?: string;
  bundleId?: string;
  platform: PlatformType;
  loginHint?: string | undefined;
  customData?: string;
};

interface SearchParams {
  encodedQueryParams?: string;
  activeRpcPayload?: JsonRpcRequestPayload | null;
  webCryptoDpopJwt?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default function Page({ searchParams }: Props) {
  const startTime = performance.now();
  const queryClient = getQueryClient();
  const parsedParams: SearchParams = qs.parse(qs.stringify(searchParams));
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const flags = useFlags();
  const params = parsedParams.activeRpcPayload?.params?.[0] as OAuthStartParams;
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
    if (!params?.provider || !params?.redirectURI) {
      logger.error('Invalid params', {
        timeToFail: Math.round(performance.now() - startTime),
        oauthContext: 'magic_oauth_login_with_redirect_start',
        oauthStep: 'start',
        provider: params?.provider || 'no provider given',
        redirectURI: params?.redirectURI || 'no redirect url given',
        customData: params?.customData || 'no customData given',
      });
      rejectActiveRpcRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.InvalidParams);
      setLoading(false);
      return;
    }
  }, [params?.provider, params?.redirectURI]);

  // begin oauth start flow
  useEffect(() => {
    const oauthStartFunc = async () => {
      try {
        await oauthStartClient({
          provider: params.provider,
          redirectURI: params.redirectURI,
          flags,
          clientConfig,
        });
        logger.info('OAuth start prepare finished', {
          timeToSuccess: Math.round(performance.now() - startTime),
          oauthContext: 'magic_oauth_login_with_redirect_start',
          oauthStep: 'start',
          provider: params.provider,
        });
        setLoading(false);
      } catch (e) {
        const error = e as NodeError;
        return rejectActiveRpcRequest(error.code, error?.message);
      }
    };
    if (flags?.oauthV2Providers?.providers) oauthStartFunc();
  }, [params?.provider, params?.redirectURI, flags]);
  if (!loading) {
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OAuthStart />
      </HydrationBoundary>
    );
  }
}
