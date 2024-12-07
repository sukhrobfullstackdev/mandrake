import { ALCHEMY_KEYS, ALCHEMY_NETWORKS } from '@constants/alchemy';
import { Endpoint } from '@constants/endpoint';
import { FlowLedgerBridge } from '@custom-types/ledger-bridge';
import { GetTokensForOwnerResponse, TokenPrice } from '@hooks/data/embedded/token';
import { EvmErc20TokensQueryKey, FlowUsdcTokensQueryKey, TokenPriceQueryKey } from '@hooks/data/embedded/token/keys';
import { useStore } from '@hooks/store';
import { HttpService } from '@lib/http-services';
import { createBridge } from '@lib/multichain/ledger-bridge';
import { getNetworkName } from '@lib/utils/network-name';
import { isMobileSdk } from '@lib/utils/platform';
import { QueryFunction } from '@tanstack/react-query';
import { Alchemy } from 'alchemy-sdk';

export const tokenPriceFetch =
  (): QueryFunction<TokenPrice, TokenPriceQueryKey> =>
  ({ queryKey: [, params] }) => {
    const endpoint = `${Endpoint.Token.TokenPrice}?from=${params.tokenSymbol}&to=USD&currency_amount=${params.amount}`;

    return HttpService.Magic.Get(endpoint);
  };

export const evmErc20TokensFetch =
  (): QueryFunction<GetTokensForOwnerResponse, EvmErc20TokensQueryKey> =>
  ({ queryKey: [, params] }) => {
    const alchemyInstance = new Alchemy({
      apiKey: ALCHEMY_KEYS[params.networkName],
      network: ALCHEMY_NETWORKS[params.networkName],
    });

    return alchemyInstance.core.getTokensForOwner(params.userAddress) as Promise<GetTokensForOwnerResponse>;
  };

export const flowUsdcTokensFetch =
  (): QueryFunction<GetTokensForOwnerResponse, FlowUsdcTokensQueryKey> =>
  async ({ queryKey: [, params] }) => {
    const { ethNetwork, ext, version, apiKey, sdkType, domainOrigin } = useStore.getState().decodedQueryParams;
    const networkName = getNetworkName(ethNetwork, version, apiKey || '', isMobileSdk(sdkType, domainOrigin), ext);
    const getUsdcBalancePayload = {
      params: {
        address: params.userAddress,
        network: networkName.toLowerCase() === 'mainnet' ? 'mainnet' : 'testnet',
      },
    };
    const flowGetAccount = () => params.userAddress;
    const flowBridge = (await createBridge(flowGetAccount, ethNetwork, ext)).ledgerBridge as FlowLedgerBridge;
    return flowBridge
      .getUsdcBalance(getUsdcBalancePayload)
      .then(res => ({
        tokens: [
          {
            balance: res,
            contractAddress: '',
            decimals: 0,
            logo: 'https://static.alchemyapi.io/images/assets/3408.png',
            name: 'USDC',
            rawBalance: res,
            symbol: 'USDC',
            isFlowUsdc: true,
          },
        ],
      }))
      .catch(err => logger.log(err)) as Promise<GetTokensForOwnerResponse>;
  };
