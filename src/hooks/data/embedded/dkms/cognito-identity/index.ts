import { useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { AwsCredentialIdentity } from '@aws-sdk/types';
import { makeGetCredentialsFetcher } from './fetchers';
import { GetCredentialsParams, GetCredentialsQueryKey, cognitoIdentityQueryKeys } from './keys';
import { getQueryClient } from '@common/query-client';

export * from './fetchers';
export * from './keys';

export const useGetCredentialsQuery = (
  params: GetCredentialsParams,
  config?: Omit<
    UseQueryOptions<AwsCredentialIdentity, Error, AwsCredentialIdentity, GetCredentialsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<AwsCredentialIdentity> => {
  const queryFn = makeGetCredentialsFetcher();
  return useQuery({
    queryKey: cognitoIdentityQueryKeys.getCredentials(params),
    queryFn,
    ...config,
    staleTime: 1000 * 60 * 59, // 59 minutes (AWS credentials expire after 20 minutes and our GBS Cache expires after 5 minutes)
  });
};

export const getCredentialsQuery = (
  params: GetCredentialsParams,
  config?: Omit<
    UseQueryOptions<AwsCredentialIdentity, Error, AwsCredentialIdentity, GetCredentialsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): Promise<AwsCredentialIdentity> => {
  const queryClient = getQueryClient();
  const queryFn = makeGetCredentialsFetcher();
  return queryClient.fetchQuery({
    queryKey: cognitoIdentityQueryKeys.getCredentials(params),
    queryFn,
    ...config,
    staleTime: 1000 * 60 * 59, // 59 minutes (AWS credentials expire after 20 minutes and our GBS Cache expires after 5 minutes)
    retry: 2,
  });
};
