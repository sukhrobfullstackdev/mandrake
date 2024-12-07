import { Abi, AbiFunction } from 'viem';

function findFunctionInABI(abi: Abi, functionName: string) {
  return abi.find(item => {
    const itemTyped = item as AbiFunction;
    return itemTyped.name === functionName && itemTyped.type === 'function';
  }) as AbiFunction;
}

function normalizeFunction(func: AbiFunction) {
  if (!func) return null;
  const { inputs, outputs, ...rest } = func;
  return {
    ...rest,
    inputs: inputs
      ? inputs
          .map(input => ({ type: input.type, name: input.name }))
          .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : -1))
      : [],
    outputs: outputs
      ? outputs
          .map(output => ({ type: output.type, name: output.name }))
          .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : -1))
      : [],
  };
}

export function areAbiFunctionsEqual(abi1: Abi, abi2: Abi, functionName: string) {
  const abiFunc1 = findFunctionInABI(abi1, functionName);
  const abiFunc2 = findFunctionInABI(abi2, functionName);

  if (!abiFunc1 || !abiFunc2) return null;

  const normalizedFunc1 = normalizeFunction(abiFunc1);
  const normalizedFunc2 = normalizeFunction(abiFunc2);

  return JSON.stringify(normalizedFunc1) === JSON.stringify(normalizedFunc2);
}
