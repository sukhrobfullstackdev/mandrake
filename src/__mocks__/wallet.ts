import { WalletType } from '@custom-types/wallet';

export const mockWalletInfo1 = {
  delegatedWalletInfo: {
    delegatedAccessToken: '123',
    delegatedIdentityId: 'abc',
    delegatedKeyId: '789',
    delegatedPoolId: 'xyz',
  },
  encryptedPrivateAddress: '123abc456def',
  encryptedSeedPhrase: '789xyz012abc',
  hdPath: 'm/44/60/0/0/0',
  network: 'ETH',
  publicAddress: '0x1234567890abcdef',
  shouldCreateWallet: false,
  usedChainIds: ['111', '222', '3333'],
  utcTimestampMs: 1234567890,
  walletId: '12345',
  walletScope: '123abc456def',
  walletType: WalletType.ETH,
  walletPregenData: null,
};
