/* istanbul ignore file */
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { JsonRpcProvider, TransactionRequest, getBigInt, toBeHex } from 'ethers';

export function buildMessageContext(error: unknown, context = {}) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    ...context,
  };
}

export async function standardizeEVMPayload(
  activeRpcPayload: JsonRpcRequestPayload,
  rpcProvider: JsonRpcProvider,
  chainIdNumber: number,
  publicAddress: string,
) {
  const payloadParams = activeRpcPayload?.params?.[0];
  const { maxPriorityFeePerGas, maxFeePerGas, gas, gasPrice, gasLimit, data, to, value, from, nonce } = payloadParams;

  const transaction = {
    to,
    value: value?.toString(),
    data,
    from: from || publicAddress,
  } as TransactionRequest;

  /**
   * we always want to call getFeeData() because it will return the block.baseFeePerGas as lastBaseFeePerGas
   * which is needed to determine if the blockchain supports EIP-1559 transactions
   */
  let providerFeeData;
  const lastBlock = await rpcProvider.getBlock('latest');
  const supportsEIP1559 = lastBlock?.baseFeePerGas;
  try {
    providerFeeData = await rpcProvider.getFeeData();
  } catch (error) {
    logger.error('Error getting fee data from RPC Provider', error);
    throw new Error('Error getting fee data from RPC Provider');
  }

  if (gas || gasLimit) {
    transaction.gasLimit = gas ?? gasLimit;
  } else {
    const providerEstimateGas = await rpcProvider.estimateGas(transaction);
    transaction.gasLimit = providerEstimateGas;
  }

  if (nonce) {
    transaction.nonce = nonce;
  } else {
    const providerNonce = await rpcProvider.getTransactionCount(from);
    transaction.nonce = providerNonce; // TODO: confirm this doesn't need to be hexlified
  }

  transaction.chainId = chainIdNumber;

  if (gasPrice) {
    // handle legacy
    transaction.gasPrice = gasPrice;
    transaction.type = 0;
  } else if (maxPriorityFeePerGas || maxFeePerGas) {
    // handle EIP-1559
    transaction.maxFeePerGas =
      maxFeePerGas ?? toBeHex(Math.max(Number(maxPriorityFeePerGas || 0), Number(providerFeeData.maxFeePerGas || 0)));
    transaction.maxPriorityFeePerGas = maxPriorityFeePerGas ?? providerFeeData.maxPriorityFeePerGas;
    transaction.type = 2;
  } else {
    if (!providerFeeData) {
      throw new Error('Unable to get fee data from provider');
    }
    if (supportsEIP1559) {
      transaction.maxFeePerGas = toBeHex(providerFeeData.maxFeePerGas as bigint);
      transaction.maxPriorityFeePerGas = toBeHex(providerFeeData.maxPriorityFeePerGas as bigint);
      transaction.type = 2;
    } else if (providerFeeData.gasPrice) {
      transaction.gasPrice = toBeHex(providerFeeData.gasPrice);
      transaction.type = 0;
    }
  }

  try {
    // bigint's are not stringifyable via JSON.stringify
    // need to manually convert them to strings
    logger.info(
      `Standardized Payload: ${JSON.stringify(transaction, (key, val) => {
        if (typeof val === 'bigint') {
          return val.toString();
        }
        return val;
      })}`,
    );
  } catch (error) {
    logger.error('Error stringifying transaction', error);
  }

  return transaction;
}

// Note.
// - Stability chain is working without gas fee
// - Support EIP-1559 only
const standardizeStabilityPayload = async (
  activeRpcPayload: JsonRpcRequestPayload,
  rpcProvider: JsonRpcProvider,
  chainIdNumber: number,
  publicAddress: string,
  maxDefaultGasLimit: number,
) => {
  const payloadParams = activeRpcPayload?.params?.[0];
  const { gas, gasPrice, gasLimit, data, to, value, type, from, nonce } = payloadParams;

  const transaction = {
    to,
    value,
    data,
    from: from || publicAddress,
  } as TransactionRequest;

  const [gasLimitEstimate, transactionCount] = await Promise.all([
    rpcProvider.estimateGas(transaction),
    rpcProvider.getTransactionCount(from),
  ]);

  transaction.chainId = chainIdNumber;
  transaction.nonce = nonce ?? transactionCount ?? undefined;

  const defaultGasLimit = toBeHex(getBigInt(maxDefaultGasLimit)); // The gasLimit should be 21016 or higher

  transaction.value = toBeHex(getBigInt(value ?? '0'));
  transaction.data = data ?? '0x12';
  transaction.gasLimit = gas ?? gasLimit ?? gasLimitEstimate ?? defaultGasLimit;
  transaction.maxFeePerGas = '0x0';
  transaction.maxPriorityFeePerGas = '0x0';

  transaction.type = type || 2;

  // TODO: if this only supports EIP-1559, should we just always delete this?
  if (typeof gasPrice !== 'undefined') {
    delete transaction.gasPrice;
  }

  return transaction;
};

export const standardizePayload: {
  [key: string]: (
    activeRpcPayload: JsonRpcRequestPayload,
    rpcProvider: JsonRpcProvider,
    chainIdNumber: number,
    publicAddress: string,
    maxDefaultGasLimit: number,
    minDefaultGasLimit: number,
  ) => Promise<TransactionRequest>;
} = {
  EVM: standardizeEVMPayload,
  Stability: standardizeStabilityPayload,
};
