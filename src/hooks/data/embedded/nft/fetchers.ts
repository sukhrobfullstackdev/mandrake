import { Endpoint } from '@constants/endpoint';
import { NftTokenInfo, PaypalClientToken, PaypalOrderDetails } from '@custom-types/nft';
import {
  GetBalanceOfNftQueryKey,
  GetCurrentStageQueryKey,
  GetFallbackNetworkFeeQueryKey,
  GetNetworkFeeQueryKey,
  GetNftTokenInfoQueryKey,
  GetPaypalClientTokenQueryKey,
  GetPaypalOrderDetailsQueryKey,
  IsAllowListParamsQueryKey,
} from '@hooks/data/embedded/nft/keys';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { HttpService } from '@lib/http-services';
import { multiply } from '@lib/ledger/evm/utils/bn-math';
import { getMintingAbi } from '@lib/utils/nft-checkout';
import { getViemClient } from '@lib/viem/get-viem-client';
import { QueryFunction } from '@tanstack/react-query';
import { getBigInt } from 'ethers';
import { formatEther, getAddress, parseAbi, parseEther } from 'viem';

export type GetNftTokenInfoParams = {
  contractId: string;
  tokenId: string;
};

export type CreateOrderParams = {
  contractId: string;
  toAddress: string;
  tokenId: string;
  quantity: number;
};

export type AuthorizeOrderParams = {
  orderId: string;
};

export type GetPaypalClientTokenParams = {
  contractId: string;
  magicClientId: string;
};

export type GetPaypalOrderDetailsParams = {
  orderId: string;
};

export type GetNetworkFeeParams = {
  chainId: number;
  quantity: number;
  address: string;
  contractAddress: string;
  functionName: string;
  tokenId: string;
  tokenType: string;
  value: number;
};

export type GetBalanceOfNftParams = {
  chainId: number;
  contractAddress: string;
  owner: string;
};

export type IsAllowListParams = {
  chainId: number;
  contractAddress: string;
  address: string;
};

export type GetCurrentStageParams = {
  chainId: number;
  contractAddress: string;
};

export const makeNftTokenInfoFetcher =
  (): QueryFunction<NftTokenInfo, GetNftTokenInfoQueryKey> =>
  async ({ queryKey: [, { contractId, tokenId }] }) => {
    try {
      const response = await HttpService.Nft.Get(
        `${Endpoint.Nft.NftTokenInfo}?contract_id=${contractId}&token_id=${tokenId}`,
      );
      return response.token as NftTokenInfo;
    } catch (error) {
      logger.error('Error fetching NFT info', error);
      throw error;
    }
  };

export const makePaypalClientTokenFetcher =
  (): QueryFunction<PaypalClientToken, GetPaypalClientTokenQueryKey> =>
  async ({ queryKey: [, { contractId, magicClientId }] }) => {
    try {
      const response = await HttpService.Nft.Get(
        `${Endpoint.Nft.PaypalClientToken}?contract_id=${contractId}&magic_client_id=${magicClientId}`,
      );
      return response as PaypalClientToken;
    } catch (error) {
      logger.error('Error fetching Paypal client token', error);
      throw error;
    }
  };

export const makePaypalOrderDetailsFetcher =
  (): QueryFunction<PaypalOrderDetails, GetPaypalOrderDetailsQueryKey> =>
  async ({ queryKey: [, { orderId }] }) => {
    try {
      const response = await HttpService.Nft.Get(
        `${Endpoint.Nft.PaypalOrderDetails}?payment_provider_order_id=${orderId}`,
      );
      return response as PaypalOrderDetails;
    } catch (error) {
      logger.error('Error fetching Paypal order details', error);
      throw error;
    }
  };

export const createOrder = async (params: CreateOrderParams) => {
  try {
    const response = await HttpService.Nft.Post(
      Endpoint.Nft.CreateOrder,
      {},
      {
        contract_id: params.contractId,
        to_address: params.toAddress,
        token_id: params.tokenId,
        quantity: params.quantity,
      },
    );

    return { orderId: response.paymentProviderOrderId as string };
  } catch (error) {
    logger.error('Error creating order', error);
    throw error;
  }
};

export const authorizeOrder = async (params: AuthorizeOrderParams) => {
  try {
    const response = await HttpService.Nft.Post(
      Endpoint.Nft.AuthorizeOrder,
      {},
      {
        payment_provider_order_id: params.orderId,
      },
    );

    return {
      requestId: response.requestId as string,
    };
  } catch (error) {
    logger.error('Error authorizing order', error);
    throw error;
  }
};

export const maketNetworkFeeFetcher =
  (): QueryFunction<string, GetNetworkFeeQueryKey> =>
  async ({
    queryKey: [, { chainId, quantity, address, contractAddress, functionName, tokenId, tokenType, value }],
  }) => {
    const client = getViemClient(chainId);

    const abi = getMintingAbi(tokenType, functionName);

    try {
      const [gas, fees] = await Promise.all([
        client.estimateContractGas({
          account: getAddress(address),
          address: getAddress(contractAddress),
          abi,
          functionName,
          args: [getBigInt(quantity), getBigInt(tokenId)],
          value: parseEther(value.toString()),
        }),
        client.estimateFeesPerGas(),
      ]);

      return formatEther(gas * (fees.maxFeePerGas ?? getBigInt(0)));
    } catch (error) {
      logger.error('Error fetching network fee', error);
      return '0.00227034748618069';
    }
  };

export const makeBalanceOfNftFetcher =
  (): QueryFunction<bigint, GetBalanceOfNftQueryKey> =>
  async ({ queryKey: [, { chainId, contractAddress, owner }] }) => {
    try {
      const response = await getViemClient(chainId).readContract({
        address: getAddress(contractAddress),
        abi: parseAbi(['function balanceOf(address owner) public view returns (uint256)']),
        functionName: 'balanceOf',
        args: [getAddress(owner)],
      });
      return response;
    } catch (error) {
      logger.error('Error fetching balance of NFT', error);
      throw error;
    }
  };

export const makeIsAllowListFetcher =
  (): QueryFunction<boolean, IsAllowListParamsQueryKey> =>
  async ({ queryKey: [, { chainId, contractAddress, address }] }) => {
    try {
      const response = await getViemClient(chainId).readContract({
        address: getAddress(contractAddress),
        abi: parseAbi(['function isAllowList(address owner) public view returns (bool)']),
        functionName: 'isAllowList',
        args: [getAddress(address)],
      });
      return response;
    } catch (error) {
      logger.error('Error fetching isAllowList', error);
      throw error;
    }
  };

export const makeGetCurrentStageFetcher =
  (): QueryFunction<number, GetCurrentStageQueryKey> =>
  async ({ queryKey: [, { chainId, contractAddress }] }) => {
    try {
      const response = await getViemClient(chainId).readContract({
        address: getAddress(contractAddress),
        abi: parseAbi(['function currentStage() public view returns (uint8)']),
        functionName: 'currentStage',
        args: [],
      });
      return response;
    } catch (error) {
      logger.error('Error fetching current stage', error);
      throw error;
    }
  };

export const makeGetFallbackNetworkFee = (): QueryFunction<bigint, GetFallbackNetworkFeeQueryKey> => async () => {
  const rpcProvider = getRpcProvider();
  const [block, gasPrice] = await Promise.all([rpcProvider.getBlock('latest'), rpcProvider.send('eth_gasPrice', [])]);

  const gas = getBigInt(100000);
  const networkFee = multiply(gas, block?.baseFeePerGas ?? gasPrice);
  return networkFee;
};
