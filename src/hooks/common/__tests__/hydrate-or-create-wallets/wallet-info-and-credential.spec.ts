import { getWalletInfoQuery, walletQueryKeys } from '@hooks/data/embedded/wallet';
import { syncWallet } from '@lib/dkms/sync-wallet';
import { getQueryClient } from '@common/query-client';
import { recoverPreGenWallet } from '@lib/pregen-wallets/recover';
import Web3Service from '@utils/web3-services/web3-service';
import { getCredentialsQuery } from '@hooks/data/embedded/dkms/cognito-identity';
import { WalletType } from '@custom-types/wallet';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { createMultichainWallet } from '@lib/multichain/create-multichain-wallet';

jest.mock('@hooks/data/embedded/wallet', () => ({
  getWalletInfoQuery: jest.fn(),
  walletQueryKeys: {
    info: jest.fn(),
  },
}));

jest.mock('@lib/multichain/create-multichain-wallet', () => ({
  createMultichainWallet: jest.fn(),
}));

jest.mock('@lib/dkms/sync-wallet', () => ({
  syncWallet: jest.fn(),
}));

jest.mock('@common/query-client', () => ({
  getQueryClient: jest.fn(),
}));

jest.mock('@lib/pregen-wallets/recover', () => ({
  recoverPreGenWallet: jest.fn(),
}));

jest.mock('@utils/web3-services/web3-service', () => ({
  createEthWallet: jest.fn(),
}));

jest.mock('@hooks/data/embedded/dkms/cognito-identity', () => ({
  getCredentialsQuery: jest.fn(),
}));

describe('getWalletInfoAndCredentials', () => {
  const mockAuthUserId = 'test-user-id';
  const mockAuthUserSessionToken = 'test-session-token';
  const mockAwsCreds = { accessKeyId: 'test-access-key', secretAccessKey: 'test-secret-key' };
  const mockWalletInfo = {
    shouldCreateWallet: false,
    walletPregenData: null,
    delegatedWalletInfo: {
      delegatedAccessToken: 'delegated-token',
      delegatedIdentityId: 'identity-id',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getQueryClient as jest.Mock).mockReturnValue({});
    (getWalletInfoQuery as jest.Mock).mockResolvedValue(mockWalletInfo);
    (getCredentialsQuery as jest.Mock).mockResolvedValue(mockAwsCreds);
  });

  it('should return wallet info and credentials when wallet is already created', async () => {
    await getWalletInfoAndCredentials({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      walletType: WalletType.ETH,
    });

    expect(getWalletInfoQuery).toHaveBeenCalledWith(
      walletQueryKeys.info({
        authUserId: mockAuthUserId,
        walletType: WalletType.ETH,
        authUserSessionToken: mockAuthUserSessionToken,
      }),
    );
    expect(getCredentialsQuery).toHaveBeenCalledWith({
      delegatedAccessToken: mockWalletInfo.delegatedWalletInfo.delegatedAccessToken,
      delegatedIdentityId: mockWalletInfo.delegatedWalletInfo.delegatedIdentityId,
      systemClockOffset: 0,
    });
  });

  it('should create a new wallet if it should be created', async () => {
    const newWallet = { address: '0x1234' };
    const updatedWalletInfo = { ...mockWalletInfo, shouldCreateWallet: true };
    (getWalletInfoQuery as jest.Mock).mockResolvedValueOnce(updatedWalletInfo);
    (Web3Service.createEthWallet as jest.Mock).mockResolvedValueOnce(newWallet);

    await getWalletInfoAndCredentials({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      walletType: WalletType.ETH,
    });

    expect(Web3Service.createEthWallet).toHaveBeenCalled();
    expect(syncWallet).toHaveBeenCalledWith({
      newWallet,
      walletType: WalletType.ETH,
      walletInfo: updatedWalletInfo,
      awsCredentials: mockAwsCreds,
      queryClient: expect.anything(),
      userInfo: {
        authUserId: mockAuthUserId,
        authUserSessionToken: mockAuthUserSessionToken,
      },
    });
    expect(getWalletInfoQuery).toHaveBeenCalledWith(
      walletQueryKeys.info({
        authUserId: mockAuthUserId,
        walletType: WalletType.ETH,
        authUserSessionToken: mockAuthUserSessionToken,
      }),
    );
  });

  it('should recover pre-generated wallet if pre-gen data exists', async () => {
    const preGenWallet = { encryptedDataKey: 'test-data-key', encryptedPrivateKey: 'test-private-key' };
    const newWallet = { address: '0x1234' };
    const updatedWalletInfo = {
      ...mockWalletInfo,
      shouldCreateWallet: true,
      walletPregenData: preGenWallet,
    };
    (getWalletInfoQuery as jest.Mock).mockResolvedValueOnce(updatedWalletInfo);
    (recoverPreGenWallet as jest.Mock).mockResolvedValueOnce(newWallet);

    await getWalletInfoAndCredentials({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      walletType: WalletType.ETH,
    });

    expect(recoverPreGenWallet).toHaveBeenCalledWith(
      preGenWallet.encryptedDataKey,
      preGenWallet.encryptedPrivateKey,
      mockAwsCreds,
    );
    expect(syncWallet).toHaveBeenCalledWith({
      newWallet,
      walletType: WalletType.ETH,
      walletInfo: updatedWalletInfo,
      awsCredentials: mockAwsCreds,
      queryClient: expect.anything(),
      userInfo: {
        authUserId: mockAuthUserId,
        authUserSessionToken: mockAuthUserSessionToken,
      },
    });
  });

  it('should create a new Flow multichain wallet if it should be created', async () => {
    const newWallet = { address: 'flow-1234' };
    const updatedWalletInfo = { ...mockWalletInfo, shouldCreateWallet: true };
    (getWalletInfoQuery as jest.Mock).mockResolvedValueOnce(updatedWalletInfo);
    (createMultichainWallet as jest.Mock).mockResolvedValueOnce(newWallet);

    await getWalletInfoAndCredentials({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      walletType: WalletType.FLOW, // Flow multichain wallet type
    });

    expect(createMultichainWallet).toHaveBeenCalledWith(mockAuthUserId, updatedWalletInfo);
    expect(syncWallet).toHaveBeenCalledWith({
      newWallet,
      walletType: WalletType.FLOW,
      walletInfo: updatedWalletInfo,
      awsCredentials: mockAwsCreds,
      queryClient: expect.anything(),
      userInfo: {
        authUserId: mockAuthUserId,
        authUserSessionToken: mockAuthUserSessionToken,
      },
    });
    expect(getWalletInfoQuery).toHaveBeenCalledWith(
      walletQueryKeys.info({
        authUserId: mockAuthUserId,
        walletType: WalletType.FLOW,
        authUserSessionToken: mockAuthUserSessionToken,
      }),
    );
  });
});
