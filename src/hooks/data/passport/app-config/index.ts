import { PassportConfig } from '@custom-types/passport';
import { makeCachedPassportConfigFetcher } from '@hooks/data/passport/app-config/fetchers';
import {
  MagicPassportConfigQueryKey,
  magicPassportQueryKeys,
  PassportConfigParams,
} from '@hooks/data/passport/app-config/keys';
import { usePassportStore } from '@hooks/data/passport/store';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export const usePassportConfigQuery = (
  params: PassportConfigParams,
  config?: Omit<
    UseQueryOptions<PassportConfig, Error, PassportConfig, MagicPassportConfigQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<PassportConfig> => {
  return useQuery({
    queryKey: magicPassportQueryKeys.passportConfig(params),
    // The origin is intentionally left empty to default to the same domain from which the application is served.
    queryFn: makeCachedPassportConfigFetcher(''),
    gcTime: 1000 * 60 * 30, // 30 mins
    staleTime: 1000 * 60 * 15, // 15 mins
    refetchOnWindowFocus: false,
    retry: false,
    ...config,
  });
};

export const usePassportAppConfig = () => {
  const { magicApiKey } = usePassportStore(state => state);

  const { data: clientConfig } = usePassportConfigQuery(
    {
      magicApiKey: magicApiKey || '',
    },
    { enabled: !!magicApiKey },
  );

  return clientConfig;
};
