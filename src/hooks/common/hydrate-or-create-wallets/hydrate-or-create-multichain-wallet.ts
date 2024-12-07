import { useStore } from '@hooks/store';
import { getWalletType } from '@utils/network-name';
import { useEffect, useState } from 'react';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { MagicApiErrorCode } from '@constants/error';
import { getQueryClient } from '@common/query-client';

export function useHydrateOrCreateMultichainWallet({
  enabled = true,
  walletType,
}: {
  enabled?: boolean;
  walletType: WalletType;
}) {
  const queryClient = getQueryClient();

  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const chainType = getWalletType(ethNetwork, ext);

  const [isMultichainWalletHydrated, setIsMultichainWalletHydrated] = useState(walletType === WalletType.ETH);
  const [multichainWalletInfo, setMultichainWalletInfo] = useState<WalletInfo>();
  const [multichainWalletCredential, setMultichainWalletCredential] = useState<AwsCredentialIdentity>();
  const [multichainWalletHydrationError, setMultichainWalletHydrationError] = useState('');

  const getOrCreateMultichainWallet = async () => {
    if (!authUserId || !authUserSessionToken || !enabled || isMultichainWalletHydrated) return;

    try {
      const { awsCreds, walletInfoData } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType,
      });
      setMultichainWalletInfo(walletInfoData);
      setMultichainWalletCredential(awsCreds);
      setIsMultichainWalletHydrated(true);
    } catch (err) {
      const error = err as ApiResponseError;
      if (error.response?.error_code === MagicApiErrorCode.WALLET_EXISTS_FOR_AUTH_USER) {
        await queryClient.resetQueries({ queryKey: [['wallet', 'info']] });
        setIsMultichainWalletHydrated(true);
      } else {
        setMultichainWalletHydrationError(`Error creating ${walletType} wallet: ${JSON.stringify(err)}`);
      }
    }
  };

  useEffect(() => {
    if (chainType !== walletType) {
      // Sanity check
      logger.error(`Error creating multichain wallet: Wallet Type ${walletType} mismatch with Chain type ${chainType}`);
    }
    if (enabled || authUserId || authUserSessionToken) {
      getOrCreateMultichainWallet();
    }
  }, [authUserId, authUserSessionToken, enabled]);

  return {
    isMultichainWalletHydrated,
    multichainWalletHydrationError,
    walletInfoData: multichainWalletInfo,
    credentialsData: multichainWalletCredential,
  };
}
