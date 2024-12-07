import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { usePassportStore } from '@hooks/data/passport/store';

const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

const SUPPORTS_INTERFACE_ABI = [
  {
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export async function isErc721Contract(contractAddress: `0x${string}` | undefined) {
  if (!contractAddress) return false;
  const { network } = usePassportStore.getState().decodedQueryParams;
  if (!network) return false;

  const client = KernelClientService.getPublicClient({ network });

  try {
    const supportsERC721 = await client.readContract({
      address: contractAddress,
      abi: SUPPORTS_INTERFACE_ABI,
      functionName: 'supportsInterface',
      args: [ERC721_INTERFACE_ID],
    });

    return supportsERC721;
  } catch (error) {
    return false;
  }
}

export async function isErc1155Contract(contractAddress: `0x${string}` | undefined) {
  if (!contractAddress) return false;
  const { network } = usePassportStore.getState().decodedQueryParams;
  if (!network) return false;

  const client = KernelClientService.getPublicClient({ network });

  try {
    const supportsERC1155 = await client.readContract({
      address: contractAddress,
      abi: SUPPORTS_INTERFACE_ABI,
      functionName: 'supportsInterface',
      args: [ERC1155_INTERFACE_ID],
    });

    return supportsERC1155;
  } catch (error) {
    return false;
  }
}
