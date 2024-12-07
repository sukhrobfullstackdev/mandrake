import {
  ETH_CALL,
  ETH_CHAINID,
  ETH_ESTIMATEGAS,
  ETH_GASPRICE,
  ETH_GETBALANCE,
  ETH_GETBLOCKBYNUMBER,
  ETH_GETCODE,
  ETH_GETTRANSACTIONCOUNT,
  ETH_GETTRANSACTIONRECEIPT,
  ETH_SENDRAWTRANSACTION,
} from '@constants/eth-rpc-methods';
import { JsonRpcError, JsonRpcRequestPayload, JsonRpcResponsePayload } from '@custom-types/json-rpc';
import { useCustomNodeEthProxyQuery, useMagicApiEthProxyQuery } from '@hooks/data/embedded/ethereum-proxy';
import { useStore } from '@hooks/store';
import { DEFAULT_ERROR_CODE, DEFAULT_ERROR_MESSAGE } from '@lib/message-channel/sdk-reject';
import { getETHNetworkUrl, isCustomNode } from '@lib/utils/network-name';
import { TransactionRequest } from 'ethers';

/**
 * Tries to resolve an error code from arbitrary `data`.
 * - If `data` is defined, an error code is searched for at the usual
 *   paths.
 *
 * Defaults to JSON RPC 2.0 standard error code `-32603` if the above cases
 * resolve `null` or `undefined`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveErrorCode(data?: any): string {
  if (data?.code) return data?.code;
  if (data?.error_code) return data?.error_code;
  return (data as Partial<JsonRpcResponsePayload>)?.error?.code?.toString() || DEFAULT_ERROR_CODE.toString();
}

export function resolveErrorMessage(
  data?:
    | string
    | Partial<{
        error_message?: string;
        error_description?: string;
        message?: string;
        error?: JsonRpcError | null | undefined;
      }>,
) {
  if (typeof data === 'string') return data;
  const result = data?.error_message ?? data?.error_description ?? data?.error?.message ?? data?.message;
  return typeof result === 'string' ? result : DEFAULT_ERROR_MESSAGE;
}

export class NodeError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

function getNodeError(res: JsonRpcResponsePayload) {
  const data = res?.error?.data;
  return { code: resolveErrorCode(res), message: `Error forwarded from node, ${resolveErrorMessage(res)}, ${data}` };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createJsonRpcRequestPayload(method: string, params: any[] = []): JsonRpcRequestPayload {
  return {
    jsonrpc: '2.0',
    id: '1',
    method,
    params,
  };
}

export const useEthereumProxy = () => {
  const { ethNetwork } = useStore(state => state.decodedQueryParams);
  const { mutateAsync: mutateMagicApiEthProxy } = useMagicApiEthProxyQuery();
  const { mutateAsync: mutateCustomNodeEthProxy } = useCustomNodeEthProxyQuery();

  const genericEthereumProxy = async (payload: JsonRpcRequestPayload): Promise<unknown | null | undefined> => {
    const nodeUrl = getETHNetworkUrl();
    if (isCustomNode(ethNetwork)) {
      if (nodeUrl) {
        const res = await mutateCustomNodeEthProxy({ nodeUrl, payload });
        if (res?.error) {
          const nodeError = getNodeError(res);
          throw new NodeError(nodeError.code, nodeError.message);
        }

        return res.result;
      }
    }

    const res = await mutateMagicApiEthProxy({ payload });
    if (res?.error) {
      const nodeError = getNodeError(res);
      throw new NodeError(nodeError.code, nodeError.message);
    }

    return res.result;
  };

  const getChainId = () => {
    const chainIdPayload = createJsonRpcRequestPayload(ETH_CHAINID);
    return genericEthereumProxy(chainIdPayload) as Promise<number>;
  };

  const getGasPrice = () => {
    const gasPricePayload = createJsonRpcRequestPayload(ETH_GASPRICE);
    return genericEthereumProxy(gasPricePayload) as Promise<string>;
  };

  const estimateGas = (transactionRequest: TransactionRequest) => {
    const estimateGasPayload = createJsonRpcRequestPayload(ETH_ESTIMATEGAS, [transactionRequest]);
    return genericEthereumProxy(estimateGasPayload) as Promise<number>;
  };

  const getCode = (address?: string) => {
    const getCodePayload = createJsonRpcRequestPayload(ETH_GETCODE, [address, 'latest']);
    return genericEthereumProxy(getCodePayload) as Promise<unknown>;
  };

  const getBlock = (blockHashOrBlockNumber = 'latest', isReturnAllTransaction = false) => {
    const getBlockPayload = createJsonRpcRequestPayload(ETH_GETBLOCKBYNUMBER, [
      blockHashOrBlockNumber,
      isReturnAllTransaction,
    ]);
    return genericEthereumProxy(getBlockPayload) as Promise<string>;
  };

  const ethCall = (to: string, data: string) => {
    const ethCallPayload = createJsonRpcRequestPayload(ETH_CALL, [
      {
        from: null,
        to,
        data,
      },
      'latest',
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return genericEthereumProxy(ethCallPayload) as Promise<any>;
  };

  const getBalance = (address?: string) => {
    const getBalancePayload = createJsonRpcRequestPayload(ETH_GETBALANCE, [address, 'latest']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return genericEthereumProxy(getBalancePayload) as Promise<any>;
  };

  const getTransactionCount = (publicAddress: string, block = 'latest') => {
    const getTransactionCountPayload = createJsonRpcRequestPayload(ETH_GETTRANSACTIONCOUNT, [publicAddress, block]);
    return genericEthereumProxy(getTransactionCountPayload) as Promise<number>;
  };

  const sendRawTransaction = (rawTxn?: string) => {
    const sendRawTransactionPayload = createJsonRpcRequestPayload(ETH_SENDRAWTRANSACTION, [rawTxn]);
    return genericEthereumProxy(sendRawTransactionPayload) as Promise<string>;
  };

  const getTransactionReceipt = (hash: string) => {
    const getTransactionReceiptPayload = createJsonRpcRequestPayload(ETH_GETTRANSACTIONRECEIPT, [hash]);
    return genericEthereumProxy(getTransactionReceiptPayload) as Promise<string>;
  };

  return {
    getChainId,
    getGasPrice,
    estimateGas,
    genericEthereumProxy,
    getETHNetworkUrl,
    getCode,
    getBlock,
    ethCall,
    getBalance,
    getTransactionCount,
    sendRawTransaction,
    getTransactionReceipt,
  };
};
