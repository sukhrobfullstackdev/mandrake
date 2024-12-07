import { parseAbi } from 'viem';

export const toEtherFixed = (value: string | number = 0, fixed = 6) => {
  const MINIMUM_VALUE = 0.000001;
  const numberValue = +value;

  if (numberValue < MINIMUM_VALUE) {
    return `<${MINIMUM_VALUE}`;
  }

  return parseFloat(numberValue.toFixed(fixed));
};

export const toUsd = (price: number) => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
};

export const getMintingAbi = (tokenType: string, functionName: string) => {
  let rawAbi: string;
  if (tokenType === 'ERC1155') {
    rawAbi = `function ${functionName}(uint256 _quantity, uint256 _tokenId) external payable`;
  } else {
    rawAbi = `function ${functionName}() external payable`;
  }

  return parseAbi([rawAbi]);
};

export const truncateEmail = (str: string, length: number) => {
  return str.length > length ? `${str.slice(0, length)}...` : str;
};
