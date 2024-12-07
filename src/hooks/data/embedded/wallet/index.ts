import { useQuery, UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { makeWalletInfoFetcher } from './fetchers';

import { Endpoint } from '@constants/endpoint';
import { WalletInfo, WalletSyncResponse } from '@custom-types/wallet';
import { HttpService } from '@http-services';
import { isGlobalAppScope, setGlobalAppScopeHeaders } from '@lib/utils/connect-utils';
import { WalletInfoQueryKey } from './keys';
import { getQueryClient } from '@common/query-client';

export * from './fetchers';
export * from './keys';

export interface UseSyncWalletParams {
  authUserId: string;
  publicAddress: string;
  walletType: string;
  encryptedPrivateAddress?: string;
  encryptedMagicPrivateAddressShare?: string;
  encryptedClientPrivateAddressShare?: string;
  encryptedSeedPhrase?: string;
  encryptedMagicSeedPhraseShare?: string;
  encryptedClientSeedPhraseShare?: string;
  hdDath?: string;
  clientShareMetadata?: object;
}

export const useWalletInfoQuery = (
  queryKey: WalletInfoQueryKey,
  config?: Omit<UseQueryOptions<WalletInfo, Error, WalletInfo, WalletInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<WalletInfo> => {
  const queryFn = makeWalletInfoFetcher();

  return useQuery({
    queryKey,
    queryFn,
    ...config,
    retry: 2,
  });
};

export const getWalletInfoQuery = (
  queryKey: WalletInfoQueryKey,
  config?: Omit<UseQueryOptions<WalletInfo, Error, WalletInfo, WalletInfoQueryKey>, 'queryKey' | 'queryFn'>,
): Promise<WalletInfo> => {
  const queryClient = getQueryClient();
  const queryFn = makeWalletInfoFetcher();
  return queryClient.fetchQuery({ queryKey, queryFn, retry: 2, ...config });
};

export function syncWalletQuery(params: UseSyncWalletParams): Promise<WalletSyncResponse> {
  const {
    authUserId,
    publicAddress,
    walletType,
    encryptedClientPrivateAddressShare,
    encryptedClientSeedPhraseShare,
    encryptedMagicPrivateAddressShare,
    encryptedMagicSeedPhraseShare,
    encryptedPrivateAddress,
    encryptedSeedPhrase,
    hdDath,
    clientShareMetadata,
  } = params;
  const body = {
    auth_user_id: authUserId,
    public_address: publicAddress,
    wallet_type: walletType,
    encrypted_private_address: encryptedPrivateAddress,
    encrypted_magic_private_address_share: encryptedMagicPrivateAddressShare,
    encrypted_client_private_address_share: encryptedClientPrivateAddressShare,
    encrypted_seed_phrase: encryptedSeedPhrase,
    encrypted_magic_seed_phrase_share: encryptedMagicSeedPhraseShare,
    encrypted_client_seed_phrase_share: encryptedClientSeedPhraseShare,
    hd_path: hdDath,
    client_share_metadata: clientShareMetadata,
  };

  const endpoint = isGlobalAppScope() ? Endpoint.Universal.Sync : Endpoint.Wallet.SyncWallet;

  return HttpService.Magic.Post(endpoint, { ...setGlobalAppScopeHeaders() }, body);
}
