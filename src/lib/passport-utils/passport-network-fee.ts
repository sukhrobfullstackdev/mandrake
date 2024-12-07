import { multiply } from '@lib/ledger/evm/utils/bn-math';

export const calculatePassportNetworkFeeInWei = (
  gasPrice: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  },
  fee: {
    preVerificationGas: bigint;
    verificationGasLimit: bigint;
    callGasLimit: bigint;
    paymasterVerificationGasLimit?: bigint | undefined;
    paymasterPostOpGasLimit?: bigint | undefined;
  },
): bigint => {
  const totalGas =
    fee.preVerificationGas +
    fee.verificationGasLimit +
    fee.callGasLimit +
    (fee.paymasterVerificationGasLimit || BigInt(0)) +
    (fee.paymasterPostOpGasLimit || BigInt(0));

  const networkFeeWei = multiply(totalGas, gasPrice.maxFeePerGas);
  return networkFeeWei;
};
