/* istanbul ignore file */
import { getTotalValueInWei } from '@app/passport/libs/format_data_field';
import { useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { useTokenFormatter } from '@hooks/common/token-formatter';
import { usePassportStore } from '@hooks/data/passport/store';
import { multiply } from '@lib/ledger/evm/utils/bn-math';
import { getNativeTokenMetadata, getTokenPriceUSD } from '@lib/utils/token';
import { Call, Network } from 'magic-passport/types';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

export const useUserOperationValue = ({
  calls,
  selectedTokenSymbol = 'ETH',
}: {
  calls: Call[] | null;
  selectedTokenSymbol?: string;
}) => {
  const [sendAmountUsd, setSendAmountUsd] = useState<number>();
  const [sendAmountToken, setSendAmountToken] = useState<number>();
  const { formattedValue: sendAmountUsdFormatted } = useCurrencyFormatter({ value: sendAmountUsd as number });
  const sendAmountTokenFormatted = useTokenFormatter({ value: sendAmountToken as number, token: selectedTokenSymbol });
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const networkNativeToken = getNativeTokenMetadata(network);
  const networkNativeTokenPriceUSD = getTokenPriceUSD(networkNativeToken.symbol);

  useEffect(() => {
    if (!calls) return;
    const amountNativeToken = getTotalValueInWei(calls);
    let amountUsdInWei;
    // This is always the same, regardless of which token is selected to pay with
    if (amountNativeToken && networkNativeTokenPriceUSD) {
      amountUsdInWei = multiply(amountNativeToken, networkNativeTokenPriceUSD);
      setSendAmountUsd(Number(formatEther(amountUsdInWei)));
    }

    if (selectedTokenSymbol === networkNativeToken.symbol) {
      setSendAmountToken(Number(formatEther(amountNativeToken)));
    } else if (amountUsdInWei) {
      const tokenPrice = getTokenPriceUSD(selectedTokenSymbol);
      const amountToken = multiply(amountUsdInWei, tokenPrice);
      setSendAmountToken(Number(formatEther(amountToken)));
    }
  }, [calls, selectedTokenSymbol]);
  return { sendAmountUsd, sendAmountToken, sendAmountUsdFormatted, sendAmountTokenFormatted };
};
