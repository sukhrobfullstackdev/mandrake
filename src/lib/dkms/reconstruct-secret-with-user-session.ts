import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { WalletType } from '@custom-types/wallet';
import { kmsDecryptQuery } from '@hooks/data/embedded/dkms/kms';

// This function is to encapsulate the logic of reconstructing an Ethereum secret with a user session token
export const reconstructSecretWithUserSession = async ({
  authUserId,
  authUserSessionToken,
  walletType = WalletType.ETH,
}: {
  authUserId: string;
  authUserSessionToken: string;
  walletType?: WalletType;
}) => {
  const { awsCreds, walletInfoData } = await getWalletInfoAndCredentials({
    authUserId,
    authUserSessionToken,
    walletType,
  });

  const privateKey = await kmsDecryptQuery({
    credentials: awsCreds,
    decryptData: walletInfoData.encryptedPrivateAddress,
  });

  return {
    walletInfoData,
    awsCreds,
    privateKey,
  };
};
