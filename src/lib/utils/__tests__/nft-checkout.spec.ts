import { toEtherFixed, toUsd } from '@lib/utils/nft-checkout';

describe('@utils/nft-checkout', () => {
  it('toUsd ', () => {
    expect(toUsd(100)).toBe('$100.00');
    expect(toUsd(123.4567)).toBe('$123.46');
    expect(toUsd(1234567.8)).toBe('$1,234,567.80');
  });

  it('toEtherFixed', () => {
    expect(toEtherFixed(0.001)).toBe(0.001);
    expect(toEtherFixed(0.000001)).toBe(0.000001);
    expect(toEtherFixed(0.00000001)).toBe('<0.000001');
    expect(toEtherFixed(1)).toBe(1);
    expect(toEtherFixed(100)).toBe(100);
    expect(toEtherFixed(10000.00001)).toBe(10000.00001);
    expect(toEtherFixed(10000.00000001)).toBe(10000);
    expect(toEtherFixed(10000.0000006)).toBe(10000.000001);
  });
});
