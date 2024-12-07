/* istanbul ignore file */
import { NetworkIdViemChainMap } from '@app/passport/constants/network';
import { getCustomNonce } from '@app/passport/libs/nonce';
import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { useCheckRateLimitStatusMutation, useConvertMutation } from '@hooks/data/passport/newton-exchange';
import { usePassportStore } from '@hooks/data/passport/store';
import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
import { getTokenPriceUSD } from '@lib/utils/token';
import { KernelCABClient } from '@zerodev/cab';
import { newtonSepolia } from 'magic-passport/networks';
import { Hex } from 'magic-passport/types';
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { EntryPoint } from 'permissionless/types';
import { Chain, createPublicClient, encodeFunctionData, erc20Abi, http, Transport } from 'viem';
import { baseSepolia, sepolia } from 'viem/chains';

function generateRandomTxnHash() {
  // Check if crypto.getRandomValues is available
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    // Create a Uint8Array of 32 bytes (256 bits)
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);

    // Convert each byte to a hexadecimal string and join them together
    const hash = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Return with the 0x prefix
    return ('0x' + hash) as Hex;
  } else {
    // Fallback: Generate a random 66-character hex string using Math.random()
    const randomHex = Array.from({ length: 64 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');

    return ('0x' + randomHex) as Hex;
  }
}

export const NETWORK_ID_CEX_ADDRESS: Record<number, Hex> = {
  [sepolia.id]: '0xe6fB75EA170E30c35C3dc277A33F892f6B65a0A1',
  [baseSepolia.id]: '0xe6fB75EA170E30c35C3dc277A33F892f6B65a0A1',
  [newtonSepolia.id]: '0xe6fB75EA170E30c35C3dc277A33F892f6B65a0A1',
} as const;

export const USDC_CONTRACT_ADDRESS = '0x3870419Ba2BBf0127060bCB37f69A1b1C090992B';

// The CEX will not be available on any other chain.
export const CEX_SUPPORTED_NETWORK_IDS = [sepolia.id as number, baseSepolia.id as number, newtonSepolia.id as number];

type PassportCABClient = KernelCABClient<typeof ENTRYPOINT_ADDRESS_V07, Transport, Chain, PassportSmartAccount>;

export const convertWeiToUsdcMicro = (weiAmount: bigint) => {
  // NOTE: This CEX is only on Newton testnet or eth sepolia testnet
  // So we don't need to worry about MATIC/POL
  const ethToUsdcRate = getTokenPriceUSD('ETH');
  const ethAmount = Number(weiAmount) / 10 ** 18;
  const usdcAmount = ethAmount * ethToUsdcRate;
  const usdcMicroAmount = usdcAmount * 10 ** 6;
  return Math.round(usdcMicroAmount); // Return as an integer value
};

export const useCEX = ({ smartAccount }: { smartAccount?: PassportSmartAccount }) => {
  const accessToken = usePassportStore(state => state.accessToken) || '';
  const network = usePassportStore(state => state.decodedQueryParams.network);

  const { mutateAsync: checkRateLimitStatusAsync } = useCheckRateLimitStatusMutation();
  const { mutateAsync: convertAsync } = useConvertMutation();

  const checkRateLimit = async () => {
    try {
      await checkRateLimitStatusAsync();
    } catch (e) {
      throw new Error(PassportPageErrorCodes.ERROR_CHECKING_CEX_RATE_LIMIT);
    }
  };

  const sendUsdcToCex = async (usdcAmountMicro: number, cabClient: PassportCABClient) => {
    if (!smartAccount) throw new Error('Smart account not found');
    if (!network) throw new Error('Network not found');

    const calls = [
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

    const { userOperation } = await cabClient.prepareUserOperationRequestCAB({
      calls,
      repayTokens: ['6TEST'],
      userOperation: { nonce: await getCustomNonce(smartAccount) },
    });
    const userOpHash = (await cabClient.sendUserOperationCAB({ userOperation })) as Hex;

    return userOpHash;
  };

  const requestExchange = async (usdcSentTxnHash: Hex, smartAccountAddress: Hex, value: string) => {
    const body = {
      wallet_address: smartAccountAddress,
      input_transaction_id: usdcSentTxnHash,
      input_chain_id: network?.id.toString() || '11155111',
      value,
    };
    const res = await convertAsync(body);
    return res.transactionId as Hex;
  };

  // Entry point
  const exchangeUsdcToEth = async (weiAmount: bigint) => {
    if (!accessToken) throw new Error('Access token not found');
    if (!smartAccount) throw new Error('Smart account not found');
    if (!network) throw new Error('Network not found');

    await checkRateLimit();

    const publicClient = createPublicClient({
      chain: NetworkIdViemChainMap[network.id] as Chain,
      transport: http(),
    });

    const usdcAmountMicro = convertWeiToUsdcMicro(weiAmount);

    const { cabClient, kernelClient } = KernelClientService.getCABKernelClient({ smartAccount, network });
    if (!kernelClient) throw new Error('Kernel client not found');
    if (!cabClient) throw new Error('CAB client not found');

    const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07 as EntryPoint));

    if (!bundlerClient) throw new Error('Bundler client not found');

    sendUsdcToCex(usdcAmountMicro, cabClient);

    const txnHash = generateRandomTxnHash();

    const ethDepositHash = await requestExchange(txnHash, smartAccount.address, usdcAmountMicro.toString());

    await publicClient.waitForTransactionReceipt({ hash: ethDepositHash });
  };

  return { exchangeUsdcToEth };
};
