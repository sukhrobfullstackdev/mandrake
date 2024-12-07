import { FlowAddress, HederaAccounts, KadenaPublicKeys } from '@constants/ledger-bridge';
import { OnChainWallet } from '@custom-types/onchain-wallet';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { useStore } from '@hooks/store';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { getNetworkName, getWalletType } from '@lib/utils/network-name';
import { isMobileSdk } from '@lib/utils/platform';
import { flowSeedWalletQuery } from '@hooks/data/embedded/multichain/flow';
import { hederaSignMessageQuery } from '@hooks/data/embedded/multichain/hedera';
import { kadenaCreateWalletQuery } from '@hooks/data/embedded/multichain/kadena';

export type GetAccountThunk = () => string;

export async function createMultichainWallet(authUserId: string, walletInfo: WalletInfo): Promise<OnChainWallet> {
  const { apiKey, ethNetwork, version, ext, sdkType, domainOrigin } = useStore.getState().decodedQueryParams;

  const getAccount = () => walletInfo.publicAddress;
  const flowSeedWallet = (encodedPublicKey: string, network: string) =>
    flowSeedWalletQuery({ authUserId: authUserId, encodedPublicKey, network }).then(data => ({ data }));
  const hederaSign = (message: string) =>
    hederaSignMessageQuery({ message, authUserId: authUserId }).then(data => ({
      data,
    }));
  const kadenaCreateWallet = (hash: string) =>
    kadenaCreateWalletQuery({ authUserId: authUserId || '', hash }).then(data => ({ data }));

  const walletType = getWalletType(ethNetwork, ext);
  const isMobile = isMobileSdk(sdkType, domainOrigin);
  const multichainBridge = (await createBridge(getAccount, ethNetwork, ext)).ledgerBridge;
  const network = getNetworkName(ethNetwork, version, apiKey || '', isMobile, ext);

  const createWalletArgs = [] as unknown[];
  let getBalancePayload;
  let masterWalletAddress;
  const isMainnet = network.toLowerCase() === 'mainnet';

  switch (walletType) {
    case WalletType.FLOW: {
      masterWalletAddress = FlowAddress[isMainnet ? 'mainnet' : 'testnet'];
      createWalletArgs.push(flowSeedWallet, masterWalletAddress, network);

      /**
       * TODO: must update `getBalance` cadence script in
       * ledger-bridge for cadence 1.0 before re-enabling this
       */
      // getBalancePayload = { params: { address: `0x${masterWalletAddress}`, network } };
      break;
    }
    case WalletType.HEDERA: {
      const masterAccount = HederaAccounts[isMainnet ? 'mainnet' : 'testnet'];
      masterWalletAddress = masterAccount.accountId;

      createWalletArgs.push(hederaSign, masterAccount);

      getBalancePayload = { params: { account: masterAccount, hederaSign } };
      break;
    }
    case WalletType.KADENA: {
      masterWalletAddress = KadenaPublicKeys[isMainnet ? 'mainnet' : 'testnet'];
      createWalletArgs.push(kadenaCreateWallet, masterWalletAddress);
      getBalancePayload = { params: { address: `k:${masterWalletAddress}` } };
      break;
    }
    default: // rest of the chains, no-op
      break;
  }

  const wallet = await multichainBridge.createWallet(...createWalletArgs);

  if (getBalancePayload) {
    try {
      const balance = await multichainBridge.getBalance(getBalancePayload);
      const masterWalletBalanceMetadata = { balance, address: masterWalletAddress, network };
      logger.info(`${walletType} ${network} master account balance`, { masterWalletBalanceMetadata });
    } catch (error) {
      logger.error(`Failed to fetch master account balance for ${walletType} on ${network}`, { error });
    }
  }
  return wallet;
}
