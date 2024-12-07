/* istanbul ignore file */
import { JsonRpcRequestPayload } from '@magic-sdk/types';

/**
 * This is the blueprint for all blockchain calculations.
 */
export abstract class TransactionService {
  static calculateRate(balance: string, rate: string): number {
    return Number(balance) * Number(rate);
  }

  abstract calculateTransactionAmounts(
    value: string,
    ethPrice: string,
    payload: JsonRpcRequestPayload,
    isConstructTxFlow: boolean,
  ): Promise<{
    totalInFiat: number;
    transactionValueInFiat: number;
    total: bigint;
    networkFee: bigint;
    networkFeeInFiat: number;
    transactionValue: bigint;
  }>;

  static isGreaterThan(numOne: string, numTwo: string) {
    return Number(numOne) > Number(numTwo);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static maxSendInFiat(balance: string, price: string, networkFee: string): number {
    return Number(balance) * Number(price);
  }

  static fiatNeededToCoverTransaction(total: string, balance: string, price: string): number {
    const totalNum = Number(total);
    const balanceNum = Number(balance);
    const priceNum = Number(price);
    return (totalNum - balanceNum) * priceNum;
  }

  static balanceNeededToCoverTransaction(total: string, balance: string): number {
    return Number(total) - Number(balance);
  }

  abstract verifyAddress(): void;

  static displayAmount(amount: string): number {
    return Number(amount);
  }

  abstract getBalance(): Promise<bigint | string | null | undefined>;

  static getUsdcBalance() {
    // only care about this method for Flow
    return Promise.resolve('0');
  }

  static isGreaterThanOrEqualTo(numOne: string, numTwo: string): boolean {
    return Number(numOne) >= Number(numTwo);
  }

  static getSendAmount(amount: string): string {
    const num = Number(amount);
    if (Number.isInteger(num)) {
      return num.toFixed(1);
    }
    return amount;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getExplorerTransactionUrl(url: string | undefined, hash: string | undefined): string {
    throw new Error('Static method not implemented.');
  }
}
