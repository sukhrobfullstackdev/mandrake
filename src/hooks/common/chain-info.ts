import { IChainInfoEvm, IChainInfoFlow, LEDGER_NETWORKS } from '@constants/chain-info';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { knownRpcUrlToChainId } from '@constants/known-rpc-url-to-chain-id';
import { WalletType } from '@custom-types/wallet';
import { NodeError, useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getETHNetworkUrl, getNetworkName, getWalletType } from '@lib/utils/network-name';
import { isMobileSdk } from '@lib/utils/platform';
import { useEffect, useState } from 'react';

export const useChainInfo = () => {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { apiKey, ethNetwork, version, ext, sdkType, domainOrigin } = useStore(state => state.decodedQueryParams);
  const isMobile = isMobileSdk(sdkType, domainOrigin);

  const { data: clientConfig, error: clientConfigError } = useClientConfigQuery(
    {
      magicApiKey: apiKey || '',
    },
    { enabled: !!apiKey },
  );

  const { getChainId } = useEthereumProxy();

  const chainType = getWalletType(ethNetwork, ext); // 'ETH' if not multichain
  const [chainInfo, setChainInfo] = useState<IChainInfoEvm | IChainInfoFlow | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const networkName = getNetworkName(ethNetwork, version, apiKey || '', isMobile, ext);

  const fetchChainId = async (EVMChainData: Record<number, Partial<{ chainId: number }>>) => {
    const cid = await getChainId().catch(err => {
      rejectActiveRpcRequest((err as NodeError).code, (err as NodeError).message);
    });

    const verifiedChainInfo = EVMChainData[Number(cid || 1)];
    if (!verifiedChainInfo) {
      if (activeRpcPayload && clientConfig?.features?.isSendTransactionUiEnabled) {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UnsupportedBlockchain);
        return null;
      }
    }
    return verifiedChainInfo?.chainId?.toString() ?? null;
  };

  const verifyEVMChainInfo = (EVMChainInfo: Record<number, IChainInfoEvm | IChainInfoFlow>) => {
    const nodeUrl = getETHNetworkUrl();
    if (nodeUrl) {
      const baseUrl = nodeUrl.split('/')[2];
      if ((knownRpcUrlToChainId as Record<string, number>)[baseUrl]) {
        return EVMChainInfo[(knownRpcUrlToChainId as Record<string, number>)[baseUrl]];
      }
    }
    return null;
  };

  const filterChainInfo = async (walletType: WalletType) => {
    const chainData = LEDGER_NETWORKS[walletType as 'FLOW' | 'ETH'] as Record<string, IChainInfoEvm | IChainInfoFlow>;

    if (chainType === WalletType.ETH) {
      const verifiedEVMChainInfo = verifyEVMChainInfo(chainData);
      if (!verifiedEVMChainInfo) {
        const evmChainID = await fetchChainId(chainData);
        setChainId(evmChainID);
        setChainInfo(chainData[evmChainID ?? 1]);
      } else {
        setChainId(verifiedEVMChainInfo.chainId.toString());
        setChainInfo(verifiedEVMChainInfo);
      }
    } else if (!chainData) {
      setChainInfo(null);
    } else {
      setChainInfo(networkName.toLocaleLowerCase() === 'mainnet' ? chainData.mainnet : chainData.testnet);
    }
  };

  useEffect(() => {
    if (clientConfigError) {
      logger.error('ChainInfo - Error fetching client config', clientConfigError);
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToFetchConfig);
    }
  }, [clientConfigError]);

  useEffect(() => {
    if (!chainType || !clientConfig) return;

    filterChainInfo(chainType);
  }, [chainType, clientConfig]);

  return {
    chainId,
    chainInfo,
    walletType: chainType,
  };
};
