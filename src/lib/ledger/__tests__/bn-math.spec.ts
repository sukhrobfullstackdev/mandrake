import { getBigInt } from 'ethers';
import {
  BnMultiplyByFraction,
  add,
  divide,
  fromWeiToEth,
  getFiatValue,
  isGreaterThan,
  isGreaterThanOrEqualTo,
  multiply,
  subtract,
} from '../evm/utils/bn-math';

describe('BnMultiplyByFraction', () => {
  it('multiplies a BigNumber by a fraction correctly', () => {
    const result = BnMultiplyByFraction(getBigInt('10'), '2', '5');
    expect(result.toString()).toBe('4');
  });

  it('returns 0 when multiplying by a fraction with numerator 0', () => {
    const result = BnMultiplyByFraction(getBigInt('10'), '0', '5');
    expect(result.toString()).toBe('0');
  });
});

describe('getFiatValue', () => {
  it('calculates fiat value correctly', () => {
    const result = getFiatValue(getBigInt('1000000000000000000'), '2');
    expect(result).toBe(2);
  });
});

describe('fromWeiToEth', () => {
  it('converts wei to eth correctly', () => {
    const result = fromWeiToEth('1000000000000000000');
    expect(result).toBe('1.0');
  });
});

describe('add', () => {
  it('adds two BigNumberish values correctly', () => {
    const result = add('5', '10');
    expect(result.toString()).toBe('15');
  });
});

describe('subtract', () => {
  it('subtracts two BigNumberish values correctly', () => {
    const result = subtract('10', '5');
    expect(result.toString()).toBe('5');
  });
});

describe('multiply', () => {
  it('multiplies two BigNumberish values correctly', () => {
    const result = multiply('5', '10');
    expect(result.toString()).toBe('50');
  });
});

describe('divide', () => {
  it('divides two BigNumberish values correctly', () => {
    const result = divide('10', '5');
    expect(result.toString()).toBe('2');
  });
});

describe('isGreaterThan', () => {
  it('returns true when first BigNumberish value is greater than the second', () => {
    const result = isGreaterThan('10', '5');
    expect(result).toBe(true);
  });

  it('returns false when first BigNumberish value is not greater than the second', () => {
    const result = isGreaterThan('5', '10');
    expect(result).toBe(false);
  });
});

describe('isGreaterThanOrEqualTo', () => {
  it('returns true when first BigNumberish value is greater than the second', () => {
    const result = isGreaterThanOrEqualTo('10', '5');
    expect(result).toBe(true);
  });

  it('returns true when first BigNumberish value is equal to the second', () => {
    const result = isGreaterThanOrEqualTo('5', '5');
    expect(result).toBe(true);
  });

  it('returns false when first BigNumberish value is less than the second', () => {
    const result = isGreaterThanOrEqualTo('5', '10');
    expect(result).toBe(false);
  });
});
