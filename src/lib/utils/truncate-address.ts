import { getAddress, isAddress } from 'ethers';

export default function truncateAddress(address: string) {
  const trimmedAddress = address.trim();
  if (!isAddress(trimmedAddress)) return trimmedAddress;
  const checksumAddress = getAddress(trimmedAddress);
  return `${checksumAddress.slice(0, 6)}...${checksumAddress.slice(-4)}`;
}
