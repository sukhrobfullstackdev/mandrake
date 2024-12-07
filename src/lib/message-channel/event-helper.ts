import { DEPLOY_ENV } from '@constants/env';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getCustomNodeNetworkUrl, getNetworkName, getWalletType } from '@lib/utils/network-name';
import { isMobileSdk } from '@lib/utils/platform';

const analyticsChainIdToBlockchain = {
  1: 'ethereum mainnet',
  5: 'goerli',
  11155111: 'sepolia',
  137: 'polygon mainnet',
  80001: 'polygon testnet',
  80002: 'polygon testnet',
  '0x13881': 'polygon testnet',
  100: 'gnosis mainnet',
  '0x64': 'gnosis mainnet',
  1351057110: 'skale testnet',
  503129905: 'skale testnet',
  20180427: 'stability testnet',
  33101: 'zilliqa EVM tesntet',
  42161: 'arbitrum one',
  42170: 'arbitrum nova',
  421614: 'arbitrum sepolia',
  421613: 'arbitrum goerli',
  420: 'optimism goerli',
  10: 'optimism mainnet',
  56: 'binance smart chain mainnet',
  97: 'binance smart chain testnet',
  43114: 'avalanche mainnet',
  43113: 'avalanche testnet',
  8453: 'base mainnet',
  84532: 'base sepolia',
  84531: 'base goerli',
  25: 'cronos mainnet',
  338: 'cronos testnet',
  42220: 'celo mainnet',
  44787: 'celo alfajores',
  250: 'fantom mainnet',
  4002: 'fantom testnet',
  1284: 'moonbeam mainnet',
  1287: 'moonbase alpha testnet',
  592: 'astar mainnet',
  81: 'astar shibuya testnet',
  6038361: 'astar zkEVM testnet (zkyoto)',
  3776: 'astar zkEVM mainnet',
  88888: 'chiliz mainnet',
  88880: 'chiliz scoville testnet',
  1666600000: 'harmony mainnet',
  1666600001: 'harmony mainnet',
  1666600002: 'harmony mainnet',
  1666600003: 'harmony mainnet',
  1666700000: 'harmony testnet',
  1666700001: 'harmony testnet',
  295: 'hedera mainnet',
  296: 'hedera testnet',
  7000: 'zetachain mainnet',
  7001: 'zetachain testnet',
  416: 'sx network mainnet',
  647: 'sx network testnet',
  324: 'zkSync mainnet',
  280: 'zkSync testnet',
  13472: 'immutable zkEVM testnet',
} as Record<string | number, string>;

export type BaseAnalyticsProperties = {
  uid: string | null;
  sdk: string;
  eventOrigin: string;
  api_key: string;
  source: string;
  env: string;
  locale: string | undefined;
  blockchain: string;
  rpcUrl: string;
  chainId: string;
  json_rpc_method: string | undefined;
  walletType: string;
};

export const getBaseAnalyticsProperties = (): BaseAnalyticsProperties => {
  const {
    apiKey = useStore.getState().magicApiKey || '',
    domainOrigin = '',
    sdkType = 'SdkMissing',
    ethNetwork,
    version,
    ext,
    locale,
  } = useStore.getState().decodedQueryParams;
  const authUserId = useStore.getState().authUserId;
  const env = `${DEPLOY_ENV}${apiKey.startsWith('pk_live') ? '' : '-testnet'}`;

  const isMobile = isMobileSdk(sdkType, domainOrigin);

  const getBlockchainNetwork = () => {
    const customNodeNetworkUrl = getCustomNodeNetworkUrl(ethNetwork);
    return customNodeNetworkUrl || getNetworkName(ethNetwork, version, apiKey, isMobile, ext);
  };

  const analyticsChainId = () => {
    // No chainID for non-evm chains
    if (getWalletType(ethNetwork, ext) !== 'ETH') {
      return '';
    }

    // Handle if dev is using Magic node infra
    const rpcUrl: 'mainnet' | 'sepolia' | 'goerli' | string = getBlockchainNetwork();
    if (rpcUrl === 'mainnet') return '1';
    if (rpcUrl === 'goerli') return '5';
    if (rpcUrl === 'sepolia') return '11155111';

    // Handle custom node
    const { chainId } = ethNetwork as {
      rpcUrl: string;
      chainId?: number | undefined;
      chainType?: string | undefined;
    };

    return chainId?.toString() || '';
  };

  const getBlockchainName = () => {
    if (getWalletType(ethNetwork, ext) !== 'ETH') {
      return getWalletType(ethNetwork, ext);
    }

    // No entry in `analyticsChainIdToBlockchain` for chainId
    if (!analyticsChainIdToBlockchain[analyticsChainId()]) return '';

    return analyticsChainIdToBlockchain[analyticsChainId()];
  };

  return {
    uid: authUserId,
    sdk: sdkType,
    eventOrigin: domainOrigin,
    api_key: apiKey, // add for easy searchability in DataDog
    source: 'mandrake-magic',
    locale,
    env,
    blockchain: getBlockchainName(),
    rpcUrl: getBlockchainNetwork(),
    chainId: analyticsChainId(),
    json_rpc_method: AtomicRpcPayloadService.getActiveRpcPayload()?.method,
    walletType: getWalletType(ethNetwork, ext),
  };
};
