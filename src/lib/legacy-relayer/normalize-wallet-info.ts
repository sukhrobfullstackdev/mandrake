import { UniversalUserInfoRetrieveResponse, WalletInfo, WalletType } from '@custom-types/wallet';

export function normalizeWalletInfo(data: UniversalUserInfoRetrieveResponse): WalletInfo {
  return {
    delegatedWalletInfo: {
      delegatedAccessToken: data.delegatedWalletInfo.delegatedAccessToken,
      delegatedIdentityId: data.delegatedWalletInfo.delegatedIdentityId,
      delegatedKeyId: data.delegatedWalletInfo.delegatedKeyId,
      delegatedPoolId: data.delegatedWalletInfo.delegatedPoolId,
    },
    encryptedPrivateAddress: data.encryptedPrivateAddress,
    encryptedSeedPhrase: data.encryptedSeedPhrase,
    hdPath: data.hdPath,
    publicAddress: data.publicAddress,
    shouldCreateWallet: data.delegatedWalletInfo.shouldCreateDelegatedWallet,
    usedChainIds: data.usedChainIds,
    utcTimestampMs: data.utcTimestampMs,
    walletId: data.authUserWalletId,
    walletScope: data.walletScope,
    network: '',
    walletType: WalletType.ETH,
    walletPregenData: null,
  };
}
