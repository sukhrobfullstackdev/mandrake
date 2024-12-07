import { WalletType } from '@custom-types/wallet';
import { useHydrateOrCreateMultichainWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet';
import { useStore } from '@hooks/store';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { getWalletInfoQuery } from '@hooks/data/embedded/wallet';
import { createMultichainWallet } from '@lib/multichain/create-multichain-wallet';
import { act, renderHook } from '@testing-library/react';

jest.mock('@hooks/data/embedded/wallet');
jest.mock('@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials');
jest.mock('@lib/multichain/create-multichain-wallet');
jest.mock('@hooks/data/embedded/multichain/hedera');
jest.mock('@hooks/data/embedded/multichain/flow');
jest.mock('@hooks/data/embedded/multichain/kadena');
jest.mock('@lib/dkms/sync-wallet');

describe('useMultichainWallet', () => {
  const mockAuthUserId = 'test-user-id';
  const mockAuthUserSessionToken = 'test-session-token';
  const mockAwsCreds = { accessKeyId: 'test', secretAccessKey: 'test', sessionToken: 'test' };
  const mockWalletInfo = { shouldCreateWallet: true, publicAddress: '0x123' };

  beforeEach(() => {
    jest.resetModules();
    (getWalletInfoAndCredentials as jest.Mock).mockResolvedValue({
      awsCreds: mockAwsCreds,
      walletInfoData: mockWalletInfo,
    });
    (getWalletInfoQuery as jest.Mock).mockResolvedValue(mockWalletInfo);
    (createMultichainWallet as jest.Mock).mockResolvedValue({
      address: '0x123',
      privateKey: 'test-private-key',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not initialize Multichain wallet', async () => {
    let hook: any;

    await act(async () => {
      hook = await renderHook(() =>
        useHydrateOrCreateMultichainWallet({ enabled: true, walletType: WalletType.HEDERA }),
      );
    });

    expect(hook.result.current.isMultichainWalletHydrated).toBe(false);
    expect(hook.result.current.multichainWalletHydrationError).toBe('');
    expect(hook.result.current.walletInfoData).toBeUndefined();
    expect(hook.result.current.credentialsData).toBeUndefined();
  });

  it('should not initialize Multichain wallet', async () => {
    let hook: any;
    useStore.setState({
      decodedQueryParams: {
        ethNetwork: 'mainnet',
        ext: { hedera: { chainType: 'HEDERA', options: { network: 'mainnet' } } },
      },
    });

    await act(async () => {
      hook = await renderHook(() =>
        useHydrateOrCreateMultichainWallet({ enabled: true, walletType: WalletType.HEDERA }),
      );
    });

    expect(hook.result.current.isMultichainWalletHydrated).toBe(false);
    expect(hook.result.current.multichainWalletHydrationError).toBe('');
    expect(hook.result.current.walletInfoData).toBeUndefined();
    expect(hook.result.current.credentialsData).toBeUndefined();
  });

  it('should handle wallet creation correctly', async () => {
    useStore.setState({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      decodedQueryParams: {
        ethNetwork: 'mainnet',
        ext: { hedera: { chainType: 'HEDERA', options: { network: 'mainnet' } } },
      },
    });
    let hook: any;

    await act(async () => {
      hook = await renderHook(() =>
        useHydrateOrCreateMultichainWallet({ enabled: true, walletType: WalletType.HEDERA }),
      );
    });

    expect(hook.result.current.isMultichainWalletHydrated).toBe(true);
    expect(hook.result.current.multichainWalletHydrationError).toBe('');
    expect(hook.result.current.credentialsData).toEqual(mockAwsCreds);
    expect(hook.result.current.walletInfoData).toEqual(mockWalletInfo);
  });

  it('should handle errors correctly', async () => {
    useStore.setState({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      decodedQueryParams: {
        ethNetwork: 'mainnet',
        ext: { hedera: { chainType: 'HEDERA', options: { network: 'mainnet' } } },
      },
    });
    (getWalletInfoAndCredentials as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    let hook: any;

    await act(async () => {
      hook = await renderHook(() =>
        useHydrateOrCreateMultichainWallet({ enabled: true, walletType: WalletType.HEDERA }),
      );
    });
    expect(hook.result.current.isMultichainWalletHydrated).toBe(false);
    expect(hook.result.current.multichainWalletHydrationError).toBe('Error creating HEDERA wallet: {}');
    expect(hook.result.current.walletInfoData).toBeUndefined();
    expect(hook.result.current.credentialsData).toBeUndefined();
  });

  it('should set the correct states', async () => {
    useStore.setState({
      authUserId: mockAuthUserId,
      authUserSessionToken: mockAuthUserSessionToken,
      decodedQueryParams: {
        ethNetwork: 'mainnet',
        ext: { hedera: { chainType: 'HEDERA', options: { network: 'mainnet' } } },
      },
    });
    let hook: any;

    await act(async () => {
      hook = await renderHook(() =>
        useHydrateOrCreateMultichainWallet({ enabled: true, walletType: WalletType.HEDERA }),
      );
    });
    expect(hook.result.current.isMultichainWalletHydrated).toBe(true);
    expect(hook.result.current.multichainWalletHydrationError).toBe('');
    expect(hook.result.current.credentialsData).toEqual(mockAwsCreds);
    expect(hook.result.current.walletInfoData).toEqual(mockWalletInfo);
  });
});
