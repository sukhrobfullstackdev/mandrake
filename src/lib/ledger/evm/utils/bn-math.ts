import { BigNumberish, formatEther, formatUnits, getBigInt, parseEther } from 'ethers';

/**
 * Used to multiply a BN by a fraction
 *
 * @param {bigint} targetBN - The number to multiply by a fraction
 * @param {number|string} numerator - The numerator of the fraction multiplier
 * @param {number|string} denominator - The denominator of the fraction multiplier
 * @returns {bigint} The product of the multiplication
 *
 */
export const BnMultiplyByFraction = (
  targetBN: bigint,
  numerator: number | string,
  denominator: number | string,
): bigint => {
  const numBN = getBigInt(numerator);
  const denomBN = getBigInt(denominator);
  return (targetBN * numBN) / denomBN;
};

export const getFiatValue = (wei: bigint, price: string): number => {
  const priceBN = parseEther(price);
  const valueBN = wei * priceBN;
  // Ethers appends `.0` to the end of the string, so we need to remove it
  const valueInWei = formatUnits(valueBN).split('.')[0];
  const valueInEth = formatEther(valueInWei);
  // Convert back to dollars
  return Number(valueInEth);
};

export const fromWeiToEth = (wei: string): string => {
  return formatEther(wei);
};

export const add = (numOne: BigNumberish, numTwo: BigNumberish): bigint => {
  return getBigInt(numOne) + getBigInt(numTwo);
};

export const subtract = (numOne: BigNumberish, numTwo: BigNumberish): bigint => {
  return getBigInt(numOne) - getBigInt(numTwo);
};

export const multiply = (numOne: BigNumberish, numTwo: BigNumberish): bigint => {
  return getBigInt(numOne) * getBigInt(numTwo);
};

export const divide = (numOne: BigNumberish, numTwo: BigNumberish): bigint => {
  return getBigInt(numOne) / getBigInt(numTwo);
};

export const isGreaterThan = (numOne: BigNumberish, numTwo: BigNumberish): boolean => {
  return getBigInt(numOne) > getBigInt(numTwo);
};

export const isGreaterThanOrEqualTo = (numOne: BigNumberish, numTwo: BigNumberish): boolean => {
  return getBigInt(numOne) >= getBigInt(numTwo);
};
