import { UseQueryOptions } from '@tanstack/react-query';
import { getQueryClient } from '@common/query-client';
import {
  KmsDecryptParams,
  KmsDecryptQueryKey,
  KmsEncryptParams,
  KmsEncryptQueryKey,
  kmsQueryKeys,
} from '@hooks/data/embedded/dkms/kms/keys';
import { makeKmsDecryptFetcher, makeKmsEncryptFetcher } from '@hooks/data/embedded/dkms/kms/fetchers';

/** Don't call this directly, please use DKMSService.reconstructSecret */
export const kmsDecryptQuery = (
  params: KmsDecryptParams,
  config?: Omit<UseQueryOptions<string, Error, string, KmsDecryptQueryKey>, 'queryKey' | 'queryFn'>,
): Promise<string> => {
  const queryClient = getQueryClient();
  const queryFn = makeKmsDecryptFetcher();
  return queryClient.fetchQuery({
    queryKey: kmsQueryKeys.kmsDecrypt(params),
    queryFn,
    retry: 1,
    ...config,
  });
};

export const kmsEncryptQuery = (
  params: KmsEncryptParams,
  config?: Omit<UseQueryOptions<string, Error, string, KmsEncryptQueryKey>, 'queryKey' | 'queryFn'>,
): Promise<string> => {
  const queryClient = getQueryClient();
  const queryFn = makeKmsEncryptFetcher();
  return queryClient.fetchQuery({
    queryKey: kmsQueryKeys.kmsEncrypt(params),
    queryFn,
    ...config,
  });
};
