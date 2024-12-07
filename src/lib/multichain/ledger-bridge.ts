import { LedgerSupportDictionary } from '@constants/ledger-bridge';
import { ledgerMap } from '@constants/ledger-map';
import { ILedgerBridge } from '@custom-types/ledger-bridge';
import { ExtensionOptions } from '@custom-types/params';
import { GetAccountThunk } from '@lib/multichain/create-multichain-wallet';
import { getChainId, getLedgerNodeUrl, getWalletExtensionOptions, getWalletType } from '@lib/utils/network-name';
import { capitalize } from '@lib/utils/string-utils';

interface BridgeResult {
  ledgerMethodsMapping: Record<string, string>;
  ledgerBridge: ILedgerBridge;
}

export async function createBridge(
  getAccount: GetAccountThunk,
  ethNetwork: object | string | undefined,
  ext?: ExtensionOptions,
): Promise<BridgeResult> {
  const walletType = getWalletType(ethNetwork, ext);
  const rpcUrl = getLedgerNodeUrl(ethNetwork, ext);
  const chainId = getChainId(ethNetwork, ext);

  const extensionOptions = getWalletExtensionOptions(ext);

  const bridgeKey = `${capitalize(walletType)}Bridge`;
  const Bridge = (await ledgerMap[bridgeKey]()).default;
  const ledgerBridge = new Bridge(rpcUrl, chainId, extensionOptions);

  ledgerBridge.getAccount = getAccount;
  const ledgerMethodsMapping = LedgerSupportDictionary[walletType];

  return {
    ledgerMethodsMapping,
    ledgerBridge,
  };
}
