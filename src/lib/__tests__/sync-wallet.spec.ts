import { WalletType } from '@custom-types/wallet';
import { syncWallet } from '@lib/dkms/sync-wallet';
import { kmsEncryptQuery } from '@hooks/data/embedded/dkms/kms';
import { syncWalletQuery } from '@hooks/data/embedded/wallet';
import { getQueryClient } from '@common/query-client';

jest.mock('@hooks/data/embedded/dkms/kms');
jest.mock('@hooks/data/embedded/wallet');
jest.mock('@common/query-client');

describe('syncWallet', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('encrypts wallet keys and syncs wallet data successfully', async () => {
    const mockSetQueriesData = jest.fn();
    (getQueryClient as any).mockReturnValue({
      setQueriesData: mockSetQueriesData,
    });
    const newWallet = {
      privateKey: 'mockPrivateKey',
      mnemonic: 'mockMnemonic',
      address: 'mockAddress',
      HDWalletPath: 'mockPath',
    };
    const walletInfo = { delegatedWalletInfo: 'mockInfo' } as any;
    const awsCredentials = { accessKeyId: 'key-id' } as any;
    const userInfo = { authUserId: '123', authUserSessionToken: 'token' };
    const encryptedPrivateKey = 'encryptedPrivateKey';
    const encryptedMnemonic = 'encryptedMnemonic';
    (kmsEncryptQuery as any).mockResolvedValueOnce(encryptedPrivateKey);
    (kmsEncryptQuery as any).mockResolvedValueOnce(encryptedMnemonic);
    (syncWalletQuery as any).mockResolvedValue({
      walletId: 'walletId123',
      encryptedPrivateAddress: encryptedPrivateKey,
      encryptedSeedPhrase: encryptedMnemonic,
      publicAddress: 'mockAddress',
      hdPath: 'mockPath',
    });

    await syncWallet({
      newWallet,
      walletType: WalletType.ETH,
      walletInfo,
      awsCredentials,
      userInfo,
    });

    expect(kmsEncryptQuery).toHaveBeenCalledTimes(2);
    expect(syncWalletQuery).toHaveBeenCalledWith({
      authUserId: '123',
      publicAddress: 'mockAddress',
      walletType: WalletType.ETH,
      encryptedPrivateAddress: encryptedPrivateKey,
      encryptedSeedPhrase: encryptedMnemonic,
      hdDath: 'mockPath',
      clientShareMetadata: {},
    });

    expect(mockSetQueriesData).toHaveBeenCalled();
  });

  it('handles encryption failures gracefully', async () => {
    const newWallet = {
      privateKey: 'mockPrivateKey',
      address: 'mockAddress',
    } as any;
    const awsCredentials = { accessKeyId: 'key-id' } as any;
    const walletInfo = { delegatedWalletInfo: 'mockInfo' } as any;
    const userInfo = { authUserId: '123', authUserSessionToken: 'token' };
    (kmsEncryptQuery as any).mockRejectedValue(new Error('Encryption failed'));

    await expect(
      syncWallet({
        newWallet,
        walletType: WalletType.ETH,
        walletInfo,
        awsCredentials,
        userInfo,
      }),
    ).rejects.toThrow('Encryption failed');

    expect(syncWalletQuery).not.toHaveBeenCalled();
  });
});
