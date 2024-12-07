import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { Call, Network } from 'magic-passport/types';

export function getCollectionName(config: { calls: Call[]; network: Network }) {
  const { network, calls } = config;
  const publicClient = KernelClientService.getPublicClient({ network });
  return publicClient.readContract({
    address: calls[0].to,
    abi: [
      {
        inputs: [],
        name: 'name',
        outputs: [{ type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'name',
  });
}
