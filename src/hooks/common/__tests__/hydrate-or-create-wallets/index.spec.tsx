import { renderHook } from '@testing-library/react';
import { useLogout } from '@hooks/common/logout';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useStore } from '@hooks/store';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useHydrateOrCreateMultichainWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet';
import { WalletType } from '@custom-types/wallet';
import { getWalletType } from '@utils/network-name';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';

// Mock dependencies
jest.mock('@hooks/common/logout', () => ({
  useLogout: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet', () => ({
  useHydrateOrCreateEthWallet: jest.fn(),
}));

jest.mock('@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet', () => ({
  useHydrateOrCreateMultichainWallet: jest.fn(),
}));

jest.mock('@utils/network-name', () => ({
  getWalletType: jest.fn(),
}));

describe('useHydrateOrCreateWallets', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    AtomicRpcPayloadService.reset();
    (useLogout as jest.Mock).mockReturnValue({ logout: mockLogout });
    useStore.setState({
      decodedQueryParams: {
        ethNetwork: 'eth-network',
        ext: { hedera: { chainType: 'HEDERA', options: { network: 'mainnet' } } },
      },
    });
    (getWalletType as jest.Mock).mockReturnValue(WalletType.ETH);

    (useHydrateOrCreateEthWallet as jest.Mock).mockReturnValue({
      isEthWalletHydrated: true,
      ethWalletHydrationError: '',
      credentialsData: { accessKeyId: 'eth-key' },
      walletInfoData: { walletAddress: 'eth-address' },
    });

    (useHydrateOrCreateMultichainWallet as jest.Mock).mockReturnValue({
      isMultichainWalletHydrated: true,
      multichainWalletHydrationError: '',
      credentialsData: { accessKeyId: 'multichain-key' },
      walletInfoData: { walletAddress: 'multichain-address' },
    });
  });

  it('should return hydrated wallets information when both wallets are hydrated', () => {
    const { result } = renderHook(() => useHydrateOrCreateWallets());

    expect(result.current.areWalletsCreated).toBe(true);
    expect(result.current.isEthWalletHydrated).toBe(true);
    expect(result.current.isMultichainWalletHydrated).toBe(true);
    expect(result.current.ethWalletInfo).toEqual({ walletAddress: 'eth-address' });
    expect(result.current.multichainWalletInfo).toEqual({ walletAddress: 'multichain-address' });
    expect(result.current.ethWalletCredential).toEqual({ accessKeyId: 'eth-key' });
    expect(result.current.multichainWalletCredential).toEqual({ accessKeyId: 'multichain-key' });
    expect(result.current.currentChainWalletInfo).toEqual({ walletAddress: 'eth-address' });
    expect(result.current.currentChainWalletCredential).toEqual({ accessKeyId: 'eth-key' });
  });

  it('should handle hydration errors and logout the user in an auth flow', () => {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_email_otp',
      id: 'my_id',
      params: [{ email: 'test@mgail.com' }],
    });
    // Set mock error for the Ethereum wallet
    (useHydrateOrCreateEthWallet as jest.Mock).mockReturnValue({
      isEthWalletHydrated: false,
      ethWalletHydrationError: 'eth error',
      credentialsData: null,
      walletInfoData: null,
    });

    const { result } = renderHook(() => useHydrateOrCreateWallets());

    expect(result.current.walletCreationError).toBe('eth error ');
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should set areWalletsCreated to false if any wallet is not hydrated', () => {
    (useHydrateOrCreateEthWallet as jest.Mock).mockReturnValue({
      isEthWalletHydrated: false,
      ethWalletHydrationError: '',
      credentialsData: null,
      walletInfoData: null,
    });

    const { result } = renderHook(() => useHydrateOrCreateWallets());

    expect(result.current.areWalletsCreated).toBe(false);
    expect(result.current.isEthWalletHydrated).toBe(false);
    expect(result.current.isMultichainWalletHydrated).toBe(true);
  });

  it('should handle multichain wallet hydration error and logout the user', () => {
    AtomicRpcPayloadService.setActiveRpcPayload({
      jsonrpc: '2.0',
      method: 'magic_auth_login_with_email_otp',
      id: 'my_id',
      params: [{ email: 'test@mgail.com' }],
    });
    (useHydrateOrCreateMultichainWallet as jest.Mock).mockReturnValue({
      isMultichainWalletHydrated: false,
      multichainWalletHydrationError: 'multichain error',
      credentialsData: null,
      walletInfoData: null,
    });

    const { result } = renderHook(() => useHydrateOrCreateWallets());

    expect(result.current.walletCreationError).toBe(' multichain error');
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should select the correct chain wallet info and credentials based on the chain type', () => {
    // Test for Ethereum chain
    (getWalletType as jest.Mock).mockReturnValue(WalletType.ETH);
    const { result } = renderHook(() => useHydrateOrCreateWallets());
    expect(result.current.currentChainWalletInfo).toEqual({ walletAddress: 'eth-address' });
    expect(result.current.currentChainWalletCredential).toEqual({ accessKeyId: 'eth-key' });

    // Test for Multichain
    (getWalletType as jest.Mock).mockReturnValue(WalletType.HEDERA);
    const { result: multichainResult } = renderHook(() => useHydrateOrCreateWallets());
    expect(multichainResult.current.currentChainWalletInfo).toEqual({ walletAddress: 'multichain-address' });
    expect(multichainResult.current.currentChainWalletCredential).toEqual({ accessKeyId: 'multichain-key' });
  });
});
