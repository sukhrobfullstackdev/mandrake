import { getRpcProvider } from '@lib/common/rpc-provider';
import { Transaction, formatUnits, getBytes, toUtf8String } from 'ethers';

export interface TransactionAmounts {
  transactionValue: bigint;
  transactionValueInFiat: number;
  networkFee: bigint;
  networkFeeInFiat: number;
  total: bigint;
  totalInFiat: number;
}

export type TransactionType = 'eth-transfer' | 'erc20-transfer';

export type Erc20TokenTransferDetailsType = {
  to: string;
  amount: string;
  symbol: string;
};

const isErc20TokenTransfer = (data: string): boolean => {
  return data.substring(0, 10) === '0xa9059cbb';
};

export const getTransactionType = (txObject: Transaction): TransactionType => {
  if (!txObject.data) return 'eth-transfer';
  const isTokenTransfer = isErc20TokenTransfer(txObject.data);
  return isTokenTransfer ? 'erc20-transfer' : 'eth-transfer';
};

export const getTokenSymbol = async (erc20TokenContractAddress: string): Promise<{ [key: string]: string }> => {
  // generated from `web3.utils.sha3('symbol()').substring(0, 10)`
  const methodHash = '0x95d89b41';
  const rpcProvider = getRpcProvider();
  const hexSymbol = await rpcProvider.call({ to: erc20TokenContractAddress, data: methodHash });
  return {
    [erc20TokenContractAddress]: toUtf8String(getBytes(hexSymbol as string))
      .split('')
      .filter(char => char >= ' ' && char <= '~')
      .join('')
      .trim(),
  };
};

export const getTokenDecimals = async (erc20TokenContractAddress: string): Promise<{ [x: string]: number }> => {
  const methodHash = '0x313ce567';
  const rpcProvider = getRpcProvider();
  try {
    const decimals = await rpcProvider.call({ to: erc20TokenContractAddress, data: methodHash });
    return { [erc20TokenContractAddress]: Number(decimals) };
  } catch (e) {
    logger.error('Error fetching decimals', e);
    return { [erc20TokenContractAddress]: 18 };
  }
};

// Only called when ERC20 token transfer is detected
export const getTokenTransferDetails = async (txObject: Transaction): Promise<Erc20TokenTransferDetailsType> => {
  const symbol = await getTokenSymbol(txObject.to as string);
  const to = `0x${txObject.data.substring(34, 74)}`;
  const amount = `0x${txObject.data.slice(-64)}`;
  const contractToDecimals = await getTokenDecimals(txObject.to as string);
  return {
    to,
    amount: Number(formatUnits(amount, Number(contractToDecimals[txObject.to as string])) || 18).toString(),
    symbol: symbol[txObject.to as string],
  };
};

export const isTransactionValueZero = (value: string) => {
  return !value || value === '0' || value === '0x' || value === '0x0' || value === '0.0';
};
