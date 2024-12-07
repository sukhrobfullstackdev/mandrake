import { Endpoint } from '@constants/endpoint';
import { CustomNodeQueryKey, EthereumProxyQueryKey } from '@hooks/data/embedded/ethereum-proxy/keys';
import { HttpService } from '@http-services';
import { JsonRpcResponsePayload } from '@magic-sdk/types';
import { QueryFunction } from '@tanstack/react-query';

export const makeEthereumProxyFetcher =
  (): QueryFunction<JsonRpcResponsePayload, EthereumProxyQueryKey> =>
  ({ queryKey: [, payload] }) =>
    HttpService.Magic.Post(`${Endpoint.Ethereum.Proxy}`, {}, payload);

export const makeCustomNodeEthereumProxyFetcher =
  (): QueryFunction<JsonRpcResponsePayload, CustomNodeQueryKey> =>
  ({ queryKey: [, { payload, nodeUrl }] }) =>
    HttpService.JSON.Post(nodeUrl, {}, payload);
