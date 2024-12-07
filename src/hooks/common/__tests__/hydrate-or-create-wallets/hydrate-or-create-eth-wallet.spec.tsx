import { act, renderHook } from '@testing-library/react';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useStore } from '@hooks/store';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import Web3Service from '@utils/web3-services/web3-service';

jest.mock('@hooks/data/embedded/wallet');
jest.mock('@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials');
jest.mock('@utils/web3-services/web3-service');
jest.mock('@lib/dkms/sync-wallet');

describe('useHydrateOrCreateEthWallet', () => {
  const mockAuthUserId = 'test-user-id';
  const mockAuthUserSessionToken = 'test-session-token';
  const mockAwsCreds = { accessKeyId: 'test', secretAccessKey: 'test', sessionToken: 'test' };
  const mockWalletInfo = { shouldCreateWallet: true, walletPregenData: null };

  beforeEach(() => {
    jest.resetModules();
    (getWalletInfoAndCredentials as jest.Mock).mockResolvedValue({
      awsCreds: mockAwsCreds,
      walletInfoData: mockWalletInfo,
    });
    (Web3Service.createEthWallet as jest.Mock).mockResolvedValue({
      address: '0x123',
      privateKey: 'test-private-key',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize correctly', async () => {
    let hook: any;

    await act(async () => {
      hook = await renderHook(() => useHydrateOrCreateEthWallet());
    });

    expect(hook.result.current.isEthWalletHydrated).toBe(false);
    expect(hook.result.current.ethWalletHydrationError).toBe('');
    expect(hook.result.current.walletInfoData).toBeUndefined();
    expect(hook.result.current.credentialsData).toBeUndefined();
  });

  it('should handle wallet creation correctly', async () => {
    useStore.setState({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
    });
    let hook: any;

    await act(async () => {
      hook = await renderHook(() => useHydrateOrCreateEthWallet());
    });
    expect(hook.result.current.isEthWalletHydrated).toBe(true);
    expect(hook.result.current.ethWalletHydrationError).toBe('');
    expect(hook.result.current.walletInfoData).toEqual(mockWalletInfo);
    expect(hook.result.current.credentialsData).toEqual(mockAwsCreds);
  });

  it('should handle errors correctly', async () => {
    useStore.setState({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
    });
    (getWalletInfoAndCredentials as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    let hook: any;

    await act(async () => {
      hook = await renderHook(() => useHydrateOrCreateEthWallet());
    });
    expect(hook.result.current.isEthWalletHydrated).toBe(false);
    expect(hook.result.current.ethWalletHydrationError).toBe('Error hydrating eth wallet: {}');
    expect(hook.result.current.walletInfoData).toBeUndefined();
    expect(hook.result.current.credentialsData).toBeUndefined();
  });

  it('should set the correct states', async () => {
    useStore.setState({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
    });
    let hook: any;

    await act(async () => {
      hook = await renderHook(() => useHydrateOrCreateEthWallet());
    });
    expect(hook.result.current.isEthWalletHydrated).toBe(true);
    expect(hook.result.current.ethWalletHydrationError).toBe('');
    expect(hook.result.current.walletInfoData).toEqual(mockWalletInfo);
    expect(hook.result.current.credentialsData).toEqual(mockAwsCreds);
  });
});
