/* istanbul ignore file */
import { formatDataField, getTotalValueInWei } from '@app/passport/libs/format_data_field';
import { getCustomNonce } from '@app/passport/libs/nonce';
import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { KernelClientCallData } from '@custom-types/passport';
import { convertWeiToUsdcMicro, NETWORK_ID_CEX_ADDRESS, USDC_CONTRACT_ADDRESS } from '@hooks/passport/use-cex';
import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
import { multiply } from '@lib/ledger/evm/utils/bn-math';
import { calculatePassportNetworkFeeInWei } from '@lib/passport-utils/passport-network-fee';
import { getNativeTokenMetadata, getTokenPriceUSD } from '@lib/utils/token';
import { Call, Hex, Network } from 'magic-passport/types';
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { EntryPoint } from 'permissionless/types';
import { encodeFunctionData, erc20Abi, formatEther } from 'viem';

export interface NetworkFee {
  networkFeeNativeToken: string;
  networkFeeUsd: number;
}

export const estimateNonCabUserOpGasFee = async (
  smartAccount: PassportSmartAccount,
  network: Network,
  calls: Call[],
): Promise<NetworkFee> => {
  const userOpCalls = [] as KernelClientCallData[];
  for (const call of calls) {
    userOpCalls.push({ to: call.to, value: BigInt(call.value || 0), data: formatDataField(call) });
  }
  const { kernelClient } = KernelClientService.getCABKernelClient({ smartAccount, network });

  if (!kernelClient) throw new Error('useEstimateNetworkFee: Kernel client not found');

  const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07 as EntryPoint));
  const userOperation = await kernelClient.prepareUserOperationRequest({
    // the type here is needed because of the complex typing that disallows the initCode being set,
    // but this leads to on chain errors if not set to initCode: '0x'
    userOperation: {
      callData: await smartAccount.encodeCallData(userOpCalls),
      initCode: '0x',
      nonce: await getCustomNonce(smartAccount),
    } as Parameters<typeof kernelClient.prepareUserOperationRequest>[0]['userOperation'] & { initCode: '0x' },
    account: kernelClient.account,
  });
  const gasPrice = await bundlerClient?.getUserOperationGasPrice();
  const fee = await bundlerClient?.estimateUserOperationGas({
    userOperation: { ...userOperation },
  });
  if (!gasPrice || !fee) throw new Error('Error estimating network fee.');
  const networkFeeWei = calculatePassportNetworkFeeInWei(gasPrice, fee);
  // Need to scale price up to avoid doing math operations on decimals
  // (i.e. cannot do bn-math on MATIC price of 0.4 as a bigint);
  const nativeTokenPriceUsd = getTokenPriceUSD(getNativeTokenMetadata(network)?.symbol);
  const nativeTokenPriceScaled = BigInt(Math.round(nativeTokenPriceUsd * 1000));
  const networkFeeWeiUsdScaled = multiply(networkFeeWei, nativeTokenPriceScaled);
  const nativeFeeWeiUsd = networkFeeWeiUsdScaled / BigInt(1000);
  return {
    networkFeeNativeToken: formatEther(networkFeeWei),
    networkFeeUsd: Number(formatEther(nativeFeeWeiUsd)),
  };
};

export const estimateCabUserOpGasFee = async (
  smartAccount: PassportSmartAccount,
  network: Network,
  calls: Call[],
): Promise<NetworkFee> => {
  const userOpCalls = [] as KernelClientCallData[];
  for (const call of calls) {
    userOpCalls.push({ to: call.to, value: BigInt(call.value || 0), data: formatDataField(call) });
  }

  const { cabClient } = KernelClientService.getCABKernelClient({ smartAccount, network });
  if (!cabClient) throw new Error('useEstimateNetworkFee: Kernel client not found');

  let gasOfCexOperation = 0;

  const valueAmountWei = getTotalValueInWei(calls);
  if (valueAmountWei !== BigInt(0)) {
    const usdcAmountMicro = convertWeiToUsdcMicro(valueAmountWei);
    const cexCalls = [
      {
        to: USDC_CONTRACT_ADDRESS as Hex,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [NETWORK_ID_CEX_ADDRESS[network.id], BigInt(usdcAmountMicro)],
        }),
        value: BigInt(0),
      },
    ];

    // TODO: extract this out to constants once we start supporting other kinds of repay tokens.
    const { repayTokensInfo: cexCallRepayTokenInfo } = await cabClient.prepareUserOperationRequestCAB({
      calls: cexCalls,
      repayTokens: ['6TEST'],
      userOperation: { nonce: await getCustomNonce(smartAccount) },
    });
    gasOfCexOperation = cexCallRepayTokenInfo.reduce((acc, curr) => Number(curr.amount) + acc, 0) - usdcAmountMicro;
  }

  const { repayTokensInfo: baseCallRepayTokenInfo } = await cabClient.prepareUserOperationRequestCAB({
    calls: userOpCalls,
    repayTokens: ['6TEST'],
    userOperation: { nonce: await getCustomNonce(smartAccount) },
  });

  const total = gasOfCexOperation + Number(baseCallRepayTokenInfo[0]?.amount);

  // TODO: extract this out to constants once we start supporting other kinds of repay tokens.
  const usdcDecimals = 6;

  const usdcAmount = total / 10 ** usdcDecimals; // Convert usdcMicro to USDC

  const nativeTokenPriceUsd = getTokenPriceUSD(getNativeTokenMetadata(network)?.symbol);

  return {
    networkFeeNativeToken: (usdcAmount / nativeTokenPriceUsd).toFixed(14),
    networkFeeUsd: total / 10 ** usdcDecimals,
  };
};
