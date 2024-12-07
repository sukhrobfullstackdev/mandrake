import AdditionalTokenItem from '@components/show-ui/additional-token-item';
import { useChainInfo } from '@hooks/common/chain-info';
import { useSendRouter } from '@hooks/common/send-router';
import { useBalanceInUsd, useNativeTokenBalance } from '@hooks/common/show-ui';
import { useErc20Balances } from '@hooks/common/token';
import { useTokenFormatter } from '@hooks/common/token-formatter';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { TokenBalances } from '@hooks/data/embedded/token';
import { TokenListItem } from '@magiclabs/ui-components';
import { Box, Divider, VStack } from '@styled/jsx';
import { useEffect, useMemo, useState } from 'react';

interface TokenListProps {
  isSendTokensPage?: boolean;
}

const compare = (a: TokenBalances, b: TokenBalances) => {
  if (a.logo) {
    return -1;
  }
  if (b.logo) {
    return 1;
  }
  return 0;
};

const TokenList = ({ isSendTokensPage }: TokenListProps) => {
  const { tokenBalances, isTokenBalancesFetched, isTokenBalancesRefetching } = useErc20Balances();
  const publicAddress = useUserMetadata().userMetadata?.publicAddress;
  const { chainInfo } = useChainInfo();
  const router = useSendRouter();
  const [tokens, setTokens] = useState<TokenBalances[] | undefined>();
  const nativeBalance = useNativeTokenBalance(publicAddress || '');
  const usdBalance = useBalanceInUsd(publicAddress || '');
  const TokenIcon = chainInfo?.tokenIcon;
  const formattedNativeBalance = useTokenFormatter({ value: nativeBalance, token: chainInfo?.currency });

  const sortedTokenBalances = useMemo(() => {
    const filteredTokenBalances = tokens?.filter(item => item.rawBalance !== '0');
    return filteredTokenBalances?.sort(compare);
  }, [tokens]);

  useEffect(() => {
    if (isTokenBalancesFetched) {
      setTokens(tokenBalances?.tokens);
    }
  }, [isTokenBalancesFetched, isTokenBalancesRefetching]);

  const handlePress = () => {
    router.replace('/send/rpc/wallet/magic_wallet/compose_transaction');
  };

  return (
    <VStack my={isSendTokensPage ? 0 : 4} w="full" maxH={96} overflow="auto">
      <TokenListItem
        name={chainInfo?.name || ''}
        fiatBalanceWithSymbol={usdBalance}
        tokenBalanceWithSymbol={formattedNativeBalance}
        onPress={isSendTokensPage ? handlePress : undefined}
      >
        <TokenListItem.TokenIcon>{TokenIcon && <TokenIcon />}</TokenListItem.TokenIcon>
      </TokenListItem>
      {sortedTokenBalances?.map(token => (
        <Box w="full" key={token.symbol}>
          {!isSendTokensPage && <Divider color="neutral.tertiary" mb={2.5} />}
          <AdditionalTokenItem token={token} isSendTokensPage={isSendTokensPage} />
        </Box>
      ))}
    </VStack>
  );
};

export default TokenList;
