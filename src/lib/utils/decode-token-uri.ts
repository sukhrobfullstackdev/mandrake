import { extractFunctionSignature, FunctionABIs } from '@lib/utils/rpc-calls';
import { decodeAbiParameters, parseAbiParameters } from 'viem';

export function extractTokenURI(data: string): string {
  const functionSignature = data.slice(0, 10);
  if (functionSignature === extractFunctionSignature(FunctionABIs.MintWithTokenURI)) {
    // Remove the function signature so we are just left with the arguments
    const argsFromTxData = '0x' + data.slice(10);
    const abiParams = parseAbiParameters('address to, uint256 tokenId, string tokenURI');
    const [, , tokenURI] = decodeAbiParameters(abiParams, argsFromTxData as `0x${string}`);
    return tokenURI;
  }
  return '';
}
