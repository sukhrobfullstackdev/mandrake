import { AwsCredentialIdentity } from '@aws-sdk/types';
import { OnChainWallet } from '@custom-types/onchain-wallet';
import { UserInfo } from '@custom-types/user';
import { WalletInfo, WalletInfoResponse, WalletType } from '@custom-types/wallet';
import { userQueryKeys } from '@hooks/data/embedded/user/keys';
import { syncWalletQuery, walletQueryKeys } from '@hooks/data/embedded/wallet';
import { getQueryClient } from '@common/query-client';
import { kmsEncryptQuery } from '@hooks/data/embedded/dkms/kms';

type SyncWalletParams = {
  newWallet: OnChainWallet;
  walletType: WalletType;
  walletInfo: WalletInfo;
  awsCredentials: AwsCredentialIdentity;
  userInfo: { authUserId: string; authUserSessionToken: string };
};

export const syncWallet = async (syncWalletParams: SyncWalletParams) => {
  const { newWallet, walletType, walletInfo, awsCredentials, userInfo } = syncWalletParams;

  const queryClient = getQueryClient();

  const encryptionPromises = [
    kmsEncryptQuery({
      credentials: awsCredentials,
      encryptData: newWallet.privateKey,
      delegatedWalletInfo: walletInfo.delegatedWalletInfo,
    }),
  ];
  if (newWallet.mnemonic) {
    encryptionPromises.push(
      kmsEncryptQuery({
        credentials: awsCredentials,
        encryptData: newWallet.mnemonic,
        delegatedWalletInfo: walletInfo.delegatedWalletInfo,
      }),
    );
  }
  const [encryptedPrivateKey, encryptedMnemonic] = await Promise.all(encryptionPromises);
  // TODO: check wallet strategy to determine what data needs to be sent to the server
  // TODO: Re-incorporate split key parameters when we tackle that.
  const walletSyncData = await syncWalletQuery({
    authUserId: userInfo.authUserId,
    publicAddress: newWallet.address,
    walletType,
    encryptedPrivateAddress: encryptedPrivateKey,
    encryptedSeedPhrase: encryptedMnemonic,
    hdDath: newWallet.HDWalletPath,
    clientShareMetadata: {},
  });

  const cacheKeys = {
    authUserId: userInfo.authUserId,
    authUserSessionToken: userInfo.authUserSessionToken,
    walletType,
  };

  /**
   * Update the wallet info in the cache
   */
  queryClient.setQueriesData(
    { queryKey: walletQueryKeys.info(cacheKeys) },
    (cachedWalletInfo: WalletInfoResponse | undefined) => ({
      ...cachedWalletInfo,
      authWalletId: walletSyncData.walletId,
      shouldCreateWallet: false,
      delegatedWalletInfo: walletInfo.delegatedWalletInfo,
      encryptedPrivateAddress: walletSyncData.encryptedPrivateAddress,
      encryptedSeedPhrase: walletSyncData.encryptedSeedPhrase,
      hdPath: walletSyncData.hdPath,
      publicAddress: walletSyncData.publicAddress,
    }),
  );

  queryClient.setQueriesData({ queryKey: userQueryKeys.info(cacheKeys) }, (cachedUserInfo: UserInfo | undefined) =>
    cachedUserInfo ? { ...cachedUserInfo, publicAddress: walletSyncData.publicAddress } : undefined,
  );
};
