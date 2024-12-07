/* istanbul ignore file */
import { EVM_NETWORKS_BY_CHAIN_ID } from '@constants/chain-info';
import { getRpcProvider } from '@lib/common/rpc-provider';
import { standardizePayload } from '@lib/ledger/evm/standardize-evm-payload';
import { add, divide, multiply, subtract } from '@lib/ledger/evm/utils/bn-math';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { Network, TransactionRequest } from 'ethers';

export async function calculateNetworkGasFee(
  payload: JsonRpcRequestPayload,
  publicAddress: string,
  isConstructTxFlow = false,
) {
  const rpcProvider = getRpcProvider();
  const network: Network = await rpcProvider.getNetwork();
  const chainIdNumber = Number(network.chainId);

  if (!network || !network.chainId) {
    throw new Error('Unable to get network info');
  }

  const networkInfo = EVM_NETWORKS_BY_CHAIN_ID[chainIdNumber];

  let standardizedTransactionPayload: TransactionRequest;

  if (networkInfo?.transactionFormat) {
    standardizedTransactionPayload = (await standardizePayload[networkInfo?.transactionFormat](
      payload as JsonRpcRequestPayload,
      rpcProvider,
      chainIdNumber,
      publicAddress,
      networkInfo.maxDefaultGasLimit,
      networkInfo.minDefaultGasLimit,
    )) as TransactionRequest;
  } else {
    standardizedTransactionPayload = (await standardizePayload.EVM(
      payload as JsonRpcRequestPayload,
      rpcProvider,
      chainIdNumber,
      publicAddress,
      networkInfo.maxDefaultGasLimit,
      networkInfo.minDefaultGasLimit,
    )) as TransactionRequest;
  }

  const { maxPriorityFeePerGas, maxFeePerGas, gasPrice, gasLimit } = standardizedTransactionPayload;

  if (!gasLimit) {
    throw new Error('Gas limit is required to calculate network fee');
  }

  let transactionFee;
  if (typeof maxPriorityFeePerGas !== 'undefined' && typeof maxFeePerGas !== 'undefined') {
    if (isConstructTxFlow) {
      // For construct tx flow, estimate network fee using maxFeePerGas
      transactionFee = multiply(maxFeePerGas as bigint, gasLimit);
    } else {
      // For non-construct tx flow, estimate network fee as usual
      const baseFee = divide(subtract(maxFeePerGas as bigint, maxPriorityFeePerGas as bigint), 2) as bigint;
      const gasPriceInTransaction = add(maxPriorityFeePerGas as bigint, baseFee) as bigint;
      transactionFee = multiply(gasPriceInTransaction, gasLimit) as bigint;
    }
  } else {
    transactionFee = multiply(gasLimit, gasPrice || 1) as bigint;
  }

  return transactionFee as bigint;
}
