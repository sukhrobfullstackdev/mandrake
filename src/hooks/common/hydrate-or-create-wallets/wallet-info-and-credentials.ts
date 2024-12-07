import { AwsCredentialIdentity } from '@aws-sdk/types';
import { getQueryClient } from '@common/query-client';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { getCredentialsQuery } from '@hooks/data/embedded/dkms/cognito-identity';
import { getWalletInfoQuery, walletQueryKeys } from '@hooks/data/embedded/wallet';
import { useStore } from '@hooks/store';
import { syncWallet } from '@lib/dkms/sync-wallet';
import { createMultichainWallet } from '@lib/multichain/create-multichain-wallet';
import { recoverPreGenWallet } from '@lib/pregen-wallets/recover';
import Web3Service from '@utils/web3-services/web3-service';

export type WalletInfoAndCredentialsParams = {
  authUserId: string;
  authUserSessionToken: string;
  walletType: WalletType;
};

export type WalletInfoAndCredentialsResponse = {
  awsCreds: AwsCredentialIdentity;
  walletInfoData: WalletInfo;
};

/**
 * Making these calls sequentially to avoid unexpected input data missing
 */
export const getWalletInfoAndCredentials = async ({
  authUserId,
  authUserSessionToken,
  walletType,
}: WalletInfoAndCredentialsParams): Promise<WalletInfoAndCredentialsResponse> => {
  const queryClient = getQueryClient();
  const { systemClockOffset } = useStore.getState();

  let walletInfo: WalletInfo;

  walletInfo = await getWalletInfoQuery(
    walletQueryKeys.info({
      authUserId,
      walletType,
      authUserSessionToken,
    }),
  );

  const awsCreds = await getCredentialsQuery({
    delegatedAccessToken: walletInfo.delegatedWalletInfo.delegatedAccessToken,
    delegatedIdentityId: walletInfo.delegatedWalletInfo.delegatedIdentityId,
    systemClockOffset,
  });

  // If wallet is not created, create it
  if (walletInfo.shouldCreateWallet) {
    let newWallet;
    if (walletType === WalletType.ETH) {
      if (walletInfo.walletPregenData) {
        const { encryptedDataKey, encryptedPrivateKey } = walletInfo.walletPregenData;
        newWallet = await recoverPreGenWallet(encryptedDataKey, encryptedPrivateKey, awsCreds);
      } else {
        newWallet = await Web3Service.createEthWallet();
      }
    } else {
      // multichain wallet
      newWallet = await createMultichainWallet(authUserId, walletInfo);
    }

    const userInfo = { authUserId: authUserId, authUserSessionToken: authUserSessionToken };
    const syncWalletParams = {
      newWallet,
      walletType,
      walletInfo,
      awsCredentials: awsCreds,
      queryClient,
      userInfo,
    };

    await syncWallet(syncWalletParams);

    // getWalletInfo again, as wallet info has changed
    walletInfo = await getWalletInfoQuery(
      walletQueryKeys.info({
        authUserId,
        walletType,
        authUserSessionToken,
      }),
    );
  }

  return {
    awsCreds,
    walletInfoData: walletInfo,
  };
};
