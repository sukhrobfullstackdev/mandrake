import { toNumber } from '../evm/utils/type-conversion';

describe('toNumber', () => {
  it('converts a string to a number correctly', () => {
    expect(toNumber('123456')).toBe(123456);
  });

  it('converts null to the default value correctly', () => {
    expect(toNumber(null)).toBe(0);
  });

  it('converts undefined to the default value correctly', () => {
    expect(toNumber(undefined)).toBe(0);
  });

  it('converts a non-numeric string to the default value correctly', () => {
    expect(toNumber('abc')).toBe(0);
  });

  it('converts a non-numeric string to a provided default value correctly', () => {
    expect(toNumber('abc', 123)).toBe(123);
  });
});
