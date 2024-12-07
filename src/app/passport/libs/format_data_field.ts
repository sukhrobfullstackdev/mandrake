import { Call, CallEncoded, CallUnencoded, Hex } from 'magic-passport/types';
import { encodeFunctionData } from 'viem';

export const formatDataField = (call: Partial<CallEncoded & CallUnencoded>) => {
  let data = '0x' as Hex;
  if (call?.data) {
    data = call.data;
  } else if (call.abi && call.functionName) {
    const encodedData = call.args
      ? encodeFunctionData({ abi: call.abi, functionName: call.functionName, args: call.args })
      : encodeFunctionData({ abi: call.abi, functionName: call.functionName });
    data = encodedData as Hex;
  }
  return data;
};

export const getTotalValueInWei = (calls: Call[] | undefined) => {
  if (!calls) return BigInt(0);
  return calls.reduce((total, call) => {
    if (call.value !== undefined) {
      return total + BigInt(call.value);
    }
    return total;
  }, BigInt(0));
};
