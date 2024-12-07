import { TOKENS } from '@app/passport/constants/passport-tokens';
import { getTotalValueInWei } from '@app/passport/libs/format_data_field';
import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { useTokenFormatter } from '@hooks/common/token-formatter';
import { usePassportStore } from '@hooks/data/passport/store';
import { useNativeTokenBalance, useUsdcBalance } from '@hooks/passport/token';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { DrawerTokenMetadata, getTokenPriceUSD } from '@lib/utils/token';
import { CallEncoded, CallUnencoded } from 'magic-passport/types';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { formatEther, parseEther } from 'viem';

export function checkBalance(sendAmount: bigint, networkFee: bigint, balance: bigint) {
  const totalRequired = sendAmount + networkFee;
  return {
    enoughForSendAmount: balance >= totalRequired || balance >= sendAmount,
    enoughForFee: balance >= totalRequired || (balance < sendAmount && balance >= networkFee),
    amountNeededForTransaction: balance >= totalRequired ? BigInt(0) : totalRequired - balance,
  };
}

function getUSDCBaseUnits(
  networkFeeWei: bigint,
  sendAmountWei: bigint,
  ethPriceUSD: number,
): { networkFeeInBaseUnits: bigint; sendAmountInBaseUnits: bigint } {
  const ethPriceScaled = BigInt(Math.round(ethPriceUSD * 1000));
  const sendAmountInBaseUnits = (sendAmountWei * ethPriceScaled) / BigInt(1e15);
  const networkFeeInBaseUnits = (networkFeeWei * ethPriceScaled) / BigInt(1e15);
  return { sendAmountInBaseUnits, networkFeeInBaseUnits };
}

interface UseCheckBalanceProps {
  calls: (CallEncoded | CallUnencoded)[] | null;
  networkFeeNativeToken: string | undefined;
  token: DrawerTokenMetadata;
}

export const useCheckBalance = ({ calls, networkFeeNativeToken, token }: UseCheckBalanceProps) => {
  const { t } = useTranslation('passport');
  const { smartAccount } = useSmartAccount();
  const { network } = usePassportStore(state => state.decodedQueryParams);
  const [amountNeeded, setAmountNeeded] = useState<number>(0);
  const amountNeededFormatted = useTokenFormatter({ value: amountNeeded, token: token.symbol });
  const [hasEnoughForFee, setHasEnoughForFee] = useState<boolean>(true);
  const [hasEnoughForSendAmount, setHasEnoughForSendAmount] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchBalanceError, setFetchBalanceError] = useState<string | null>(null);

  const { data: nativeBalanceEth } = useNativeTokenBalance();
  const { data: usdcBalance } = useUsdcBalance();

  useEffect(() => {
    const getBalanceDetails = async () => {
      setIsLoading(true);

      const invalidInputs =
        !calls ||
        !network ||
        !smartAccount ||
        !networkFeeNativeToken ||
        (token.symbol === TOKENS.MATIC && nativeBalanceEth === undefined) ||
        (token.symbol === TOKENS.ETH && nativeBalanceEth === undefined) ||
        (token.symbol === TOKENS.USDC && usdcBalance === undefined);

      if (invalidInputs) {
        return;
      }

      // For native token transactions, network fee is sponsored
      if (token.isNativeToken) {
        networkFeeNativeToken = '0';
      }

      try {
        const { kernelClient } = await KernelClientService.getCABKernelClient({
          smartAccount,
          network,
        });

        if (!kernelClient) throw new Error('useCheckBalance: Kernel client not found');

        setFetchBalanceError(null);

        const sendAmountInWei = getTotalValueInWei(calls);
        const networkFeeInWei = parseEther(networkFeeNativeToken as string);

        if (token.symbol === TOKENS.ETH || token.symbol === TOKENS.MATIC) {
          const balanceInWei = parseEther((nativeBalanceEth as string).toString());
          const { enoughForFee, enoughForSendAmount, amountNeededForTransaction } = checkBalance(
            sendAmountInWei,
            networkFeeInWei,
            balanceInWei,
          );

          setHasEnoughForFee(enoughForFee);
          setHasEnoughForSendAmount(enoughForSendAmount);

          if (amountNeededForTransaction > BigInt(0)) {
            setAmountNeeded(Number(formatEther(amountNeededForTransaction)));
            setFetchBalanceError(
              `${t('You need at least')} ${amountNeededFormatted} ${t('more for this transaction')}.`,
            );
          } else {
            setFetchBalanceError(null);
          }

          setIsLoading(false);
          return;
        }

        if (token.symbol === TOKENS.USDC) {
          const ethPriceUSD = getTokenPriceUSD(network.nativeCurrency.symbol);
          const { sendAmountInBaseUnits, networkFeeInBaseUnits } = getUSDCBaseUnits(
            networkFeeInWei,
            sendAmountInWei,
            ethPriceUSD,
          );

          const { enoughForFee, enoughForSendAmount, amountNeededForTransaction } = checkBalance(
            sendAmountInBaseUnits,
            networkFeeInBaseUnits,
            usdcBalance!,
          );

          setHasEnoughForFee(enoughForFee);
          setHasEnoughForSendAmount(enoughForSendAmount);

          if (amountNeededForTransaction > BigInt(0)) {
            // Format for USDC's 6 decimals
            setAmountNeeded(Number(amountNeededForTransaction) / 1_000_000);
            setFetchBalanceError(
              `${t('You need at least')} ${amountNeededFormatted} ${t('more for this transaction')}.`,
            );
          } else {
            setFetchBalanceError(null);
          }

          setIsLoading(false);
          return;
        }
      } catch (error) {
        logger.error(`Send user op balance check error: ${(error as Error).message}`, { error });
        setIsLoading(false);
      }
    };

    getBalanceDetails();
  }, [smartAccount, calls, networkFeeNativeToken, nativeBalanceEth, token]);

  return {
    hasEnoughForFee,
    hasEnoughForSendAmount,
    isLoading,
    error: fetchBalanceError,
  };
};
