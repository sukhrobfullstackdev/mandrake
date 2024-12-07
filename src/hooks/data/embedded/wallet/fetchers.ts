import { Endpoint } from '@constants/endpoint';
import { WalletInfo } from '@custom-types/wallet';
import { HttpService } from '@http-services';
import { normalizeWalletInfo } from '@lib/legacy-relayer/normalize-wallet-info';
import { isGlobalAppScope } from '@lib/utils/connect-utils';
import { type QueryFunction } from '@tanstack/react-query';
import { WalletInfoQueryKey } from './keys';

export type WalletInfoBody = {
  auth_user_refresh_token: string;
};

export type WalletSyncBody = {
  auth_user_id: string;
  public_address: string;
  encrypted_private_address?: string;
  wallet_type: string;
  encrypted_seed_phrase?: string;
  hd_path?: string;
};

export const makeWalletInfoFetcher =
  (): QueryFunction<WalletInfo, WalletInfoQueryKey> =>
  async ({ queryKey: [, { authUserId, walletType, authUserSessionToken }] }): Promise<WalletInfo> => {
    const headers = {
      Authorization: `Bearer ${authUserSessionToken}`,
    };

    if (isGlobalAppScope()) {
      const userInfoRetrieve = await HttpService.Magic.Get(
        `${Endpoint.Universal.UserInfoRetrieve}?auth_user_id=${authUserId}&wallet_type=${walletType}`,
        headers,
      );
      return normalizeWalletInfo(userInfoRetrieve);
    }

    return HttpService.Magic.Get(
      `${Endpoint.Wallet.GetWalletInfo}?auth_user_id=${authUserId}&wallet_type=${walletType}`,
      headers,
    );
  };
