import { getRpcProvider } from '@lib/common/rpc-provider';
import { calculateNetworkGasFee } from '@lib/ledger/evm/gas/network-gas-fee';
import {
  add,
  fromWeiToEth,
  getFiatValue,
  isGreaterThan,
  isGreaterThanOrEqualTo,
  subtract,
} from '@lib/ledger/evm/utils/bn-math';
import { TransactionService } from '@lib/ledger/ledger-balance-abstract';
import { TransactionAmounts } from '@lib/utils/transaction-utils';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { formatUnits, getBigInt, isAddress, parseUnits } from 'ethers';

export class EVMTransactionService extends TransactionService {
  publicAddress: string;

  constructor(publicAddress: string) {
    super();
    this.publicAddress = publicAddress;
  }

  static calculateRate(balance: string, rate: string): number {
    if (!balance || !rate) return 0;
    const balanceBigInt = getBigInt(balance || '0');
    return getFiatValue(balanceBigInt, rate);
  }

  async calculateTransactionAmounts(
    value: string,
    ethPrice: string,
    payload: JsonRpcRequestPayload,
    isConstructTxFlow = false,
  ): Promise<TransactionAmounts> {
    const transactionValueInWei = getBigInt(value || '0x0');
    const transactionValueInFiat = getFiatValue(transactionValueInWei, ethPrice || '0');
    const networkFeeInWei = await calculateNetworkGasFee(payload, this.publicAddress, isConstructTxFlow);
    const networkFeeInFiat = getFiatValue(networkFeeInWei, ethPrice || '0');
    const totalInWei = add(networkFeeInWei, transactionValueInWei);
    const totalInFiat = getFiatValue(totalInWei, ethPrice || '0');

    return {
      transactionValue: transactionValueInWei,
      transactionValueInFiat,
      networkFee: networkFeeInWei,
      networkFeeInFiat,
      total: totalInWei,
      totalInFiat,
    };
  }

  static isGreaterThan(numOne: string, numTwo: string): boolean {
    return isGreaterThan(numOne, numTwo);
  }

  static maxSendInFiat(balance: string, price: string, networkFee: string): number {
    const balanceBigInt = getBigInt(balance || '0');
    if (networkFee === '0' || getBigInt(networkFee) > balanceBigInt) return 0;
    return getFiatValue(subtract(balanceBigInt, networkFee), price);
  }

  static fiatNeededToCoverTransaction(total: string, balance: string, price: string): number {
    return Number(getFiatValue(subtract(total, balance), price)) || 0;
  }

  static balanceNeededToCoverTransaction(total: string, balance: string): number {
    return Number(formatUnits(subtract(total, balance))) || 0;
  }

  verifyAddress(): void {
    if (!isAddress(this.publicAddress)) {
      throw new Error('Invalid address');
    }
  }

  static displayAmount(amount: string): number {
    return Number(fromWeiToEth(amount || '0'));
  }

  getBalance(): Promise<bigint> {
    const rpcProvider = getRpcProvider();
    return rpcProvider.getBalance(this.publicAddress);
  }

  static isGreaterThanOrEqualTo(numOne: string, numTwo: string): boolean {
    const bigIntOne = getBigInt(numOne || '0');
    const bigIntTwo = getBigInt(numTwo || '0');
    return isGreaterThanOrEqualTo(bigIntOne, bigIntTwo);
  }

  static getSendAmount(amount: string): string {
    return `0x${parseUnits(amount.replaceAll(',', ''), 'ether').toString(16)}`;
  }

  static getExplorerTransactionUrl(url: string | undefined, hash: string | undefined): string {
    return `${url}/tx/${hash}`;
  }
}
