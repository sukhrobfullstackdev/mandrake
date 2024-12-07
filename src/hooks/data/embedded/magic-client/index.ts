import { useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { ClientConfig, OAuthApp } from '@custom-types/magic-client';
import { makeCachedClientConfigFetcher, makeOAuthAppFetcher } from './fetchers';
import {
  ClientConfigParams,
  type MagicClientConfigQueryKey,
  MagicClientOAuthAppQueryKey,
  magicClientQueryKeys,
  OauthAppQueryParams,
} from './keys';
export * from './fetchers';
export * from './keys';

export const useClientConfigQuery = (
  params: ClientConfigParams,
  config?: Omit<UseQueryOptions<ClientConfig, Error, ClientConfig, MagicClientConfigQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ClientConfig> => {
  return useQuery({
    queryKey: magicClientQueryKeys.config(params),
    // The origin is intentionally left empty to default to the same domain from which the application is served.
    queryFn: makeCachedClientConfigFetcher(''),
    gcTime: 1000 * 60 * 30, // 30 mins
    staleTime: 1000 * 60 * 15, // 15 mins
    refetchOnWindowFocus: false,
    retry: 2,
    ...config,
  });
};

export const useOAuthAppQuery = (
  params: OauthAppQueryParams,
  config?: Omit<UseQueryOptions<OAuthApp[], Error, OAuthApp[], MagicClientOAuthAppQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<OAuthApp[]> => {
  return useQuery({
    queryKey: magicClientQueryKeys.oauthApp(params),
    queryFn: makeOAuthAppFetcher(),
    retry: 3,
    ...config,
  });
};
