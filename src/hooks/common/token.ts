import { ALCHEMY_KEYS } from '@constants/alchemy';
import { WalletType } from '@custom-types/wallet';
import { useChainInfo } from '@hooks/common/chain-info';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useEvmErc20TokensQuery, useFlowUsdcTokensQuery, useTokenPriceQuery } from '@hooks/data/embedded/token';
import { tokenQueryKeys } from '@hooks/data/embedded/token/keys';
import { useStore } from '@hooks/store';
import { getWalletType } from '@lib/utils/network-name';

export const useTokenPrice = (tokenSymbol: string) => {
  const {
    data: tokenPriceData,
    error: tokenPriceError,
    isFetched: isTokenPriceFetched,
    isRefetching: isTokenPriceRefetching,
  } = useTokenPriceQuery(
    tokenQueryKeys.tokenPrice({
      tokenSymbol,
      amount: '1',
    }),
    {
      enabled: Boolean(tokenSymbol),
      refetchInterval: 30000,
    },
  );

  return { tokenPriceData, tokenPriceError, isTokenPriceFetched, isTokenPriceRefetching };
};

export const useNativeTokenPrice = () => {
  const { chainInfo } = useChainInfo();

  const {
    data: tokenPriceData,
    error: tokenPriceError,
    isFetched: isTokenPriceFetched,
    isRefetching: isTokenPriceRefetching,
    isPending: isTokenPricePending,
  } = useTokenPriceQuery(
    tokenQueryKeys.tokenPrice({
      tokenSymbol: chainInfo?.currency || '',
      amount: '1',
    }),
    {
      enabled: Boolean(chainInfo?.currency),
      refetchInterval: 30000,
    },
  );

  return { tokenPriceData, tokenPriceError, isTokenPriceFetched, isTokenPriceRefetching, isTokenPricePending };
};

export const useErc20Balances = () => {
  const { userMetadata } = useUserMetadata();
  const address = userMetadata?.publicAddress;
  const { chainInfo } = useChainInfo();
  const networkName = chainInfo?.networkName;
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const walletType = getWalletType(ethNetwork, ext);
  const isFlowWalletType = walletType === WalletType.FLOW;
  const {
    data: evmErc20tokenBalances,
    error: evmErc20tokenBalancesError,
    isFetched: isEvmErc20TokenBalancesFetched,
    isRefetching: isEvmErc20TokenBalancesRefetching,
  } = useEvmErc20TokensQuery(
    tokenQueryKeys.erc20Tokens({
      networkName: networkName as keyof typeof ALCHEMY_KEYS,
      userAddress: address || '',
    }),
    {
      enabled: Boolean(networkName) && Boolean(address) && walletType === WalletType.ETH,
      refetchInterval: 30000,
    },
  );

  const {
    data: flowUsdcTokenBalances,
    error: flowUsdcTokenBalancesError,
    isFetched: isFlowUsdcTokenBalancesFetched,
    isRefetching: isFlowUsdcTokenBalancesRefetching,
  } = useFlowUsdcTokensQuery(
    tokenQueryKeys.flowUsdcTokens({
      userAddress: address || '',
    }),
    {
      enabled: Boolean(networkName) && Boolean(address) && isFlowWalletType,
    },
  );

  return {
    tokenBalances: isFlowWalletType ? flowUsdcTokenBalances : evmErc20tokenBalances,
    tokenBalancesError: isFlowWalletType ? flowUsdcTokenBalancesError : evmErc20tokenBalancesError,
    isTokenBalancesFetched: isFlowWalletType ? isFlowUsdcTokenBalancesFetched : isEvmErc20TokenBalancesFetched,
    isTokenBalancesRefetching: isFlowWalletType ? isFlowUsdcTokenBalancesRefetching : isEvmErc20TokenBalancesRefetching,
  };
};
