import { MagicApiErrorCode } from '@constants/error';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { useStore } from '@hooks/store';
import { getQueryClient } from '@common/query-client';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { useEffect, useState } from 'react';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { AwsCredentialIdentity } from '@aws-sdk/types';

export function useHydrateOrCreateEthWallet({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = getQueryClient();

  const { authUserId, authUserSessionToken } = useStore(state => state);

  const [isEthWalletHydrated, setIsEthWalletHydrated] = useState(false);
  const [ethWalletInfo, setEthWalletInfo] = useState<WalletInfo>();
  const [ethWalletCredential, setEthWalletCredential] = useState<AwsCredentialIdentity>();
  const [ethWalletHydrationError, setEthWalletHydrationError] = useState('');

  const getOrCreateEthWallet = async () => {
    if (!authUserId || !authUserSessionToken || !enabled || isEthWalletHydrated) return;

    try {
      const { awsCreds, walletInfoData } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });
      setEthWalletInfo(walletInfoData);
      setEthWalletCredential(awsCreds);
      setIsEthWalletHydrated(true);
    } catch (err) {
      const error = err as ApiResponseError;
      if (error.response?.error_code === MagicApiErrorCode.WALLET_EXISTS_FOR_AUTH_USER) {
        await queryClient.resetQueries({ queryKey: [['wallet', 'info']] });
        setIsEthWalletHydrated(true);
      } else {
        setEthWalletHydrationError(`Error hydrating eth wallet: ${JSON.stringify(err)}`);
      }
    }
  };

  useEffect(() => {
    if (enabled || authUserId || authUserSessionToken) {
      getOrCreateEthWallet();
    }
  }, [authUserId, authUserSessionToken, enabled]);

  return {
    isEthWalletHydrated,
    ethWalletHydrationError,
    walletInfoData: ethWalletInfo,
    credentialsData: ethWalletCredential,
  };
}
