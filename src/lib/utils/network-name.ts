import { DEPLOY_ENV } from '@constants/env';
import { ethereumProviderUrls } from '@constants/ethereum-provider-urls';
import { LedgerSupportDictionary } from '@constants/ledger-bridge';
import { ExtensionOptions } from '@custom-types/params';
import { WalletType } from '@custom-types/wallet';
import { useStore } from '@hooks/store';
import { pickRandomly } from '@lib/pick-randomly';
import { isEmpty } from '@lib/utils/is-empty';
import isObjectOrFunction from '@lib/utils/is-object-or-function';
import { isMobileSdk } from '@lib/utils/platform';
import { lowerCase, upperCase } from '@lib/utils/string-utils';
import semver from 'semver';

const SupportedNetwork = ['mainnet', 'goerli', 'sepolia'] as const;
const deprecateLegacyTestnetVersion = '10.0.0';
const deprecateTestAPIKeyVersion = '7.0.0';

export function isCustomNode(ethNetwork: string | object | undefined) {
  return !isEmpty((ethNetwork as Partial<{ rpcUrl: string }>)?.rpcUrl);
}

function getMagicExtensionWalletType(ext?: ExtensionOptions): WalletType {
  if (!isEmpty(ext)) {
    const extensionKeys = Object.keys(ext as object).map(key => upperCase(key));
    const ledgerKeys = Object.keys(LedgerSupportDictionary);

    return (
      ([extensionKeys, ledgerKeys].reduce((a, b) => {
        return a.filter((value: string) => {
          return b.includes(value);
        });
      })[0] as WalletType) ?? WalletType.ETH
    );
  }

  return WalletType.ETH;
}

export function getWalletExtensionOptions(ext?: ExtensionOptions) {
  if (!isEmpty(ext)) {
    const walletTypeKey = lowerCase(getMagicExtensionWalletType(ext));
    return ext?.[walletTypeKey]?.options;
  }
  return {};
}

export function getCustomNodeNetworkUrl(ethNetwork: string | object | undefined): string | undefined {
  return (ethNetwork as { rpcUrl: string })?.rpcUrl;
}

export function getChainId(ethNetwork: string | object | undefined, ext?: ExtensionOptions) {
  // ethNetwork is undefined when using non-EVM blockchain extension
  if (ethNetwork === undefined) {
    if (!isEmpty(ext)) {
      const walletTypeKey = lowerCase(getMagicExtensionWalletType(ext));
      return ext?.[walletTypeKey]?.chainId;
    }
    return undefined;
  }
  return (ethNetwork as { chainId: string })?.chainId ?? undefined;
}

export function getLedgerNodeUrl(ethNetwork: string | object | undefined, ext?: ExtensionOptions) {
  if (!isEmpty(ext)) {
    const walletTypeKey = lowerCase(getMagicExtensionWalletType(ext));
    return ext?.[walletTypeKey]?.rpcUrl;
  }
  return getCustomNodeNetworkUrl(ethNetwork);
}

export function getWalletType(ethNetwork: object | string | undefined, ext?: ExtensionOptions): WalletType {
  if (!isEmpty(ext)) {
    return getMagicExtensionWalletType(ext);
  }
  return (ethNetwork as Partial<{ chainType: WalletType }>)?.chainType ?? WalletType.ETH;
}

export function getNetworkName(
  ethNetwork: string | object | undefined,
  version: string | undefined,
  apiKey: string,
  isMobile: boolean,
  ext?: ExtensionOptions,
) {
  if (getWalletType(ethNetwork, ext) === WalletType.FLOW) {
    const flowOptions = ext?.flow;
    return flowOptions.network.toLocaleLowerCase() === 'mainnet' ? 'MAINNET' : 'CANONICAL_TESTNET';
  }

  if (getWalletType(ethNetwork, ext) === WalletType.KADENA) {
    const kadenaOptions = ext?.kadena;
    return kadenaOptions.network?.toLocaleLowerCase() === 'mainnet' ? 'MAINNET' : 'CANONICAL_TESTNET';
  }

  // TODO: This is not the right way to extract the network name out of a nodeUrl.
  // if the node url ends with .net, the network will be extracted as 'net'.
  // if the node url starts with https://tesnet, the network will be extracted as 'https://testnet'.
  // https://magiclink.atlassian.net/browse/PDEEXP-987
  if (getWalletType(ethNetwork, ext) === WalletType.APTOS) {
    const { nodeUrl } = getWalletExtensionOptions(ext);
    const network =
      nodeUrl && typeof nodeUrl === 'string'
        ? nodeUrl
            .split('.')
            .filter(str => str.match(/[a-zA-Z0-9]*net/))
            .pop()
        : 'unknown';
    return network ?? 'custom';
  }

  if (getWalletType(ethNetwork, ext) === WalletType.HEDERA) {
    const hederaOptions = ext?.hedera;
    return hederaOptions?.options?.network === 'mainnet' ? 'mainnet' : 'CANONICAL_TESTNET';
  }

  const semverVersion = semver.valid(semver.coerce(version));
  const ethNetworkStr = typeof ethNetwork === 'string' ? ethNetwork.toLowerCase() : '';

  if (semverVersion !== null && semver.gte(deprecateLegacyTestnetVersion, semverVersion)) {
    if (isEmpty(ethNetwork)) return 'mainnet';
    if (isCustomNode(ethNetwork)) return 'mainnet';
    if (isObjectOrFunction(ethNetwork) && isEmpty((ethNetwork as Partial<{ rpcUrl: string }>)?.rpcUrl))
      return 'mainnet';

    type NetworkType = (typeof SupportedNetwork)[number];
    if (!SupportedNetwork.includes(ethNetworkStr as NetworkType)) throw new Error('Network not supported');

    return ethNetworkStr;
  }

  // New Version Mapping
  const newVersionNetworkMapping = () => {
    if (apiKey?.toLowerCase().startsWith('pk_test') && isEmpty(ethNetwork)) return 'goerli';
    if (isEmpty(ethNetwork)) return 'mainnet';

    if (isCustomNode(ethNetwork)) return 'mainnet';
    if (isObjectOrFunction(ethNetwork) && isEmpty((ethNetwork as Partial<{ rpcUrl: string }>)?.rpcUrl))
      return 'mainnet';

    return ethNetworkStr;
  };

  // MobileSDK overwrites
  if (isMobile) return newVersionNetworkMapping();

  if (semverVersion !== null && semver.gt(deprecateTestAPIKeyVersion, semverVersion)) {
    // Legacy Versions
    if (apiKey?.toLowerCase().startsWith('pk_live')) return 'mainnet';
    if (isEmpty(ethNetwork)) return 'goerli';
    if (isCustomNode(ethNetwork)) return 'CANONICAL_TESTNET';
    if (isObjectOrFunction(ethNetwork) && isEmpty((ethNetwork as Partial<{ rpcUrl: string }>)?.rpcUrl)) return 'goerli';
  } else return newVersionNetworkMapping();

  return ethNetworkStr;
}

export function getETHNetworkUrl() {
  const { apiKey, ethNetwork, version, ext, sdkType, domainOrigin } = useStore.getState().decodedQueryParams;
  const isMobile = isMobileSdk(sdkType, domainOrigin);

  const networkName = getNetworkName(ethNetwork, version, apiKey || '', isMobile, ext);
  let nodeUrl: string | undefined;
  if (isCustomNode(ethNetwork)) {
    nodeUrl = getCustomNodeNetworkUrl(ethNetwork);
  } else {
    nodeUrl = pickRandomly(
      ethereumProviderUrls[DEPLOY_ENV][networkName.toLowerCase() as 'mainnet' | 'sepolia' | 'goerli'],
    ) as string;
  }
  return nodeUrl;
}
