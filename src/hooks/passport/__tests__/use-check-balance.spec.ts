import { checkBalance } from '@hooks/passport/use-check-balance';
import { parseEther } from 'viem';

describe('checkBalance', () => {
  test('has enough for both amount and fee', () => {
    const result = checkBalance(parseEther('1.0'), parseEther('0.1'), parseEther('1.5'));
    expect(result).toEqual({
      enoughForSendAmount: true,
      enoughForFee: true,
      amountNeededForTransaction: BigInt(0),
    });
  });

  test('has enough for fee only', () => {
    const result = checkBalance(parseEther('1.0'), parseEther('0.1'), parseEther('0.2'));
    expect(result).toEqual({
      enoughForSendAmount: false,
      enoughForFee: true,
      amountNeededForTransaction: BigInt(parseEther('0.9')),
    });
  });

  test('has enough for amount only', () => {
    const result = checkBalance(parseEther('0.8'), parseEther('0.3'), parseEther('0.9'));
    expect(result).toEqual({
      enoughForSendAmount: true,
      enoughForFee: false,
      amountNeededForTransaction: BigInt(parseEther('0.2')),
    });
  });

  test('insufficient balance for both', () => {
    const result = checkBalance(parseEther('1.0'), parseEther('0.1'), parseEther('0.05'));
    expect(result).toEqual({
      enoughForSendAmount: false,
      enoughForFee: false,
      amountNeededForTransaction: BigInt(parseEther('1.05')),
    });
  });
});
