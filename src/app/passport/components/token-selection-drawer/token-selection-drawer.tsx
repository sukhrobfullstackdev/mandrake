/* istanbul ignore file */
import { NetworkIdViemChainMap } from '@app/passport/constants/network';
import { usePassportStore } from '@hooks/data/passport/store';
import { useNativeTokenBalance, useUsdcBalance } from '@hooks/passport/token';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { DrawerTokenMetadata, getDrawerTokens, getTokenPriceUSD } from '@lib/utils/token';
import { PassportPage, TokenListItem } from '@magiclabs/ui-components';
import { Stack } from '@styled/jsx';
import { Network } from 'magic-passport/types';
import { useEffect, useMemo, useState } from 'react';
import { formatUnits, parseEther } from 'viem';

const FALLBACK_TOKEN_VALUE = '0';

const TokenSelectionDrawer = ({
  isOpen,
  setIsOpen,
  handleSelectSendToken,
  cabClientTokensDisabled = false,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSelectSendToken: (token: DrawerTokenMetadata) => () => void;
  cabClientTokensDisabled?: boolean;
}) => {
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const [tokenBalances, setTokenBalances] = useState<null | { [tokenSymbol: string]: bigint }>(null);
  const { smartAccount, isLoading: isLoadingSmartAccount } = useSmartAccount();
  const { data: usdcInWei, isLoading: isLoadingUsdcBalance } = useUsdcBalance();
  const { data: nativeBalance } = useNativeTokenBalance();

  const drawerTokens = getDrawerTokens(network);

  useEffect(() => {
    if (isLoadingSmartAccount || !smartAccount || isLoadingUsdcBalance || usdcInWei === undefined) return;
    if (!smartAccount?.address || !network.id || !NetworkIdViemChainMap[network.id].nativeCurrency.symbol) return;
    const popupateTokenBalances = () => {
      setTokenBalances({
        [NetworkIdViemChainMap[network.id].nativeCurrency.symbol]: nativeBalance
          ? BigInt(parseEther(nativeBalance))
          : BigInt(0),
        USDC: usdcInWei,
      });
    };
    popupateTokenBalances();
  }, [isLoadingSmartAccount, isLoadingUsdcBalance, nativeBalance]);

  const drawerTokensInfo: Record<string, { tokenBalanceFormatted: string; fiatBalanceFormatted: string }> =
    useMemo(() => {
      const result: Record<string, { tokenBalanceFormatted: string; fiatBalanceFormatted: string }> = {};
      drawerTokens.forEach(token => {
        const tokenBalance =
          tokenBalances?.[token.symbol] !== undefined
            ? formatUnits(tokenBalances[token.symbol], token.decimals)
            : undefined;
        const fiatBalanceFormatted = (
          tokenBalance ? `$${getTokenPriceUSD(token.symbol) * parseFloat(tokenBalance)}` : FALLBACK_TOKEN_VALUE
        ).substring(0, 12);
        const tokenBalanceFormatted = `${(tokenBalance ?? FALLBACK_TOKEN_VALUE).substring(0, 12)} ${token.symbol}`;
        result[token.symbol] = { tokenBalanceFormatted, fiatBalanceFormatted };
      });
      return result;
    }, [tokenBalances]);

  return (
    <PassportPage.Drawer isOpen={isOpen} onToggle={setIsOpen} title="Pay with...">
      <Stack gap={2}>
        {drawerTokens.map(token => {
          return (
            <TokenListItem
              key={token.name}
              name={`${token.name}`}
              fiatBalanceWithSymbol={drawerTokensInfo[token.symbol].fiatBalanceFormatted}
              tokenBalanceWithSymbol={drawerTokensInfo[token.symbol].tokenBalanceFormatted}
              onPress={handleSelectSendToken(token)}
              tokenBalanceFirst
              disabled={token.needsCabClient && cabClientTokensDisabled}
            >
              <TokenListItem.TokenIcon>{token.icon}</TokenListItem.TokenIcon>
            </TokenListItem>
          );
        })}
      </Stack>
    </PassportPage.Drawer>
  );
};

export default TokenSelectionDrawer;
