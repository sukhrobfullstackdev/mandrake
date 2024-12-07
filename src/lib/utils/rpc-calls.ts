/* istanbul ignore file */

import { isErc1155Contract, isErc721Contract } from '@lib/passport-utils/is-nft-contract';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { keccak256, toUtf8Bytes } from 'ethers';
import { Call, CallEncoded, CallUnencoded } from 'magic-passport/types';
import { decodeCallData, isPassportEncodedData } from 'magic-passport/viem';

// Research and architecture of call encoding and classification here https://www.notion.so/magiclabs/Payloads-in-mandrake-eth_sendUserOperation-10cad65b2b7080ebb014dd390167257c?pvs=4

// We need to reverse engineer the callData to determine if the function is something we're supporting explicitly.
export function extractFunctionSignature(abi: string) {
  // Remove the 'function ' keyword and any trailing spaces
  abi = abi.replace(/function\s+/, '');

  // Use regex to match the function name and parameter types
  const match = abi.match(/(\w+)\s*\((.*?)\)/);
  if (match) {
    const functionName = match[1]; // Extract the function name
    const args = match[2] // Extract the arguments
      .split(',')
      .map(arg => arg.trim().split(' ')[0]) // Remove names from arg types
      .join(','); // Join the types back together
    return keccak256(toUtf8Bytes(`${functionName}(${args})`)).slice(0, 10); // Return formatted string
  }
  return keccak256(toUtf8Bytes(abi)).slice(0, 10);
}

// Have a bunch of known signatures, like mint, that we're gunna support.
export enum FunctionABIs {
  // NFT minting functions
  Mint = 'function mint(address to, uint256 tokenId)',
  MintWithTokenURI = 'mintWithTokenURI(address to, uint256 tokenId, string tokenURI)',
  // ... add more as needed
}

export enum CallClassification {
  Transfer,
  UnknownEncoded,
  UnknownDecoded,
}

export enum UserOperationType {
  NativeTokenTransfer = 'NativeTokenTransfer',
  USDCTokenTransfer = 'USDCTokenTransfer',
  NFTMint = 'NFTMint',
  USDCTokenNFTMint = 'USDCTokenNFTMint',
  Generic = 'Generic',
}

export type ClassifiedCall = Call & { callClassification: CallClassification };

const isTransferCall = (call: Partial<CallEncoded & CallUnencoded>) => {
  return call.to && call.value && !call.data;
};

const classifyCall = (call: Call) => {
  if (isTransferCall(call)) {
    return CallClassification.Transfer;
  }
  return CallClassification.UnknownEncoded;
};

export const enrichCallsWithCallClassification = (calls: Call[]): ClassifiedCall[] => {
  return calls.map((call: Call) => {
    return { ...call, callClassification: classifyCall(call) };
  });
};

/**
 *
 * @param payload takes an rpc payload's params
 * @returns a list of decoded user operation calls that can be handled by UI, null if the format of the params does not contain recognizable or decodeable calls
 */
export const getCallsFromParams = (params?: JsonRpcRequestPayload['params']): Call[] | null => {
  const callData = params[0]?.callData;
  if (callData && isPassportEncodedData(callData)) {
    // handle viem transport by decoding calldata
    const decodedData = decodeCallData(callData);
    if (Array.isArray(decodedData)) {
      // check that decoded data is a valid array
      return decodedData;
    }
  }
  if (params[0]?.calls) {
    return params[0].calls;
  }

  return null;
};

/**
 *
 * @param payload takes an rpc payload's params
 * @returns a list of decoded user operation calls that can be handled by UI, null if the format of the params does not contain recognizable or decodeable calls
 */
export const getClassifiedCallsFromParams = (params?: JsonRpcRequestPayload['params']): ClassifiedCall[] | null => {
  if (!params) return null;
  const calls = getCallsFromParams(params);
  if (calls) {
    return enrichCallsWithCallClassification(calls);
  }

  return null;
};

export const classifyUserOperation = async (params?: JsonRpcRequestPayload['params']) => {
  if (!params) return null;
  const calls = getCallsFromParams(params);
  if (!calls) return null;

  // If we are dealing with multiple calls, we will classify as generic
  if (calls.length > 1) return UserOperationType.Generic;

  const firstCall = calls[0] as Partial<CallEncoded & CallUnencoded>;

  // Single call user ops.
  const functionSignature = firstCall.data?.slice(0, 10);

  // Case: Mint NFT with native gas token or free mint
  if (
    functionSignature === extractFunctionSignature(FunctionABIs.Mint) ||
    functionSignature === extractFunctionSignature(FunctionABIs.MintWithTokenURI)
  ) {
    const isErc721Promise = isErc721Contract(firstCall.to);
    const isErc1155Promise = isErc1155Contract(firstCall.to);
    const [isErc721, isErc1155] = await Promise.all([isErc721Promise, isErc1155Promise]);
    if (isErc721 || isErc1155) {
      return UserOperationType.NFTMint;
    }
  }
  // Handle other supported erc methods here.

  // Case: Native Token Transfer
  if (!firstCall.data && !!firstCall.value) {
    return UserOperationType.NativeTokenTransfer;
  }

  return UserOperationType.Generic;
};
