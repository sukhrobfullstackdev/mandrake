import { WalletType } from '@custom-types/wallet';
import { useHydrateOrCreateEthWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-eth-wallet';
import { useHydrateOrCreateMultichainWallet } from '@hooks/common/hydrate-or-create-wallets/hydrate-or-create-multichain-wallet';
import { useLogout } from '@hooks/common/logout';
import { isUIAuthMethodPayload } from '@hooks/common/payload-method-type';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getWalletType } from '@utils/network-name';
import { useEffect, useState } from 'react';

/**
 * This hook is responsible for hydrating or creating wallets for the user.
 * This hook now would guarantee cases, where user is signed in but wallet is not created or hydrated.
 */
export function useHydrateOrCreateWallets({ enabled = true }: { enabled?: boolean } = {}) {
  const { logout } = useLogout();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const chainType = getWalletType(ethNetwork, ext); // 'ETH' if not multichain

  const {
    isEthWalletHydrated,
    ethWalletHydrationError,
    credentialsData: ethWalletCredential,
    walletInfoData: ethWalletInfo,
  } = useHydrateOrCreateEthWallet();

  const {
    isMultichainWalletHydrated,
    multichainWalletHydrationError,
    credentialsData: multichainWalletCredential,
    walletInfoData: multichainWalletInfo,
  } = useHydrateOrCreateMultichainWallet({ enabled: enabled && chainType !== WalletType.ETH, walletType: chainType });

  const [areWalletsCreated, setAreWalletsCreated] = useState(false);
  const [walletCreationError, setWalletCreationError] = useState('');

  useEffect(() => {
    if (isEthWalletHydrated && isMultichainWalletHydrated) {
      setAreWalletsCreated(true);
    }
  }, [isEthWalletHydrated, isMultichainWalletHydrated]);

  /**
   * Error handler
   */
  useEffect(() => {
    // If any of wallet creation step is failing, we need to log out the user, and let them restart
    if (ethWalletHydrationError || multichainWalletHydrationError) {
      setWalletCreationError(`${ethWalletHydrationError || ''} ${multichainWalletHydrationError || ''}`);
      logger.error('Wallet hydrating or creation error', {
        data: {
          isEthWalletHydrated,
          isMultichainWalletHydrated,
          ethWalletHydrationError,
          multichainWalletHydrationError,
        },
      });

      // Only do logout for auth flow,
      if (isUIAuthMethodPayload(activeRpcPayload)) {
        logout();
      }
    }
  }, [ethWalletHydrationError, multichainWalletHydrationError]);

  return {
    areWalletsCreated,
    isEthWalletHydrated,
    isMultichainWalletHydrated,
    walletCreationError,
    ethWalletInfo,
    ethWalletCredential,
    multichainWalletInfo,
    multichainWalletCredential,

    // current selected chain
    currentChainWalletInfo: chainType === WalletType.ETH ? ethWalletInfo : multichainWalletInfo,
    currentChainWalletCredential: chainType === WalletType.ETH ? ethWalletCredential : multichainWalletCredential,
  };
}
