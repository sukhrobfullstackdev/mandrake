/* istanbul ignore file */
import { newtonSepolia } from 'magic-passport/networks';
import { Chain, arbitrumSepolia, baseSepolia, polygonAmoy, sepolia } from 'viem/chains';

export const networkZerodevProjectIds: Record<number, string> = {
  [sepolia.id]: '83775916-4bae-4dae-bcc0-9328d4a532e8', // eth sepolia
  [baseSepolia.id]: '13ee58ce-0fa5-41fc-9135-d3b12d12f87a', // base sepolia
  [polygonAmoy.id]: 'f7a1e942-c4fa-428e-802c-0721bce16855', // polygon amoy
  [arbitrumSepolia.id]: '94f6fafa-430f-46e1-a223-200d3dba1d5a', // arbitrum sepolia
  [newtonSepolia.id]: '418a8fd2-2308-49db-9f0a-4c9a21672a24', // newton sepolia
} as const;

export const NetworkIdViemChainMap: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
  [polygonAmoy.id]: polygonAmoy,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [newtonSepolia.id]: newtonSepolia,
} as const;
