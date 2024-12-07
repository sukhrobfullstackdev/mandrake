import { useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { useSendRouter } from '@hooks/common/send-router';
import { useTokenPrice } from '@hooks/common/token';
import { useTokenFormatter } from '@hooks/common/token-formatter';
import { TokenBalances } from '@hooks/data/embedded/token';
import { TokenListItem } from '@magiclabs/ui-components';
import { useEffect, useState } from 'react';

interface AdditionalTokenItemProps {
  token: TokenBalances;
  isSendTokensPage?: boolean;
}

const AdditionalTokenItem = ({ token, isSendTokensPage }: AdditionalTokenItemProps) => {
  const router = useSendRouter();
  const [tokenBalanceInUsd, setTokenBalanceInUsd] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState('');
  const { tokenPriceData, isTokenPriceFetched, isTokenPriceRefetching } = useTokenPrice(token.symbol);
  const { formattedValue: formattedUsdBalance } = useCurrencyFormatter({ value: tokenBalanceInUsd });
  const formattedNativeBalance = useTokenFormatter({ value: Number(token.balance), token: token.symbol });

  const getWalletBalance = () => {
    const usdBalance = Number(token.balance) * Number(tokenPrice);
    setTokenBalanceInUsd(usdBalance);
  };

  useEffect(() => {
    if (!isTokenPriceFetched || !tokenPriceData) return;
    setTokenPrice(tokenPriceData.toCurrencyAmountDisplay);
  }, [tokenPriceData, isTokenPriceFetched, isTokenPriceRefetching]);

  useEffect(() => {
    if (!tokenPrice || !token.rawBalance) return;
    getWalletBalance();
  }, [token.rawBalance, tokenPrice]);

  const handlePress = () => {
    const params = `transactionType=${encodeURIComponent('erc20-transfer')}
    &symbol=${encodeURIComponent(token.symbol)}
    &decimals=${encodeURIComponent(token.decimals)}
    &contractAddress=${encodeURIComponent(token.contractAddress)}
    &balanceInWei=${encodeURIComponent(token.rawBalance)}
    &logo=${encodeURIComponent(token.logo || '')}`;

    router.replace(`/send/rpc/wallet/magic_wallet/compose_transaction?${params}`);
  };

  return (
    <TokenListItem
      name={token.name}
      fiatBalanceWithSymbol={formattedUsdBalance}
      tokenBalanceWithSymbol={formattedNativeBalance}
      logoUrl={token.logo}
      onPress={isSendTokensPage ? handlePress : undefined}
    />
  );
};

export default AdditionalTokenItem;
